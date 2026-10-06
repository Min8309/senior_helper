import { test } from "node:test"
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { PGlite } from "@electric-sql/pglite"

test("SQL migration is repeatable and isolates users and private audio", async () => {
  const db = new PGlite()
  try {
    await db.exec(`
      CREATE ROLE authenticated;
      CREATE ROLE anon;
      CREATE SCHEMA auth;
      CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
        SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
      $$;
      CREATE SCHEMA storage;
      CREATE TABLE storage.buckets (id text PRIMARY KEY, name text, public boolean);
      CREATE TABLE storage.objects (id uuid DEFAULT gen_random_uuid(), bucket_id text, name text);
      ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
      CREATE FUNCTION storage.foldername(name text) RETURNS text[] LANGUAGE sql AS $$ SELECT string_to_array(name, '/'); $$;
    `)
    const sql = await readFile(
      new URL("../supabase_schema.sql", import.meta.url),
      "utf8",
    )
    await db.exec(sql)
    // Simulate the previous public policy, then verify the migration removes it.
    await db.exec(
      `CREATE POLICY "Allow public read memories" ON public.memories FOR SELECT USING (true);`,
    )
    await db.exec(sql)
    await db.exec(`
      GRANT USAGE ON SCHEMA public, auth, storage TO authenticated, anon;
      GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public, storage TO authenticated, anon;
      INSERT INTO memories(id,user_id,date,title,question,input_type,original_text,display_text)
      VALUES ('a','00000000-0000-4000-8000-000000000001','2026-10-06','a','q','text','private','private'),
             ('b','00000000-0000-4000-8000-000000000002','2026-10-06','b','q','text','private','private');
      INSERT INTO storage.objects(bucket_id,name) VALUES ('memory-audio','00000000-0000-4000-8000-000000000001/a.webm'),
      ('memory-audio','00000000-0000-4000-8000-000000000002/b.webm');
      SET ROLE authenticated;
      SET request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';
    `)
    assert.deepEqual((await db.query("SELECT id FROM memories")).rows, [
      { id: "a" },
    ])
    assert.equal(
      (await db.query("SELECT * FROM storage.objects")).rows.length,
      1,
    )
    assert.equal(
      (await db.query("DELETE FROM memories WHERE id='b' RETURNING id")).rows
        .length,
      0,
    )
    await assert.rejects(
      db.query(`INSERT INTO memories(id,user_id,date,title,question,input_type,original_text,display_text)
      VALUES ('attack','00000000-0000-4000-8000-000000000002','2026-10-06','a','q','text','x','x')`),
      /row-level security/,
    )
    await assert.rejects(
      db.query(
        `INSERT INTO storage.objects(bucket_id,name) VALUES ('memory-audio','00000000-0000-4000-8000-000000000002/attack.webm')`,
      ),
      /row-level security/,
    )
    await db.exec("RESET ROLE; SET ROLE anon;")
    assert.equal((await db.query("SELECT * FROM memories")).rows.length, 0)
    assert.equal(
      (await db.query("SELECT * FROM storage.objects")).rows.length,
      0,
    )
    await db.exec("RESET ROLE;")
    assert.equal(
      (
        await db.query(
          "SELECT public FROM storage.buckets WHERE id='memory-audio'",
        )
      ).rows[0].public,
      false,
    )
  } finally {
    await db.close()
  }
})
