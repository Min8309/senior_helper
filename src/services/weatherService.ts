export interface WeatherLocation {
  id: string
  label: string
  latitude: number
  longitude: number
}
export interface CurrentWeather {
  location: WeatherLocation
  temperature: number
  apparentTemperature: number
  humidity: number
  code: number
  isDay: boolean
  observedAt: number
  fetchedAt: number
}

export const WEATHER_LOCATIONS: WeatherLocation[] = [
  { id: "seoul", label: "서울", latitude: 37.57, longitude: 126.98 },
  { id: "busan", label: "부산", latitude: 35.18, longitude: 129.08 },
  { id: "daegu", label: "대구", latitude: 35.87, longitude: 128.6 },
  { id: "incheon", label: "인천", latitude: 37.46, longitude: 126.71 },
  { id: "gwangju", label: "광주", latitude: 35.16, longitude: 126.85 },
  { id: "daejeon", label: "대전", latitude: 36.35, longitude: 127.38 },
  { id: "ulsan", label: "울산", latitude: 35.54, longitude: 129.31 },
  { id: "sejong", label: "세종", latitude: 36.48, longitude: 127.29 },
  { id: "suwon", label: "수원", latitude: 37.26, longitude: 127.03 },
  { id: "chuncheon", label: "춘천", latitude: 37.88, longitude: 127.73 },
  { id: "cheongju", label: "청주", latitude: 36.64, longitude: 127.49 },
  { id: "hongseong", label: "홍성", latitude: 36.6, longitude: 126.66 },
  { id: "jeonju", label: "전주", latitude: 35.82, longitude: 127.15 },
  { id: "muan", label: "무안", latitude: 34.99, longitude: 126.48 },
  { id: "andong", label: "안동", latitude: 36.57, longitude: 128.73 },
  { id: "changwon", label: "창원", latitude: 35.23, longitude: 128.68 },
  { id: "jeju", label: "제주", latitude: 33.5, longitude: 126.53 },
]

export const WEATHER_REFRESH_MS = 10 * 60 * 1000
export const WEATHER_STALE_MS = 30 * 60 * 1000
const LOCATION_KEY = "senior_helper_weather_location_v1"
const CACHE_KEY = "senior_helper_weather_cache_v1"

function validLocation(value: unknown): value is WeatherLocation {
  if (!value || typeof value !== "object") return false
  const location = value as WeatherLocation
  return (
    typeof location.id === "string" &&
    typeof location.label === "string" &&
    location.label.length > 0 &&
    Number.isFinite(location.latitude) &&
    Math.abs(location.latitude) <= 90 &&
    Number.isFinite(location.longitude) &&
    Math.abs(location.longitude) <= 180
  )
}

export function getWeatherLocation(): WeatherLocation {
  try {
    const saved = JSON.parse(localStorage.getItem(LOCATION_KEY) || "null")
    if (validLocation(saved)) return saved
  } catch {
    /* 저장소 미지원 시 서울 기준 */
  }
  return WEATHER_LOCATIONS[0]
}

export function saveWeatherLocation(location: WeatherLocation) {
  if (!validLocation(location)) throw new Error("지역 정보를 확인할 수 없어요.")
  try {
    localStorage.setItem(LOCATION_KEY, JSON.stringify(location))
  } catch {
    /* 현재 화면에서 계속 사용 */
  }
}

function validWeather(value: unknown): value is CurrentWeather {
  if (!value || typeof value !== "object") return false
  const weather = value as CurrentWeather
  return (
    validLocation(weather.location) &&
    Number.isFinite(weather.temperature) &&
    Number.isFinite(weather.apparentTemperature) &&
    Number.isFinite(weather.humidity) &&
    weather.humidity >= 0 &&
    weather.humidity <= 100 &&
    Number.isInteger(weather.code) &&
    typeof weather.isDay === "boolean" &&
    Number.isFinite(weather.observedAt) &&
    weather.observedAt > 0 &&
    Number.isFinite(weather.fetchedAt) &&
    weather.fetchedAt > 0
  )
}

export function readWeatherCache(
  location = getWeatherLocation(),
): CurrentWeather | null {
  try {
    const cache: unknown = JSON.parse(localStorage.getItem(CACHE_KEY) || "null")
    if (
      validWeather(cache) &&
      cache.location.latitude === location.latitude &&
      cache.location.longitude === location.longitude
    )
      return cache
  } catch {
    /* 손상된 캐시는 사용하지 않습니다. */
  }
  return null
}

export function isWeatherStale(
  weather: CurrentWeather,
  now = Date.now(),
): boolean {
  return (
    now - weather.fetchedAt > WEATHER_STALE_MS ||
    now - weather.observedAt > WEATHER_STALE_MS ||
    weather.observedAt > now + 5 * 60 * 1000
  )
}

export async function fetchCurrentWeather(
  location: WeatherLocation,
  signal: AbortSignal,
): Promise<CurrentWeather> {
  if (!validLocation(location)) throw new Error("지역 정보를 확인할 수 없어요.")
  const url = new URL("https://api.open-meteo.com/v1/forecast")
  url.search = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day",
    temperature_unit: "celsius",
    timezone: "auto",
    timeformat: "unixtime",
    forecast_days: "1",
  }).toString()
  const response = await fetch(url, {
    signal,
    credentials: "omit",
    referrerPolicy: "no-referrer",
  })
  if (!response.ok) throw new Error("날씨 정보를 가져오지 못했어요.")
  const data = await response.json()
  const current = data?.current
  const weather: CurrentWeather = {
    location,
    temperature: current?.temperature_2m,
    apparentTemperature: current?.apparent_temperature,
    humidity: current?.relative_humidity_2m,
    code: current?.weather_code,
    isDay: current?.is_day === 1,
    observedAt: current?.time * 1000,
    fetchedAt: Date.now(),
  }
  if (
    !validWeather(weather) ||
    ![0, 1].includes(current?.is_day) ||
    data?.current_units?.temperature_2m !== "°C" ||
    data?.current_units?.apparent_temperature !== "°C" ||
    data?.current_units?.relative_humidity_2m !== "%" ||
    data?.current_units?.time !== "unixtime"
  ) {
    throw new Error("날씨 정보를 확인하지 못했어요.")
  }
  return weather
}

export function cacheWeather(weather: CurrentWeather) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(weather))
  } catch {
    /* 저장 실패가 표시를 막지 않습니다. */
  }
}

export interface WeatherDescription {
  label: string
  icon: string
}

export function weatherDescription(
  code: number,
  isDay = true,
): WeatherDescription {
  if (code === 0) return { label: "맑음", icon: isDay ? "☀️" : "🌙" }
  if ([1, 2].includes(code))
    return { label: "구름 조금", icon: isDay ? "🌤️" : "☁️" }
  if (code === 3) return { label: "흐림", icon: "☁️" }
  if ([45, 48].includes(code)) return { label: "안개", icon: "🌫️" }
  if ([51, 53, 55, 56, 57].includes(code)) return { label: "이슬비", icon: "🌦️" }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return { label: "비", icon: "🌧️" }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: "눈", icon: "🌨️" }
  if ([95, 96, 99].includes(code)) return { label: "뇌우", icon: "⛈️" }
  return { label: "날씨 확인 중", icon: "🌡️" }
}

export function weatherAnswer(): string {
  const location = getWeatherLocation()
  const weather = readWeatherCache(location)
  if (!weather || isWeatherStale(weather))
    return "지금 날씨를 확인하지 못했어요. 홈 화면의 날씨에서 지역을 선택하고 새로고침해 주세요."
  const description = weatherDescription(weather.code, weather.isDay)
  return `${location.label} 기준 현재 날씨는 ${description.label}이에요. 기온은 ${Math.round(weather.temperature)}도, 체감온도는 ${Math.round(weather.apparentTemperature)}도, 습도는 ${Math.round(weather.humidity)}퍼센트예요.`
}
