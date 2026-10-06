import { expect, test } from "@playwright/test"

const endpoint = "https://api.open-meteo.com/**"
function response(temperature = 21.4) {
  return {
    current_units: {
      time: "unixtime",
      temperature_2m: "°C",
      apparent_temperature: "°C",
      relative_humidity_2m: "%",
    },
    current: {
      time: Math.floor(Date.now() / 1000),
      temperature_2m: temperature,
      apparent_temperature: 20.2,
      relative_humidity_2m: 67,
      weather_code: 3,
      is_day: 1,
    },
  }
}

test("모바일 화면에 기온·체감온도·습도 표시, 날짜 줄바꿈 방지", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 780 })
  await page.route(endpoint, (route) => {
    const url = new URL(route.request().url())
    expect(url.searchParams.get("current")).toContain("relative_humidity_2m")
    expect(url.searchParams.get("timeformat")).toBe("unixtime")
    return route.fulfill({ json: response() })
  })
  await page.goto("/")
  const panel = page.getByRole("region", { name: "현재 날씨" })
  await expect(panel.getByText("서울 기준", { exact: true })).toBeVisible()
  await expect(panel.getByText("21°C", { exact: true })).toBeVisible()
  await expect(panel.getByText("20°C", { exact: true })).toBeVisible()
  await expect(panel.getByText("67%", { exact: true })).toBeVisible()
  await expect(panel.getByText("흐림", { exact: true })).toBeVisible()
  const layout = await panel.evaluate((element) => {
    const date = element.querySelector("span")!
    return {
      noWrap: getComputedStyle(date).whiteSpace,
      overflow: document.documentElement.scrollWidth > innerWidth,
    }
  })
  expect(layout).toEqual({ noWrap: "nowrap", overflow: false })
})

test("지역 변경은 좌표를 변경하고 재방문에도 유지", async ({ page }) => {
  const coordinates: string[] = []
  await page.route(endpoint, (route) => {
    const url = new URL(route.request().url())
    coordinates.push(url.searchParams.get("latitude")!)
    return route.fulfill({
      json: response(url.searchParams.get("latitude") === "35.18" ? 25 : 21),
    })
  })
  await page.goto("/")
  await expect(page.getByText("21°C", { exact: true })).toBeVisible()
  await page.getByLabel("날씨 지역").selectOption("busan")
  await expect(page.getByText("부산 기준", { exact: true })).toBeVisible()
  await expect(page.getByText("25°C", { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByLabel("날씨 지역")).toHaveValue("busan")
  await expect(page.getByText("25°C", { exact: true })).toBeVisible()
  expect(coordinates).toContain("35.18")
})

test("내 위치 권한 거절 시 안내 후 직접 지역 선택 가능", async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition(
          _success: unknown,
          failure: (error: unknown) => void,
        ) {
          failure({ code: 1 })
        },
      },
    }),
  )
  await page.route(endpoint, (route) => route.fulfill({ json: response() }))
  await page.goto("/")
  await page.getByRole("button", { name: "내 위치 날씨", exact: true }).click()
  await expect(page.getByRole("status")).toContainText(
    "지역을 직접 선택해 주세요",
  )
  await page.getByLabel("날씨 지역").selectOption("jeju")
  await expect(page.getByText("제주 기준", { exact: true })).toBeVisible()
  await expect(page.getByRole("status")).not.toContainText(
    "위치를 확인하지 못했어요",
  )
})

test("내 위치 좌표로 요청하며 이전 지역 응답이 새 위치를 덮지 않음", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition(success: (position: unknown) => void) {
          success({ coords: { latitude: 33.49961, longitude: 126.531188 } })
        },
      },
    }),
  )
  const requested: string[] = []
  await page.route(endpoint, async (route) => {
    const url = new URL(route.request().url())
    const latitude = url.searchParams.get("latitude")!
    requested.push(latitude)
    if (latitude === "37.57") {
      await new Promise((resolve) => setTimeout(resolve, 400))
    }
    try {
      await route.fulfill({ json: response(latitude === "33.5" ? 26 : 10) })
    } catch {
      /* 취소된 이전 지역 요청 */
    }
  })
  await page.goto("/")
  await page.getByRole("button", { name: "내 위치 날씨", exact: true }).click()
  await expect(page.getByText("내 위치 기준", { exact: true })).toBeVisible()
  await expect(page.getByText("26°C", { exact: true })).toBeVisible()
  await page.waitForTimeout(600)
  await expect(page.getByText("10°C", { exact: true })).toHaveCount(0)
  expect(requested).toContain("33.5")
})

test("네트워크 실패 시 마지막 자료 보존·오래된 자료 구분·재시도", async ({
  page,
}) => {
  let fail = false
  const initial = response()
  await page.clock.install({ time: new Date() })
  await page.route(endpoint, (route) =>
    fail
      ? route.fulfill({ status: 503, body: "Unavailable" })
      : route.fulfill({ json: initial }),
  )
  await page.goto("/")
  await expect(page.getByText("21°C", { exact: true })).toBeVisible()
  fail = true
  await page.getByRole("button", { name: "날씨 새로고침", exact: true }).click()
  await expect(page.getByRole("status")).toContainText(
    "날씨를 가져오지 못했어요",
  )
  await expect(page.getByText("21°C", { exact: true })).toBeVisible()
  await page.clock.fastForward(31 * 60 * 1000)
  await expect(page.getByRole("status")).toContainText("최신 정보가 아니에요")
  const answer = await page.evaluate(async () =>
    (await import("/src/services/weatherService.ts")).weatherAnswer(),
  )
  expect(answer).toContain("지금 날씨를 확인하지 못했어요")
  fail = false
  initial.current.time += 31 * 60
  await expect(
    page.getByRole("button", { name: "날씨 새로고침", exact: true }),
  ).toBeEnabled()
  await page.getByRole("button", { name: "날씨 새로고침", exact: true }).click()
  await expect(page.getByRole("status")).not.toContainText(
    "최신 정보가 아니에요",
  )
  await expect(page.getByRole("status")).not.toContainText(
    "날씨를 가져오지 못했어요",
  )
})

test("잘못된 API 수치 거절, 현재 자료로 날씨 답변, 기기 온도 질문 구분", async ({
  page,
}) => {
  let malformed = true
  await page.route(endpoint, (route) =>
    route.fulfill({
      json: {
        ...response(),
        current: {
          ...response().current,
          relative_humidity_2m: malformed ? 999 : 67,
        },
      },
    }),
  )
  await page.goto("/")
  await expect(page.getByRole("status")).toContainText(
    "날씨를 가져오지 못했어요",
  )
  await expect(page.getByText("999%", { exact: true })).toHaveCount(0)
  malformed = false
  await page.getByRole("button", { name: "날씨 새로고침", exact: true }).click()
  await expect(page.getByText("67%", { exact: true })).toBeVisible()
  const result = await page.evaluate(async () => {
    const service = await import("/src/services/aiGrandchild.ts")
    return {
      weather: service.getAiGrandchildAnswer(
        "오늘 온도와 습도가 어때요?",
        "boy",
      ),
      appliance: service.getAiGrandchildAnswer(
        "에어컨 온도는 어떻게 바꿔요?",
        "girl",
      ),
    }
  })
  expect(result.weather.isApplianceQuestion).toBe(false)
  expect(result.weather.answer).toContain("기온은 21도")
  expect(result.weather.answer).toContain("67퍼센트")
  expect(result.appliance.isApplianceQuestion).toBe(true)
})

test("네 가지 홈 기능이 작은 휴대폰 화면 안에 들어가고 촬영 화면으로 이동", async ({ page }) => {
  await page.route(endpoint, route => route.fulfill({ json: response() }))
  for (const viewport of [{ width: 320, height: 568 }, { width: 360, height: 640 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport)
    await page.goto("/")
    await expect(page.getByText("21°C", { exact: true })).toBeVisible()
    const buttons = page.locator('.home-actions button')
    await expect(buttons).toHaveCount(4)
    const fits = await page.evaluate(() => {
      const body = document.querySelector('.home-body')!
      const targets = [...document.querySelectorAll('.home-actions button, nav[aria-label="하단 주 메뉴"]')]
      return body.scrollHeight <= body.clientHeight + 1 && document.documentElement.scrollHeight <= innerHeight + 1 && targets.every(element => {
        const rect = element.getBoundingClientRect()
        return rect.top >= 0 && rect.bottom <= innerHeight && rect.left >= 0 && rect.right <= innerWidth
      })
    })
    expect(fits, `${viewport.width}x${viewport.height}`).toBe(true)
  }
  await page.getByRole('button', { name: '기기 사진 찍기 화면으로 이동', exact: true }).click()
  await expect(page.getByRole('button', { name: '기기 사진 찍기', exact: true })).toBeVisible()
})
