
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CloudSun,
  Sun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  RefreshCw,
  MapPin,
  Search,
  LoaderCircle,
  AlertCircle,
  Thermometer,
} from "lucide-react";

import "./Weather.css";

const weatherInfo = (code, isBn) => {
  if (code === 0) {
    return { label: isBn ? "পরিষ্কার আকাশ" : "Clear Sky", icon: Sun };
  }

  if ([1, 2].includes(code)) {
    return { label: isBn ? "আংশিক মেঘলা" : "Partly Cloudy", icon: CloudSun };
  }

  if (code === 3) {
    return { label: isBn ? "মেঘাচ্ছন্ন" : "Overcast", icon: Cloud };
  }

  if ([45, 48].includes(code)) {
    return { label: isBn ? "কুয়াশাচ্ছন্ন" : "Foggy", icon: Cloud };
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return { label: isBn ? "গুঁড়ি গুঁড়ি বৃষ্টি" : "Drizzle", icon: CloudDrizzle };
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { label: isBn ? "বৃষ্টি" : "Rain", icon: CloudRain };
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { label: isBn ? "তুষারপাত" : "Snow", icon: CloudSnow };
  }

  if ([95, 96, 99].includes(code)) {
    return { label: isBn ? "বজ্রসহ ঝড়" : "Thunderstorm", icon: CloudLightning };
  }

  return { label: isBn ? "অজানা" : "Unknown", icon: CloudSun };
};

const formatDay = (date, isBn) =>
  new Date(`${date}T12:00:00`).toLocaleDateString(
    isBn ? "bn-BD" : "en-BD",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
    }
  );

function Weather() {
  const { i18n } = useTranslation();
  const isBn = i18n.language?.startsWith("bn");

  const [city, setCity] = useState("Dhaka");
  const [search, setSearch] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  const locationRef = useRef({
    latitude: 23.8103,
    longitude: 90.4125,
    locationName: "Dhaka",
  });

  const text = (en, bn) => (isBn ? bn : en);

  const formatNumber = (value, digits = 0) =>
    Number(value).toLocaleString(isBn ? "bn-BD" : "en-BD", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });

  const loadWeather = useCallback(
    async (latitude, longitude, locationName) => {
      setLoading(true);
      setError("");

      try {
        const url = new URL("https://api.open-meteo.com/v1/forecast");

        url.search = new URLSearchParams({
          latitude: String(latitude),
          longitude: String(longitude),
          current: [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "is_day",
            "precipitation",
            "rain",
            "showers",
            "weather_code",
            "wind_speed_10m",
          ].join(","),
          hourly: "precipitation_probability,precipitation",
          daily: [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_sum",
            "precipitation_probability_max",
            "wind_speed_10m_max",
          ].join(","),
          timezone: "auto",
          forecast_days: "7",
        });

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            text(
              "Weather service is temporarily unavailable.",
              "আবহাওয়া সেবা সাময়িকভাবে বন্ধ রয়েছে।"
            )
          );
        }

        const data = await response.json();

        setWeather(data);
        setCity(locationName);

        locationRef.current = {
          latitude,
          longitude,
          locationName,
        };

        setUpdatedAt(new Date());
      } catch (err) {
        setError(
          err.message ||
            text(
              "Weather data could not be loaded.",
              "আবহাওয়ার তথ্য লোড করা যায়নি।"
            )
        );
      } finally {
        setLoading(false);
      }
    },
    [isBn]
  );

  const searchCity = async (event) => {
    event.preventDefault();

    const query = search.trim();

    if (!query) return;

    setLoading(true);
    setError("");

    try {
      const url = new URL("https://geocoding-api.open-meteo.com/v1/search");

      url.search = new URLSearchParams({
        name: query,
        count: "1",
        language: isBn ? "en" : "en",
        format: "json",
      });

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          text("Location search failed.", "লোকেশন খুঁজে পাওয়া যায়নি।")
        );
      }

      const result = await response.json();
      const place = result.results?.[0];

      if (!place) {
        throw new Error(
          text(
            "Location not found. Try another name.",
            "লোকেশন পাওয়া যায়নি। অন্য নাম দিয়ে চেষ্টা করো।"
          )
        );
      }

      await loadWeather(
        place.latitude,
        place.longitude,
        `${place.name}${place.admin1 ? `, ${place.admin1}` : ""}`
      );

      setSearch("");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError(
        text(
          "This browser does not support location.",
          "এই ব্রাউজার লোকেশন সাপোর্ট করে না।"
        )
      );
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await loadWeather(
          position.coords.latitude,
          position.coords.longitude,
          text("My Location", "আমার অবস্থান")
        );
      },
      () => {
        setError(
          text(
            "Location permission was not granted. Search for a city instead.",
            "লোকেশন ব্যবহারের অনুমতি পাওয়া যায়নি। শহরের নাম লিখে আবহাওয়া দেখো।"
          )
        );
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
      }
    );
  };

  useEffect(() => {
    loadWeather(23.8103, 90.4125, "Dhaka");

    const interval = setInterval(() => {
      const location = locationRef.current;

      loadWeather(
        location.latitude,
        location.longitude,
        location.locationName
      );
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadWeather]);

  const current = weather?.current;
  const daily = weather?.daily;

  const currentCondition = current
    ? weatherInfo(current.weather_code, isBn)
    : weatherInfo(0, isBn);

  const CurrentIcon = currentCondition.icon;

  return (
    <section className="weather-dashboard">
      <div className="weather-heading">
        <div>
          <span className="weather-eyebrow">
            AGRISENSE BD WEATHER
          </span>

          <h2>
            {text("Weather Forecast", "আবহাওয়ার পূর্বাভাস")}
          </h2>

          <p>
            {text(
              "Real-time weather information for better planning.",
              "কৃষিকাজের সঠিক পরিকল্পনার জন্য实时 আবহাওয়ার তথ্য।"
            )}
          </p>
        </div>

        <button
          className="weather-refresh"
          onClick={() => {
            const location = locationRef.current;

            loadWeather(
              location.latitude,
              location.longitude,
              location.locationName
            );
          }}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "weather-spin" : ""}
          />
          {text("Refresh", "রিফ্রেশ")}
        </button>
      </div>

      <form className="weather-search" onSubmit={searchCity}>
        <Search size={19} />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={text(
            "Search district or city...",
            "জেলা বা শহরের নাম লিখুন..."
          )}
        />

        <button type="submit" disabled={loading}>
          {text("Search", "খুঁজুন")}
        </button>

        <button
          type="button"
          className="location-button"
          onClick={useMyLocation}
          title={text("Use my location", "আমার অবস্থান ব্যবহার করুন")}
          disabled={loading}
        >
          <MapPin size={18} />
        </button>
      </form>

      {error && (
        <div className="weather-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading && !weather && (
        <div className="weather-loading">
          <LoaderCircle size={35} className="weather-spin" />
          <p>
            {text(
              "Loading weather information...",
              "আবহাওয়ার তথ্য লোড হচ্ছে..."
            )}
          </p>
        </div>
      )}

      {current && (
        <>
          <div className="weather-current-card">
            <div className="weather-current-main">
              <span className="weather-location">
                <MapPin size={16} />
                {city}
              </span>

              <div className="weather-temperature">
                <CurrentIcon size={65} />
                <strong>
                  {formatNumber(Math.round(current.temperature_2m))}°C
                </strong>
              </div>

              <h3>{currentCondition.label}</h3>

              <p>
                {text("Feels like", "অনুভূত তাপমাত্রা")}{" "}
                {formatNumber(Math.round(current.apparent_temperature))}°C
              </p>
            </div>

            <div className="weather-details">
              <div>
                <Droplets size={22} />
                <span>{text("Humidity", "আর্দ্রতা")}</span>
                <strong>
                  {formatNumber(current.relative_humidity_2m)}%
                </strong>
              </div>

              <div>
                <Wind size={22} />
                <span>{text("Wind Speed", "বাতাসের গতি")}</span>
                <strong>
                  {formatNumber(current.wind_speed_10m)} km/h
                </strong>
              </div>

              <div>
                <CloudRain size={22} />
                <span>{text("Rain", "বৃষ্টি")}</span>
                <strong>
                  {formatNumber(current.rain, 1)} mm
                </strong>
              </div>

              <div>
                <Thermometer size={22} />
                <span>{text("Precipitation", "বৃষ্টিপাত")}</span>
                <strong>
                  {formatNumber(current.precipitation, 1)} mm
                </strong>
              </div>
            </div>
          </div>

          {daily && (
            <div className="weather-forecast">
              <div className="weather-section-title">
                <div>
                  <h3>
                    {text("7-Day Forecast", "৭ দিনের আবহাওয়ার পূর্বাভাস")}
                  </h3>

                  <p>
                    {text(
                      "Upcoming weather conditions",
                      "আগামী দিনের আবহাওয়ার অবস্থা"
                    )}
                  </p>
                </div>
              </div>

              <div className="forecast-grid">
                {daily.time.map((date, index) => {
                  const condition = weatherInfo(
                    daily.weather_code[index],
                    isBn
                  );

                  const DayIcon = condition.icon;

                  return (
                    <div className="forecast-card" key={date}>
                      <strong>{formatDay(date, isBn)}</strong>

                      <DayIcon size={30} />

                      <span>{condition.label}</span>

                      <b>
                        {formatNumber(
                          Math.round(daily.temperature_2m_max[index])
                        )}
                        °
                        <small>
                          {" / "}
                          {formatNumber(
                            Math.round(daily.temperature_2m_min[index])
                          )}
                          °
                        </small>
                      </b>

                      <span className="forecast-rain">
                        <Droplets size={14} />
                        {formatNumber(
                          daily.precipitation_probability_max[index] ?? 0
                        )}
                        % {text("rain", "বৃষ্টির সম্ভাবনা")}
                      </span>

                      <span className="forecast-rain">
                        {formatNumber(daily.precipitation_sum[index], 1)} mm{" "}
                        {text("expected", "সম্ভাব্য বৃষ্টিপাত")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="weather-update-time">
            <span>
              {text("Last updated:", "সর্বশেষ আপডেট:")}{" "}
              {updatedAt?.toLocaleTimeString(isBn ? "bn-BD" : "en-BD") ||
                text("Loading", "লোড হচ্ছে")}
            </span>

            <span>
              {text("Weather data:", "আবহাওয়ার তথ্য:")} Open-Meteo
            </span>
          </div>
        </>
      )}
    </section>
  );
}

export default Weather;
