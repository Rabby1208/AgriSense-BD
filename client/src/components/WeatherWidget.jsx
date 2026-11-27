import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Cloud,
  CloudRain,
  CloudSun,
  Sun,
  Wind,
  Droplets,
  MapPin,
  Thermometer,
  RefreshCw,
  AlertCircle,
  LoaderCircle,
  LocateFixed,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  Sunrise,
  CalendarDays,
} from "lucide-react";

import { getWeatherForecast } from "../services/weatherApi";
import "./WeatherWidget.css";

const WEATHER_CONDITIONS = {
  "Clear sky": "পরিষ্কার আকাশ",
  "Mainly clear": "প্রধানত পরিষ্কার",
  "Partly cloudy": "আংশিক মেঘলা",
  "Overcast": "মেঘাচ্ছন্ন",
  "Fog": "কুয়াশা",
  "Depositing rime fog": "ঘন কুয়াশা",
  "Light drizzle": "হালকা গুঁড়ি গুঁড়ি বৃষ্টি",
  "Moderate drizzle": "মাঝারি গুঁড়ি গুঁড়ি বৃষ্টি",
  "Dense drizzle": "ঘন গুঁড়ি গুঁড়ি বৃষ্টি",
  "Light rain": "হালকা বৃষ্টি",
  "Moderate rain": "মাঝারি বৃষ্টি",
  "Heavy rain": "ভারী বৃষ্টি",
  "Light snow": "হালকা তুষারপাত",
  "Moderate snow": "মাঝারি তুষারপাত",
  "Heavy snow": "ভারী তুষারপাত",
  "Rain showers": "বৃষ্টির ঝরনা",
  "Thunderstorm": "বজ্রঝড়",
  "Thunderstorm with hail": "শিলাবৃষ্টিসহ বজ্রঝড়",
  Unknown: "অজানা",
};

const text = (english, bangla, isBangla) =>
  isBangla ? bangla : english;

function translateCondition(condition, isBangla) {
  if (!condition) {
    return text("Unknown", "অজানা", isBangla);
  }

  return isBangla
    ? WEATHER_CONDITIONS[condition] || condition
    : condition;
}

function getWeatherIcon(code, size = 28) {
  if (code === 0) return <Sun size={size} />;
  if ([1, 2].includes(code)) return <CloudSun size={size} />;
  if (code === 3) return <Cloud size={size} />;
  if ([45, 48].includes(code)) return <CloudFog size={size} />;
  if ([51, 53, 55, 56, 57].includes(code)) {
    return <CloudDrizzle size={size} />;
  }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return <CloudRain size={size} />;
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return <Cloud size={size} />;
  }
  if ([95, 96, 99].includes(code)) {
    return <CloudLightning size={size} />;
  }

  return <Cloud size={size} />;
}

function formatDate(dateString, isBangla) {
  if (!dateString) return "N/A";

  return new Date(`${dateString}T00:00:00`).toLocaleDateString(
    isBangla ? "bn-BD" : "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
    }
  );
}

function formatNumber(value, isBangla) {
  if (value === null || value === undefined || value === "") {
    return "--";
  }

  return Number(value).toLocaleString(
    isBangla ? "bn-BD" : "en-US",
    {
      maximumFractionDigits: 1,
    }
  );
}

function WeatherWidget() {
  const { i18n } = useTranslation();
  const isBangla = i18n.language?.startsWith("bn");

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async (lat, lon) => {
    const parsedLat = Number(lat);
    const parsedLon = Number(lon);

    if (
      lat === "" ||
      lon === "" ||
      !Number.isFinite(parsedLat) ||
      !Number.isFinite(parsedLon) ||
      parsedLat < -90 ||
      parsedLat > 90 ||
      parsedLon < -180 ||
      parsedLon > 180
    ) {
      setError(
        text(
          "Please enter valid latitude and longitude values.",
          "সঠিক অক্ষাংশ ও দ্রাঘিমাংশ লিখুন।",
          isBangla
        )
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await getWeatherForecast(parsedLat, parsedLon);

      if (!result?.success) {
        throw new Error(
          result?.message ||
            text(
              "Weather information is unavailable.",
              "আবহাওয়ার তথ্য পাওয়া যাচ্ছে না।",
              isBangla
            )
        );
      }

      setWeather(result);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          text(
            "Unable to load weather information. Please try again.",
            "আবহাওয়ার তথ্য লোড করা যায়নি। আবার চেষ্টা করুন।",
            isBangla
          )
      );
    } finally {
      setLoading(false);
    }
  };

  const useMyLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError(
        text(
          "Your browser does not support location services.",
          "তোমার ব্রাউজারে লোকেশন সুবিধা নেই।",
          isBangla
        )
      );
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        setLatitude(String(lat.toFixed(6)));
        setLongitude(String(lon.toFixed(6)));

        fetchWeather(lat, lon);
      },
      (locationError) => {
        setLoading(false);

        if (locationError.code === 1) {
          setError(
            text(
              "Location permission was denied. Enter coordinates manually.",
              "লোকেশন ব্যবহারের অনুমতি দেওয়া হয়নি। নিজে অক্ষাংশ ও দ্রাঘিমাংশ লিখুন।",
              isBangla
            )
          );
        } else if (locationError.code === 2) {
          setError(
            text(
              "Your current location could not be determined.",
              "তোমার বর্তমান অবস্থান নির্ণয় করা যায়নি।",
              isBangla
            )
          );
        } else {
          setError(
            text(
              "Location request timed out. Please try again.",
              "লোকেশন পেতে সময় শেষ হয়েছে। আবার চেষ্টা করুন।",
              isBangla
            )
          );
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 300000,
      }
    );
  };

  const current = weather?.current;
  const forecast = weather?.forecast || [];

  return (
    <section className="weather-section" id="weather">
      <div className="weather-heading">
        <div>
          <span className="weather-eyebrow">
            AGRISENSE BD WEATHER SERVICE
          </span>

          <h2>
            {text("Live Weather & Forecast", "লাইভ আবহাওয়া ও পূর্বাভাস", isBangla)}
          </h2>

          <p>
            {text(
              "Check current weather conditions and the upcoming seven-day forecast for your farming location.",
              "তোমার কৃষিজমির বর্তমান আবহাওয়া এবং আগামী সাত দিনের আবহাওয়ার পূর্বাভাস দেখো।",
              isBangla
            )}
          </p>
        </div>

        <div className="weather-heading-icon">
          <CloudSun size={58} />
        </div>
      </div>

      <div className="weather-location-panel">
        <div className="weather-location-title">
          <MapPin size={19} />

          <strong>
            {text("Select Your Location", "তোমার অবস্থান নির্বাচন করো", isBangla)}
          </strong>
        </div>

        <p>
          {text(
            "Use your device location or enter coordinates manually.",
            "ডিভাইসের লোকেশন ব্যবহার করো অথবা অক্ষাংশ ও দ্রাঘিমাংশ নিজে লিখো।",
            isBangla
          )}
        </p>

        <button
          type="button"
          className="weather-location-button"
          onClick={useMyLocation}
          disabled={loading}
        >
          <LocateFixed size={17} />

          {text("Use My Location", "আমার লোকেশন ব্যবহার করো", isBangla)}
        </button>

        <div className="weather-coordinate-form">
          <label>
            {text("Latitude", "অক্ষাংশ", isBangla)}

            <input
              type="number"
              step="any"
              placeholder="Example: 23.8103"
              aria-label={text("Latitude", "অক্ষাংশ", isBangla)}
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
          </label>

          <label>
            {text("Longitude", "দ্রাঘিমাংশ", isBangla)}

            <input
              type="number"
              step="any"
              placeholder="Example: 90.4125"
              aria-label={text("Longitude", "দ্রাঘিমাংশ", isBangla)}
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </label>

          <button
            type="button"
            className="weather-search-button"
            onClick={() => fetchWeather(latitude, longitude)}
            disabled={loading}
          >
            {loading ? (
              <LoaderCircle className="weather-spinner" size={17} />
            ) : (
              <CloudSun size={17} />
            )}

            {loading
              ? text("Loading...", "লোড হচ্ছে...", isBangla)
              : text("Get Weather", "আবহাওয়া দেখুন", isBangla)}
          </button>
        </div>

        {error && (
          <div className="weather-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {weather && current && (
        <>
          <div className="weather-current-card">
            <div className="weather-current-top">
              <div>
                <span className="weather-card-label">
                  {text("CURRENT WEATHER", "বর্তমান আবহাওয়া", isBangla)}
                </span>

                <h3>
                  {translateCondition(current.condition, isBangla) ||
                    text("Current Conditions", "বর্তমান অবস্থা", isBangla)}
                </h3>

                <p>
                  {weather.location?.timezone ||
                    text("Local timezone", "স্থানীয় সময় অঞ্চল", isBangla)}
                </p>
              </div>

              <div className="weather-current-icon">
                {getWeatherIcon(current.weather_code, 58)}
              </div>
            </div>

            <div className="weather-temperature">
              {formatNumber(current.temperature, isBangla)}
              <span>{current.unit || "°C"}</span>
            </div>

            <div className="weather-current-details">
              <div>
                <Thermometer size={20} />
                <span>{text("Feels like", "অনুভূত তাপমাত্রা", isBangla)}</span>
                <strong>
                  {formatNumber(current.feels_like, isBangla)}°C
                </strong>
              </div>

              <div>
                <Droplets size={20} />
                <span>{text("Humidity", "আর্দ্রতা", isBangla)}</span>
                <strong>
                  {formatNumber(current.humidity, isBangla)}%
                </strong>
              </div>

              <div>
                <Wind size={20} />
                <span>{text("Wind speed", "বাতাসের গতি", isBangla)}</span>
                <strong>
                  {formatNumber(current.wind_speed, isBangla)} km/h
                </strong>
              </div>

              <div>
                <CloudRain size={20} />
                <span>{text("Precipitation", "বৃষ্টিপাত", isBangla)}</span>
                <strong>
                  {formatNumber(current.precipitation, isBangla)} mm
                </strong>
              </div>
            </div>
          </div>

          <div className="weather-forecast-panel">
            <div className="weather-forecast-heading">
              <div>
                <h3>
                  <CalendarDays size={20} />

                  {text(
                    "7-Day Weather Forecast",
                    "৭ দিনের আবহাওয়ার পূর্বাভাস",
                    isBangla
                  )}
                </h3>

                <p>
                  {text(
                    "Upcoming daily weather conditions",
                    "আগামী দিনের আবহাওয়ার অবস্থা",
                    isBangla
                  )}
                </p>
              </div>

              <button
                type="button"
                className="weather-refresh-button"
                onClick={() => fetchWeather(latitude, longitude)}
                disabled={loading}
                aria-label={text("Refresh weather", "আবহাওয়া রিফ্রেশ করুন", isBangla)}
                title={text("Refresh weather", "আবহাওয়া রিফ্রেশ করুন", isBangla)}
              >
                <RefreshCw size={18} />
              </button>
            </div>

            <div className="weather-forecast-grid">
              {forecast.map((day, index) => (
                <article
                  className="weather-day-card"
                  key={day.date || index}
                >
                  <span className="weather-day-name">
                    {formatDate(day.date, isBangla)}
                  </span>

                  <div className="weather-day-icon">
                    {getWeatherIcon(day.weather_code, 31)}
                  </div>

                  <span className="weather-day-condition">
                    {translateCondition(day.condition, isBangla)}
                  </span>

                  <div className="weather-day-temperatures">
                    <strong>
                      {formatNumber(day.max_temperature, isBangla)}°
                    </strong>

                    <span>
                      {formatNumber(day.min_temperature, isBangla)}°
                    </span>
                  </div>

                  <div className="weather-rain-probability">
                    <Droplets size={14} />

                    {formatNumber(day.precipitation_probability, isBangla)}%
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="weather-attribution">
            <Cloud size={15} />

            {text(
              "Weather data provided by Open-Meteo.",
              "আবহাওয়ার তথ্য সরবরাহ করেছে Open-Meteo।",
              isBangla
            )}

            {weather.source ? ` Source: ${weather.source}` : ""}
          </div>
        </>
      )}

      {!weather && !loading && !error && (
        <div className="weather-empty-state">
          <Sunrise size={42} />

          <h3>
            {text(
              "Weather information is ready",
              "আবহাওয়ার তথ্য প্রস্তুত",
              isBangla
            )}
          </h3>

          <p>
            {text(
              "Select your location to see live weather and the seven-day forecast.",
              "লাইভ আবহাওয়া ও সাত দিনের পূর্বাভাস দেখতে তোমার অবস্থান নির্বাচন করো।",
              isBangla
            )}
          </p>
        </div>
      )}
    </section>
  );
}

export default WeatherWidget;