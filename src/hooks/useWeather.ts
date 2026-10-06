import { useCallback, useEffect, useRef, useState } from "react"
import {
  cacheWeather,
  fetchCurrentWeather,
  getWeatherLocation,
  readWeatherCache,
  saveWeatherLocation,
  WEATHER_REFRESH_MS,
  type CurrentWeather,
  type WeatherLocation,
} from "../services/weatherService"

export function useWeather() {
  const [location, setLocation] = useState(getWeatherLocation)
  const [weather, setWeather] = useState<CurrentWeather | null>(() =>
    readWeatherCache(),
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState("")
  const [now, setNow] = useState(Date.now)
  const request = useRef<AbortController | null>(null)
  const sequence = useRef(0)
  const locationRequest = useRef(0)

  const refresh = useCallback(async () => {
    request.current?.abort()
    const controller = new AbortController()
    const id = ++sequence.current
    request.current = controller
    setLoading(true)
    setError("")
    const timeout = setTimeout(() => controller.abort(), 8000)
    try {
      const result = await fetchCurrentWeather(location, controller.signal)
      if (id !== sequence.current) return
      setWeather(result)
      cacheWeather(result)
      setNow(Date.now())
    } catch {
      if (id === sequence.current)
        setError("날씨를 가져오지 못했어요. 잠시 뒤 새로고침해 주세요.")
    } finally {
      clearTimeout(timeout)
      if (id === sequence.current) setLoading(false)
    }
  }, [location])

  useEffect(() => {
    setWeather(readWeatherCache(location))
    void refresh()
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") void refresh()
    }, WEATHER_REFRESH_MS)
    const wake = () => {
      if (document.visibilityState === "visible") void refresh()
    }
    window.addEventListener("online", wake)
    document.addEventListener("visibilitychange", wake)
    return () => {
      sequence.current++
      request.current?.abort()
      clearInterval(interval)
      window.removeEventListener("online", wake)
      document.removeEventListener("visibilitychange", wake)
    }
  }, [location, refresh])

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000)
    return () => {
      clearInterval(timer)
      locationRequest.current++
    }
  }, [])

  const selectLocation = (next: WeatherLocation) => {
    locationRequest.current++
    setLocating(false)
    setLocationError("")
    sequence.current++
    request.current?.abort()
    setWeather(readWeatherCache(next))
    setError("")
    saveWeatherLocation(next)
    setLocation(next)
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        "이 기기에서는 위치를 확인할 수 없어요. 지역을 직접 선택해 주세요.",
      )
      return
    }
    const id = ++locationRequest.current
    setLocating(true)
    setLocationError("")
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (id !== locationRequest.current) return
        selectLocation({
          id: "current",
          label: "내 위치",
          latitude: Number(position.coords.latitude.toFixed(2)),
          longitude: Number(position.coords.longitude.toFixed(2)),
        })
      },
      () => {
        if (id !== locationRequest.current) return
        setLocating(false)
        setLocationError("위치를 확인하지 못했어요. 지역을 직접 선택해 주세요.")
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60 * 1000 },
    )
  }

  return {
    location,
    weather,
    loading,
    error,
    locating,
    locationError,
    now,
    refresh,
    selectLocation,
    useCurrentLocation,
  }
}
