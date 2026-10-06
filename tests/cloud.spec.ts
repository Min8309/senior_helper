import { expect, test } from "@playwright/test"

const USER = "00000000-0000-4000-8000-000000000001"

test("동기화 재시도·동일 ID·오프라인 보존·음성 삭제 재시도", async ({
  page,
}) => {
  const rows = new Map<string, any>()
  let failWrite = true,
    failRemove = false
  const uploads: string[] = [],
    removed: string[] = [],
    writes: any[] = []
  const jwt = `${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString("base64url")}.${Buffer.from(JSON.stringify({ sub: USER, role: "authenticated", exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url")}.test`
  await page.route("https://test.supabase.co/**", async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (request.method() === "OPTIONS") {
      await route.fulfill({
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-headers": "*",
          "access-control-allow-methods": "*",
        },
      })
      return
    }
    const json = async (data: unknown, status = 200) =>
      route.fulfill({
        status,
        json: data,
        headers: { "access-control-allow-origin": "*" },
      })
    if (url.pathname === "/auth/v1/signup") {
      await json({
        access_token: jwt,
        refresh_token: "test-refresh",
        token_type: "bearer",
        expires_in: 3600,
        user: {
          id: USER,
          aud: "authenticated",
          role: "authenticated",
          is_anonymous: true,
        },
      })
      return
    }
    if (url.pathname === "/auth/v1/user") {
      await json({
        id: USER,
        aud: "authenticated",
        role: "authenticated",
        is_anonymous: true,
      })
      return
    }
    if (url.pathname === "/rest/v1/memories") {
      expect(request.headers().authorization).toBe(`Bearer ${jwt}`)
      if (request.method() === "POST") {
        const data = request.postDataJSON()
        writes.push(data)
        expect(data.user_id).toBe(USER)
        expect(data.audio_data_url).toBeUndefined()
        if (failWrite) {
          await json({ message: "Temporary failure" }, 503)
          return
        }
        rows.set(data.id, data)
        await json(null, 201)
        return
      }
      expect(url.searchParams.get("user_id")).toBe(`eq.${USER}`)
      if (request.method() === "DELETE") {
        rows.delete(url.searchParams.get("id")!.slice(3))
        await json(null)
        return
      }
      await json([...rows.values()])
      return
    }
    if (url.pathname === "/storage/v1/object/memory-audio") {
      if (failRemove) {
        await json({ message: "Temporary failure" }, 503)
        return
      }
      removed.push(...request.postDataJSON().prefixes)
      await json([])
      return
    }
    if (url.pathname.startsWith("/storage/v1/object/sign/")) {
      await json({
        signedURL: "/object/sign/memory-audio/test?token=short-lived",
      })
      return
    }
    if (url.pathname.startsWith("/storage/v1/object/memory-audio/")) {
      uploads.push(url.pathname)
      expect(request.headers()["content-type"]).toContain("multipart/form-data")
      expect(request.postDataBuffer()!.toString()).toContain(
        "Content-Type: audio/mp4",
      )
      await json({ Key: url.pathname }, 200)
      return
    }
    throw new Error(`Unexpected request: ${request.method()} ${url.pathname}`)
  })
  await page.route("https://api.open-meteo.com/**", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  )
  await page.goto("/")
  const saved = await page.evaluate(async () => {
    const service = await import("/src/services/memoryService.ts")
    return service.saveMemory({
      date: "2026-10-06",
      date_label: "10월 6일",
      title: "offline",
      question: "질문",
      input_type: "text",
      original_text: "저장 내용",
      display_text: "저장 내용",
      character_mode: "boy",
    })
  })
  expect(saved.sync_pending).toBe(true)
  expect(
    await page.evaluate(async () =>
      (await import("/src/services/memoryService.ts"))
        .getMemories()
        .then((items) => items.map((item) => item.id)),
    ),
  ).toContain(saved.id)
  rows.set("existing", {
    ...saved,
    id: "existing",
    title: "existing",
    user_id: USER,
    sync_pending: undefined,
  })
  failWrite = false
  const merged = await page.evaluate(async () =>
    (await import("/src/services/memoryService.ts")).getMemories(),
  )
  expect(merged.map((item) => item.id).sort()).toEqual(
    ["existing", saved.id].sort(),
  )
  expect(rows.get(saved.id).original_text).toBe("저장 내용")
  expect(writes.every((item) => item.id === saved.id)).toBe(true)
  await page.evaluate(
    async (id) =>
      (await import("/src/services/memoryService.ts")).updateMemory(id, {
        original_text: "수정",
        display_text: "수정",
      }),
    saved.id,
  )
  expect(rows.get(saved.id).original_text).toBe("수정")
  const voice = await page.evaluate(async () =>
    (await import("/src/services/memoryService.ts")).saveMemory(
      {
        date: "2026-10-06",
        date_label: "10월 6일",
        title: "voice",
        question: "질문",
        input_type: "voice",
        original_text: "음성",
        display_text: "음성",
        character_mode: "boy",
      },
      new Blob(["audio"], { type: "audio/mp4" }),
    ),
  )
  expect(uploads[0]).toContain(`/${USER}/${voice.id}.mp4`)
  failRemove = true
  await page.evaluate(
    async (item) =>
      (await import("/src/services/memoryService.ts")).deleteMemory(
        item.id,
        item.audio_path,
      ),
    voice,
  )
  expect(rows.has(voice.id)).toBe(true)
  expect(
    await page.evaluate(async () =>
      (await import("/src/services/memoryService.ts"))
        .getMemories()
        .then((items) => items.map((item) => item.id)),
    ),
  ).not.toContain(voice.id)
  failRemove = false
  await page.evaluate(async () =>
    (await import("/src/services/memoryService.ts")).getMemories(),
  )
  expect(rows.has(voice.id)).toBe(false)
  expect(removed).toContain(`${USER}/${voice.id}.mp4`)
  expect(
    await page.evaluate(async () =>
      (
        await import("/src/services/memoryStorage.ts")
      ).memoryStorage.getDeleted(),
    ),
  ).toEqual([])
})
