import { expect, test } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.route("https://api.open-meteo.com/**", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  )
  await page.goto("/")
})

test("기억 ID 유지, 삭제 후 ID 중복 방지, 저장 실패 전달", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const service = await import("/src/services/memoryService.ts")
    const { memoryStorage: storage } = await import(
      "/src/services/memoryStorage.ts"
    )
    const item = {
      date: "2026-10-06",
      date_label: "10월 6일",
      title: "검증",
      question: "질문",
      input_type: "text",
      original_text: "친구를 만났어요",
      display_text: "친구를 만났어요",
      character_mode: "boy",
    }
    const a = await service.saveMemory(item)
    const b = await service.saveMemory(item)
    await service.deleteMemory(a.id)
    const c = await service.saveMemory(item)
    const list = await service.getMemories()
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key === "senior_helper_memory_state_v4")
        throw new DOMException("Full", "QuotaExceededError")
      return original.call(this, key, value)
    }
    let failed = false
    try {
      await service.saveMemory(item)
    } catch {
      failed = true
    } finally {
      Storage.prototype.setItem = original
    }
    return {
      ids: list.map((item) => item.id),
      expected: [b.id, c.id],
      countAfterFailure: storage.getMemories().length,
      failed,
      deleted: storage.getDeleted().map((item) => item.id),
      a: a.id,
    }
  })
  expect(result.ids.sort()).toEqual(result.expected.sort())
  expect(new Set(result.ids).size).toBe(2)
  expect(result.countAfterFailure).toBe(2)
  expect(result.failed).toBe(true)
  expect(result.deleted).toContain(result.a)
})

test("한국 새벽의 날짜를 현지 날짜로 저장", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-06T00:30:00+09:00") })
  expect(
    await page.evaluate(async () =>
      (await import("/src/utils/date.ts")).localDateKey(),
    ),
  ).toBe("2026-10-06")
  await page.reload()
  await expect(page.getByText("10월 6일 화요일", { exact: true })).toBeVisible()
  await expect(
    page.getByText("날씨를 가져오지 못했어요. 잠시 뒤 새로고침해 주세요.", {
      exact: true,
    }),
  ).toBeVisible()
})

test("음성 확정 문장 누적과 실제 녹음 MIME 유지", async ({ page }) => {
  const result = await page.evaluate(async () => {
    let recognition: any,
      stopped = false
    ;(window as any).SpeechRecognition = class {
      onresult: any
      onend: any
      constructor() {
        recognition = this
      }
      start() {}
      stop() {
        this.onend?.()
      }
      abort() {}
    }
    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        getUserMedia: async () => ({
          getTracks: () => [
            {
              stop: () => {
                stopped = true
              },
            },
          ],
        }),
      },
    })
    ;(window as any).MediaRecorder = class {
      state = "inactive"
      mimeType = "audio/mp4"
      onstop: any
      ondataavailable: any
      start() {
        this.state = "recording"
      }
      stop() {
        this.state = "inactive"
        this.ondataavailable?.({
          data: new Blob(["audio"], { type: "audio/mp4" }),
        })
        this.onstop?.()
      }
    }
    const voice = await import("/src/services/voiceRecordService.ts")
    await voice.recordVoice()
    recognition.onresult({
      resultIndex: 0,
      results: [[{ transcript: "첫 문장." }]],
    })
    recognition.onresult({
      resultIndex: 1,
      results: [
        [{ transcript: "첫 문장." }],
        [{ transcript: "두 번째 문장." }],
      ],
    })
    const result = await voice.stopRecording()
    return { text: result.transcript, type: result.audioBlob?.type, stopped }
  })
  expect(result).toEqual({
    text: "첫 문장. 두 번째 문장.",
    type: "audio/mp4",
    stopped: true,
  })
})

test("권한 요청 중 취소하면 늦게 도착한 마이크도 해제", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      let resolve: any,
        stopped = false
      Object.defineProperty(navigator, "mediaDevices", {
        value: {
          getUserMedia: () =>
            new Promise((r) => {
              resolve = r
            }),
        },
      })
      const voice = await import("/src/services/voiceRecordService.ts")
      const starting = voice.recordVoice()
      voice.cancelRecording()
      resolve({
        getTracks: () => [
          {
            stop: () => {
              stopped = true
            },
          },
        ],
      })
      return { started: await starting, stopped }
    }),
  ).toEqual({ started: false, stopped: true })
})

test("분석 서버 실패·잘못된 응답에서 조작 안내를 만들지 않음", async ({
  page,
}) => {
  await page.route("**/webhook/analyze-appliance", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  )
  let result = await page.evaluate(async () =>
    (await import("/src/services/applianceService.ts")).analyzeApplianceImage(
      new Blob(["photo"]),
    ),
  )
  expect(result.success).toBe(false)
  expect(result.instructions).toEqual([])
  expect(result.confidence).toBeUndefined()
  await page.unroute("**/webhook/analyze-appliance")
  await page.route("**/webhook/analyze-appliance", (route) =>
    route.fulfill({
      json: { success: true, device_name: "기기", instructions: [42] },
    }),
  )
  result = await page.evaluate(async () =>
    (await import("/src/services/applianceService.ts")).analyzeApplianceImage(
      new Blob(["photo"]),
    ),
  )
  expect(result.success).toBe(false)
  expect(result.instructions).toEqual([])
})

test("선 긋기는 시작점부터 경로를 따라야 통과", async ({ page }) => {
  await page
    .getByRole("button", { name: "두뇌 운동 화면으로 이동", exact: true })
    .click()
  await page
    .getByRole("button", { name: "2. 선 따라 긋기", exact: true })
    .click()
  const box = (await page.locator("canvas").boundingBox())!
  await page.mouse.move(box.x + box.width - 48, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width - 46, box.y + box.height / 2)
  await page.mouse.up()
  await expect(page.getByText("1단계 / 10단계", { exact: true })).toBeVisible()
  await page.mouse.move(box.x + 45, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width - 45, box.y + box.height / 2, {
    steps: 60,
  })
  await page.mouse.up()
  await expect(page.getByText("2단계 / 10단계", { exact: true })).toBeVisible()
})

test("소리·불빛 훈련이 입력 가능 상태로 전환하고 다음 단계 진행", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (e) => errors.push(e.message))
  await page.evaluate(() => {
    Math.random = () => 0
  })
  await page
    .getByRole("button", { name: "두뇌 운동 화면으로 이동", exact: true })
    .click()
  await page
    .getByRole("button", { name: "4. 기억력 게임", exact: true })
    .click()
  const pad = page.getByRole("button", { name: "패드 1", exact: true })
  await expect(pad).toBeEnabled({ timeout: 6000 })
  await pad.click()
  await pad.click()
  await pad.click()
  await expect(page.getByText("2단계 / 10단계", { exact: true })).toBeVisible()
  await page
    .getByRole("button", { name: "메뉴로 돌아가기", exact: true })
    .click()
  await page.waitForTimeout(3000)
  expect(errors).toEqual([])
})

test("기억 작성 화면에서 저장한 글을 다시 불러옴", async ({ page }) => {
  await page
    .getByRole("button", { name: "나의 기억 화면으로 이동", exact: true })
    .click()
  await page
    .getByRole("button", { name: "오늘의 기억 남기기", exact: true })
    .click()
  await page.getByRole("button", { name: "글로 기록하기", exact: true }).click()
  await page.locator("textarea").fill("오늘 가족과 즐겁게 이야기했어요.")
  await page.getByRole("button", { name: "기억에 저장", exact: true }).click()
  await page.reload()
  await page
    .getByRole("button", { name: "나의 기억 화면으로 이동", exact: true })
    .click()
  await expect(
    page.getByText("“오늘 가족과 즐겁게 이야기했어요.”", { exact: true }),
  ).toBeVisible()
})

test("인식 결과가 없으면 가짜 기억 대신 빈 입력과 재입력 안내", async ({
  page,
}) => {
  await page.evaluate(() => {
    ;(window as any).SpeechRecognition = class {
      onend: any
      start() {}
      stop() {
        this.onend?.()
      }
      abort() {}
    }
    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        getUserMedia: async () => ({ getTracks: () => [{ stop() {} }] }),
      },
    })
    ;(window as any).MediaRecorder = class {
      state = "inactive"
      mimeType = "audio/mp4"
      onstop: any
      ondataavailable: any
      start() {
        this.state = "recording"
      }
      stop() {
        this.state = "inactive"
        this.ondataavailable?.({
          data: new Blob(["audio"], { type: "audio/mp4" }),
        })
        this.onstop?.()
      }
    }
  })
  await page
    .getByRole("button", { name: "나의 기억 화면으로 이동", exact: true })
    .click()
  await page
    .getByRole("button", { name: "오늘의 기억 남기기", exact: true })
    .click()
  await page
    .getByRole("button", { name: "말로 이야기하기", exact: true })
    .click()
  await page.getByRole("button", { name: "녹음 끝내기", exact: true }).click()
  await expect(page.getByRole("alert")).toContainText(
    "말씀을 글로 알아듣지 못했어요",
  )
  await expect(page.locator("textarea")).toHaveValue("")
  await expect(
    page.getByRole("button", { name: "기억에 저장", exact: true }),
  ).toBeDisabled()
})

test("저장 공간 부족 시 작성 내용을 유지하고 실패를 표시", async ({ page }) => {
  await page
    .getByRole("button", { name: "나의 기억 화면으로 이동", exact: true })
    .click()
  await page
    .getByRole("button", { name: "오늘의 기억 남기기", exact: true })
    .click()
  await page.getByRole("button", { name: "글로 기록하기", exact: true }).click()
  await page.locator("textarea").fill("잃으면 안 되는 이야기")
  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key === "senior_helper_memory_state_v4")
        throw new DOMException("Full", "QuotaExceededError")
      return original.call(this, key, value)
    }
  })
  await page.getByRole("button", { name: "기억에 저장", exact: true }).click()
  await expect(page.getByRole("alert")).toContainText("저장하지 못했어요")
  await expect(page.locator("textarea")).toHaveValue("잃으면 안 되는 이야기")
  await expect(
    page.getByRole("button", { name: "기억에 저장", exact: true }),
  ).toBeEnabled()
})

test("손자·손녀 영상 자동 재생과 터치 소리 전환", async ({ page }) => {
  const video = page.locator("video")
  const assertPlaying = async (mode: "boy" | "girl") => {
    await expect(video).toHaveAttribute("src", new RegExp(`${mode}\\.mp4`))
    await expect
      .poll(() =>
        video.evaluate((element) => ({
          width: element.videoWidth,
          height: element.videoHeight,
          paused: element.paused,
          muted: element.muted,
          advanced: element.currentTime > 0,
        })),
      )
      .toEqual({
        width: 1280,
        height: 720,
        paused: false,
        muted: true,
        advanced: true,
      })
  }
  await assertPlaying("boy")
  await video.evaluate((element) => {
    ;(window as any).playingVideo = element
  })
  await video.click()
  await expect
    .poll(() =>
      video.evaluate((element) => ({
        same: (window as any).playingVideo === element,
        muted: element.muted,
        paused: element.paused,
      })),
    )
    .toEqual({ same: true, muted: false, paused: false })
  await video.click()
  await expect.poll(() => video.evaluate((element) => element.muted)).toBe(true)
  await page
    .getByRole("button", { name: "손녀와 함께 선택", exact: true })
    .click()
  await assertPlaying("girl")
  await page
    .getByRole("button", { name: "손자와 함께 선택", exact: true })
    .click()
  await assertPlaying("boy")
})
