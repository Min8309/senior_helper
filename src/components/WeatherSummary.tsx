import { useState } from "react"
import { useWeather } from "../hooks/useWeather"
import {
  isWeatherStale,
  WEATHER_LOCATIONS,
  weatherDescription,
} from "../services/weatherService"
import { localDateLabel } from "../utils/date"

export default function WeatherSummary() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const {
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
  } = useWeather()
  const description = weather
    ? weatherDescription(weather.code, weather.isDay)
    : null
  const stale = weather ? isWeatherStale(weather, now) : false
  const time = (value: number) =>
    new Intl.DateTimeFormat("ko-KR", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(value)
  const buttonStyle = {
    minHeight: 48,
    padding: "8px",
    borderRadius: 12,
    border: "1px solid #BDD6C6",
    background: "#FFFFFF",
    color: "#1F5D40",
    fontSize: 16,
    fontWeight: 800,
    cursor: "pointer",
  }

  return (
    <section className="weather-summary" aria-label="현재 날씨" style={{ marginBottom: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#4A5568",
            whiteSpace: "nowrap",
          }}
        >
          {localDateLabel(new Date(now))}
        </span>
      </div>
      <div
        style={{
          marginTop: 10,
          padding: "14px 12px",
          borderRadius: 18,
          border: "1px solid #D8E7DC",
          background: "rgba(255,255,255,0.93)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <strong style={{ fontSize: 18, color: "#1F5D40" }}>
            {location.label} 기준
          </strong>
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "#26734D",
              whiteSpace: "nowrap",
            }}
          >
            <span aria-hidden="true">{description?.icon || "🌡️"} </span>
            <span>
              {description?.label ||
                (loading ? "날씨 확인 중" : "날씨 정보 없음")}
            </span>
          </span>
        </div>
        <dl
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 8,
            margin: "10px 0",
          }}
        >
          {[
            {
              label: "기온",
              value: weather ? `${Math.round(weather.temperature)}°C` : "—",
            },
            {
              label: "체감온도",
              value: weather
                ? `${Math.round(weather.apparentTemperature)}°C`
                : "—",
            },
            {
              label: "습도",
              value: weather ? `${Math.round(weather.humidity)}%` : "—",
            },
          ].map((metric) => (
            <div
              key={metric.label}
              style={{
                textAlign: "center",
                background: "#F0F7F2",
                padding: "8px 4px",
                borderRadius: 12,
              }}
            >
              <dt
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#52675A",
                  whiteSpace: "nowrap",
                }}
              >
                {metric.label}
              </dt>
              <dd
                style={{
                  margin: "4px 0 0",
                  fontSize: 22,
                  fontWeight: 900,
                  color: "#1F5D40",
                  whiteSpace: "nowrap",
                }}
              >
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
        <div
          role="status"
          style={{
            fontSize: 14,
            lineHeight: 1.5,
            color: error || stale ? "#9A3412" : "#52675A",
          }}
        >
          {weather && (
            <div>
              {stale || error ? "이전 날씨 · " : "현재 자료 · "}
              {time(weather.observedAt)} 기준
              {stale ? " (최신 정보가 아니에요)" : ""}
            </div>
          )}
          {weather && <div>마지막 갱신 {time(weather.fetchedAt)}</div>}
          {loading && <div>날씨 정보를 가져오는 중이에요.</div>}
          {error && <div>{error}</div>}
          {locationError && <div>{locationError}</div>}
        </div>
        <button className="weather-settings-toggle" aria-expanded={settingsOpen} onClick={() => setSettingsOpen(!settingsOpen)}>날씨 지역 · 새로고침</button>
        <div
          className={`weather-controls ${settingsOpen ? "is-open" : ""}`}
          style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}
        >
          <select
            aria-label="날씨 지역"
            value={location.id}
            onChange={(event) => {
              const selected = WEATHER_LOCATIONS.find(
                (item) => item.id === event.target.value,
              )
              if (selected) selectLocation(selected)
            }}
            style={{ ...buttonStyle, flex: "1 1 100px", minWidth: 0 }}
          >
            {location.id === "current" && (
              <option value="current">내 위치</option>
            )}
            {WEATHER_LOCATIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            aria-label="내 위치 날씨"
            onClick={useCurrentLocation}
            disabled={locating}
            style={buttonStyle}
          >
            {locating ? "확인 중" : "내 위치"}
          </button>
          <button
            type="button"
            aria-label="날씨 새로고침"
            onClick={() => void refresh()}
            disabled={loading}
            style={buttonStyle}
          >
            {loading ? "갱신 중" : "새로고침"}
          </button>
        </div>
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            marginTop: 8,
            fontSize: 13,
            color: "#52675A",
          }}
        >
          날씨 제공: Open-Meteo
        </a>
      </div>
    </section>
  )
}
