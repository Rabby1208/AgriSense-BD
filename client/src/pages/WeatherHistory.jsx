
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Cloud,
  CloudRain,
  CloudSun,
  Sun,
  Wind,
  Thermometer,
  RefreshCw,
  MapPin,
  Info,
  AlertTriangle,
} from "lucide-react";

import PageHero from "../components/PageHero";
import "./WeatherHistory.css";

const locations = [
  {
    district: "Gazipur",
    upazila: "Gazipur Sadar",
    label: "গাজীপুর সদর",
    latitude: 24.0023,
    longitude: 90.4264,
  },
  {
    district: "Dhaka",
    upazila: "Savar",
    label: "সাভার",
    latitude: 23.8583,
    longitude: 90.2667,
  },
  {
    district: "Bogura",
    upazila: "Bogura Sadar",
    label: "বগুড়া সদর",
    latitude: 24.8465,
    longitude: 89.3773,
  },
];

const weatherDescriptions = {
  0: "পরিষ্কার আকাশ",
  1: "প্রায় পরিষ্কার",
  2: "আংশিক মেঘলা",
  3: "মেঘলা",
  45: "কুয়াশা",
  48: "ঘন কুয়াশা",
  51: "হালকা গুঁড়ি গুঁড়ি বৃষ্টি",
  53: "মাঝারি গুঁড়ি গুঁড়ি বৃষ্টি",
  55: "ঘন গুঁড়ি গুঁড়ি বৃষ্টি",
  61: "হালকা বৃষ্টি",
  63: "মাঝারি বৃষ্টি",
  65: "ভারী বৃষ্টি",
  71: "হালকা তুষারপাত",
  73: "মাঝারি তুষারপাত",
  75: "ভারী তুষারপাত",
  80: "হালকা বৃষ্টির ঝাপটা",
  81: "মাঝারি বৃষ্টির ঝাপটা",
  82: "প্রবল বৃষ্টির ঝাপটা",
  95: "বজ্রসহ বৃষ্টি",
  96: "শিলাবৃষ্টিসহ বজ্রঝড়",
  99: "প্রবল শিলাবৃষ্টিসহ বজ্রঝড়",
};

function getWeatherIcon(code) {
  if ([0, 1].includes(code)) return Sun;
  if ([2, 3, 45, 48].includes(code)) return CloudSun;
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code)) {
    return CloudRain;
  }
  return Cloud;
}

function formatDay(dateString) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("bn-BD", {
    weekday: "long",
  });
}

function formatDate(dateString) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "short",
  });
}

function getDateOffset(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function WeatherHistory() {
  const [selectedLocation, setSelectedLocation] = useState("Gazipur");
  const [weatherDays, setWeatherDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadWeatherHistory() {
      setLoading(true);
      setError("");

      const location = locations.find(
        (item) => item.district === selectedLocation
      );

      if (!location) {
        setError("নির্বাচিত এলাকার তথ্য পাওয়া যায়নি।");
        setLoading(false);
        return;
      }

      const commonParams =
        `latitude=${location.latitude}` +
        `&longitude=${location.longitude}` +
        `&timezone=Asia%2FDhaka`;

      const archiveUrl =
        `https://archive-api.open-meteo.com/v1/archive?${commonParams}` +
        `&start_date=${getDateOffset(-3)}` +
        `&end_date=${getDateOffset(-1)}` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max`;

      const forecastUrl =
        `https://api.open-meteo.com/v1/forecast?${commonParams}` +
        `&forecast_days=4` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max`;

      try {
        const [archiveResponse, forecastResponse] = await Promise.all([
          fetch(archiveUrl, { signal: controller.signal }),
          fetch(forecastUrl, { signal: controller.signal }),
        ]);

        if (!archiveResponse.ok || !forecastResponse.ok) {
          throw new Error("আবহাওয়ার সার্ভার থেকে তথ্য পাওয়া যায়নি।");
        }

        const [archiveData, forecastData] = await Promise.all([
          archiveResponse.json(),
          forecastResponse.json(),
        ]);

        const archive = archiveData.daily;
        const forecast = forecastData.daily;

        if (!archive?.time || !forecast?.time) {
          throw new Error("আবহাওয়ার তথ্যের ফরম্যাট সঠিক নয়।");
        }

        const historicalDays = archive.time.map((date, index) => ({
          date,
          type: "historical",
          weatherCode: archive.weather_code?.[index],
          maxTemp: archive.temperature_2m_max?.[index],
          minTemp: archive.temperature_2m_min?.[index],
          rainfall: archive.precipitation_sum?.[index],
          rainChance: null,
          windSpeed: archive.wind_speed_10m_max?.[index],
        }));

        const forecastDays = forecast.time.map((date, index) => ({
          date,
          type: date === getDateOffset(0) ? "today" : "forecast",
          weatherCode: forecast.weather_code?.[index],
          maxTemp: forecast.temperature_2m_max?.[index],
          minTemp: forecast.temperature_2m_min?.[index],
          rainfall: forecast.precipitation_sum?.[index],
          rainChance: forecast.precipitation_probability_max?.[index],
          windSpeed: forecast.wind_speed_10m_max?.[index],
        }));

        setWeatherDays([...historicalDays, ...forecastDays]);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message || "আবহাওয়ার তথ্য লোড করা সম্ভব হয়নি। আবার চেষ্টা করুন।"
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadWeatherHistory();

    return () => controller.abort();
  }, [selectedLocation, refreshCount]);

  const historicalCount = weatherDays.filter(
    (day) => day.type === "historical"
  ).length;

  return (
    <div className="weather-history-page">
      <PageHero
        eyebrow="WEATHER RECORDS"
        title="আবহাওয়ার ইতিহাস"
        description="আগের দিনের আবহাওয়া, আজকের অবস্থা এবং আগামী দিনের পূর্বাভাস এক জায়গায় দেখুন।"
        icon={CalendarDays}
      />

      <main className="weather-history-container">
        {/* Location and refresh */}
        <section className="weather-history-toolbar">
          <div className="weather-history-location">
            <div className="weather-history-location-icon">
              <MapPin size={21} />
            </div>

            <div className="weather-history-location-field">
              <label htmlFor="history-location">এলাকা নির্বাচন করুন</label>
              <select
                id="history-location"
                value={selectedLocation}
                onChange={(event) => setSelectedLocation(event.target.value)}
              >
                {locations.map((location) => (
                  <option
                    key={location.district}
                    value={location.district}
                  >
                    {location.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            className="weather-history-refresh"
            type="button"
            onClick={() => setRefreshCount((count) => count + 1)}
            disabled={loading}
          >
            <RefreshCw size={17} className={loading ? "history-spinning" : ""} />
            আবার লোড করুন
          </button>
        </section>

        {/* Period summary */}
        <section className="weather-history-summary">
          <div>
            <span className="history-summary-label">অতীত</span>
            <strong>৩ দিন</strong>
            <small>Historical data</small>
          </div>

          <div>
            <span className="history-summary-label">বর্তমান</span>
            <strong>আজ</strong>
            <small>Daily weather</small>
          </div>

          <div>
            <span className="history-summary-label">ভবিষ্যৎ</span>
            <strong>৩ দিন</strong>
            <small>Forecast</small>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="history-error">
            <AlertTriangle size={21} />
            <div>
              <strong>তথ্য পাওয়া যায়নি</strong>
              <p>{error}</p>
              <button
                type="button"
                onClick={() => setRefreshCount((count) => count + 1)}
              >
                আবার চেষ্টা করুন
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="history-loading">
            <RefreshCw size={25} className="history-spinning" />
            <p>আবহাওয়ার তথ্য লোড হচ্ছে...</p>
          </div>
        )}

        {/* Weather cards */}
        {!loading && !error && (
          <section className="history-days-section">
            <div className="history-section-heading">
              <div>
                <h2>৭ দিনের আবহাওয়া</h2>
                <p>
                  {locations.find(
                    (item) => item.district === selectedLocation
                  )?.label}
                  {" "} এলাকার তথ্য
                </p>
              </div>

              <span className="history-day-count">
                {weatherDays.length} দিন
              </span>
            </div>

            <div className="history-days-grid">
              {weatherDays.map((day) => {
                const WeatherIcon = getWeatherIcon(day.weatherCode);

                return (
                  <article
                    className={`history-day-card ${day.type === "today" ? "history-today" : ""}`}
                    key={day.date}
                  >
                    <div className="history-day-top">
                      <strong>
                        {day.type === "today"
                          ? "আজ"
                          : formatDay(day.date)}
                      </strong>

                      {day.type === "historical" && (
                        <span className="history-type historical">
                          অতীত
                        </span>
                      )}

                      {day.type === "forecast" && (
                        <span className="history-type forecast">
                          পূর্বাভাস
                        </span>
                      )}

                      {day.type === "today" && (
                        <span className="history-type today">
                          আজ
                        </span>
                      )}
                    </div>

                    <span className="history-date">
                      {formatDate(day.date)}
                    </span>

                    <div className="history-weather-icon">
                      <WeatherIcon size={34} />
                    </div>

                    <p className="history-weather-description">
                      {weatherDescriptions[day.weatherCode] ||
                        "তথ্য পাওয়া যায়নি"}
                    </p>

                    <div className="history-temperature">
                      <Thermometer size={16} />
                      <strong>
                        {day.maxTemp ?? "—"}°C
                      </strong>
                      <span>/ {day.minTemp ?? "—"}°C</span>
                    </div>

                    <div className="history-weather-detail">
                      <div>
                        <CloudRain size={16} />
                        <span>বৃষ্টি</span>
                        <strong>
                          {day.rainfall ?? "—"} mm
                        </strong>
                      </div>

                      <div>
                        <Wind size={16} />
                        <span>বাতাস</span>
                        <strong>
                          {day.windSpeed ?? "—"} km/h
                        </strong>
                      </div>

                      <div>
                        <CloudSun size={16} />
                        <span>বৃষ্টির সম্ভাবনা</span>
                        <strong>
                          {day.rainChance == null
                            ? "প্রযোজ্য নয়"
                            : `${day.rainChance}%`}
                        </strong>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {historicalCount > 0 && (
              <p className="history-data-count">
                অতীতের {historicalCount} দিনের historical data এবং
                আজ ও আগামী দিনের forecast আলাদাভাবে দেখানো হয়েছে।
              </p>
            )}
          </section>
        )}

        {/* Data information */}
        <section className="history-source-note">
          <div className="history-source-icon">
            <Info size={22} />
          </div>

          <div>
            <h3>তথ্যের উৎস ও ধরন</h3>
            <p>
              Historical data: Open-Meteo Historical Weather API
              (reanalysis-based data)।
            </p>
            <p>
              Current day and forecast: Open-Meteo Forecast API।
            </p>
            <p>
              অতীতের তথ্য সরাসরি স্থানীয় আবহাওয়া স্টেশনের
              পর্যবেক্ষণ নয়। ভবিষ্যতের তথ্য পূর্বাভাস, নিশ্চিত
              আবহাওয়া নয়।
            </p>
            <a
              href="https://open-meteo.com/en/docs/historical-weather-api"
              target="_blank"
              rel="noopener noreferrer"
            >
              Historical API documentation
            </a>
            {" · "}
            <a
              href="https://open-meteo.com/en/docs"
              target="_blank"
              rel="noopener noreferrer"
            >
              Forecast API documentation
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

export default WeatherHistory;
