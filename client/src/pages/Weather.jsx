import { useEffect, useState } from "react";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Sun,
  Wind,
  Droplets,
  Thermometer,
  MapPin,
  RefreshCw,
  Sunrise,
  Sunset,
  CloudSun,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";
import { fetchWeather } from "../services/api";
import useFarmerProfile from "../hooks/useFarmerProfile";
import { findLocation } from "../utils/locations";
import ForecastChart from "../components/ForecastChart";
import PageHero from "../components/PageHero";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import {
  buildWeatherAlerts,
  ALERT_NOTE,
  WIND_NOTE,
} from "../utils/weatherAlerts";

import "./Weather.css";

// আপাতত প্রজেক্টে থাকা তিনটি সমর্থিত এলাকার স্থানাঙ্ক
const locationOptions = [
  {
    districtId: "gazipur",
    district: "গাজীপুর",
    upazilaId: "gazipur_sadar",
    upazila: "গাজীপুর সদর",
    latitude: 24.0023,
    longitude: 90.4264,
  },
  {
    districtId: "dhaka",
    district: "ঢাকা",
    upazilaId: "savar",
    upazila: "সাভার",
    latitude: 23.8583,
    longitude: 90.2667,
  },
  {
    districtId: "bogura",
    district: "বগুড়া",
    upazilaId: "bogura_sadar",
    upazila: "বগুড়া সদর",
    latitude: 24.8465,
    longitude: 89.3773,
  },
];

// WMO Weather Code অনুযায়ী আবহাওয়ার বর্ণনা
function getWeatherInfo(code) {
  if (code === 0) {
    return { label: "পরিষ্কার আকাশ", Icon: Sun };
  }

  if ([1, 2].includes(code)) {
    return { label: "আংশিক মেঘলা", Icon: CloudSun };
  }

  if (code === 3) {
    return { label: "মেঘাচ্ছন্ন", Icon: Cloud };
  }

  if ([45, 48].includes(code)) {
    return { label: "কুয়াশা", Icon: CloudFog };
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return { label: "গুঁড়ি গুঁড়ি বৃষ্টি", Icon: CloudDrizzle };
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { label: "বৃষ্টি", Icon: CloudRain };
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { label: "তুষারপাত", Icon: CloudSnow };
  }

  if ([95, 96, 99].includes(code)) {
    return { label: "বজ্রঝড়", Icon: CloudLightning };
  }

  return { label: "আবহাওয়ার তথ্য", Icon: Cloud };
}

function formatDate(dateString, options = {}) {
  if (!dateString) return "তথ্য নেই";

  return new Intl.DateTimeFormat("bn-BD", {
    timeZone: "Asia/Dhaka",
    ...options,
  }).format(new Date(`${dateString}T00:00:00+06:00`));
}

function formatTime(dateString) {
  if (!dateString) return "তথ্য নেই";

  return new Intl.DateTimeFormat("bn-BD", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Dhaka",
  }).format(new Date(dateString));
}

function formatFreshness(dateString) {
  if (!dateString) return "সময় পাওয়া যায়নি";

  return new Intl.DateTimeFormat("bn-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

function getWindDirection(degrees) {
  if (degrees === null || degrees === undefined) {
    return "তথ্য নেই";
  }

  const directions = [
    "উত্তর",
    "উত্তর-পূর্ব",
    "পূর্ব",
    "দক্ষিণ-পূর্ব",
    "দক্ষিণ",
    "দক্ষিণ-পশ্চিম",
    "পশ্চিম",
    "উত্তর-পশ্চিম",
  ];

  return directions[Math.round(degrees / 45) % 8];
}

function getWeatherAlerts(daily) {
  return buildWeatherAlerts(daily);
}

function Weather() {
   const { profile, updateProfile } = useFarmerProfile();
  const savedLocation = findLocation(profile.upazilaId);

  const [districtId, setDistrictId] = useState(
    savedLocation?.districtId ?? "gazipur"
  );
  const [upazilaId, setUpazilaId] = useState(
    savedLocation?.upazilaId ?? "gazipur_sadar"
  );

  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const selectedLocation = locationOptions.find(
    (location) =>
      location.districtId === districtId &&
      location.upazilaId === upazilaId
  );

  const districts = [
    ...new Map(
      locationOptions.map((location) => [
        location.districtId,
        {
          id: location.districtId,
          name: location.district,
        },
      ])
    ).values(),
  ];

  const upazilas = locationOptions.filter(
    (location) => location.districtId === districtId
  );

  useEffect(() => {
    if (!selectedLocation) return undefined;

    const controller = new AbortController();

    async function loadWeather() {
      setLoading(true);
      setError(null);
      setWeather(null);

      try {
        const result = await fetchWeather(
          selectedLocation.latitude,
          selectedLocation.longitude,
          { signal: controller.signal }
        );

        setWeather(result);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadWeather();

    return () => controller.abort();
  }, [selectedLocation, retryCount]);

  const handleDistrictChange = (event) => {
    const nextDistrict = event.target.value;

    setDistrictId(nextDistrict);

    const firstUpazila = locationOptions.find(
      (location) => location.districtId === nextDistrict
    );

       if (firstUpazila) {
      setUpazilaId(firstUpazila.upazilaId);
      updateProfile({ upazilaId: firstUpazila.upazilaId });
    }
  };

  const current = weather?.current;
  const daily = weather?.daily;

  const currentInfo = current
    ? getWeatherInfo(current.weather_code)
    : null;

  const CurrentIcon = currentInfo?.Icon || Cloud;

  const alerts = getWeatherAlerts(daily);
  
  const chartDays = daily?.time
    ? daily.time.map((date, index) => ({
        date,
        maxTemp: daily.temperature_2m_max?.[index] ?? null,
        minTemp: daily.temperature_2m_min?.[index] ?? null,
        rain: daily.precipitation_sum?.[index] ?? null,
      }))
    : [];

  return (
    <main className="weather-page">
      <PageHero
        eyebrow="AgriSense BD · আবহাওয়া সেবা"
        title="আপনার এলাকার আবহাওয়া জানুন"
        description="স্থানীয় আবহাওয়ার তথ্য ও ৭ দিনের পূর্বাভাস দেখে কৃষিকাজের পরিকল্পনা করুন।"
        icon={CloudSun}
      />

      <div className="container weather-container">
        {/* Location selection */}
        <section className="weather-location-panel">
          <div className="weather-location-heading">
            <div className="weather-location-icon">
              <MapPin size={22} />
            </div>

            <div>
              <h2>আপনার এলাকা নির্বাচন করুন</h2>
              <p>জেলা ও উপজেলা নির্বাচন করে আবহাওয়ার তথ্য দেখুন।</p>
            </div>
          </div>

          <div className="weather-location-fields">
            <div className="weather-field">
              <label htmlFor="weather-district">জেলা</label>

              <select
                id="weather-district"
                value={districtId}
                onChange={handleDistrictChange}
              >
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="weather-field">
              <label htmlFor="weather-upazila">উপজেলা</label>

              <select
                id="weather-upazila"
                value={upazilaId}
                                onChange={(event) => {
                  setUpazilaId(event.target.value);
                  updateProfile({ upazilaId: event.target.value });
                }}
              >
                {upazilas.map((upazila) => (
                  <option key={upazila.upazilaId} value={upazila.upazilaId}>
                    {upazila.upazila}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="btn btn-outline weather-refresh-button"
              onClick={() => setRetryCount((value) => value + 1)}
              disabled={loading}
            >
              <RefreshCw size={17} />
              আবার দেখুন
            </button>
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <section className="weather-state-card">
            <LoadingState
              message="আপনার এলাকার আবহাওয়ার তথ্য আনা হচ্ছে..."
              lines={4}
            />
          </section>
        )}

        {/* Error */}
        {!loading && error && (
          <section className="weather-state-card">
            <ErrorState
              title="আবহাওয়ার তথ্য পাওয়া যায়নি"
              error={error}
              onRetry={() => setRetryCount((value) => value + 1)}
            />
          </section>
        )}

        {/* Weather data */}
        {!loading && !error && weather && current && daily && (
          <>
            {/* Current weather */}
            <section className="weather-current-section">
              <div className="weather-section-title">
                <div>
                  <span className="section-eyebrow">বর্তমান আবহাওয়া</span>
                  <h2>
                    {selectedLocation?.upazila}, {selectedLocation?.district}
                  </h2>
                </div>

                <span className="weather-live-label">
                  <span className="weather-live-dot"></span>
                  সর্বশেষ প্রাপ্ত তথ্য
                </span>
              </div>

              <div className="weather-current-card">
                <div className="weather-current-main">
                  <div className="weather-current-condition">
                    <CurrentIcon size={64} strokeWidth={1.5} />

                    <div>
                      <h3>{currentInfo.label}</h3>
                      <p>অনুভূত তাপমাত্রা</p>
                      <strong>
                        {current.apparent_temperature ?? "—"}°C
                      </strong>
                    </div>
                  </div>

                  <div className="weather-current-temperature">
                    <strong>
                      {current.temperature_2m ?? "—"}°
                    </strong>
                    <span>সেলসিয়াস</span>
                  </div>
                </div>

                <div className="weather-current-details">
                  <div className="weather-detail-item">
                    <Droplets size={21} />
                    <div>
                      <span>আর্দ্রতা</span>
                      <strong>
                        {current.relative_humidity_2m ?? "—"}%
                      </strong>
                    </div>
                  </div>

                  <div className="weather-detail-item">
                    <CloudRain size={21} />
                    <div>
                      <span>বৃষ্টিপাত</span>
                      <strong>
                        {current.precipitation ?? "—"} মিমি
                      </strong>
                    </div>
                  </div>

                  <div className="weather-detail-item">
                    <Wind size={21} />
                    <div>
                      <span>বাতাসের গতি</span>
                      <strong>
                        {current.wind_speed_10m ?? "—"} কিমি/ঘণ্টা
                      </strong>
                    </div>
                  </div>

                  <div className="weather-detail-item">
                    <Cloud size={21} />
                    <div>
                      <span>মেঘের পরিমাণ</span>
                      <strong>
                        {current.cloud_cover ?? "—"}%
                      </strong>
                    </div>
                  </div>

                  <div className="weather-detail-item">
                    <Wind size={21} />
                    <div>
                      <span>বাতাসের দিক</span>
                      <strong>
                        {getWindDirection(current.wind_direction_10m)}
                      </strong>
                    </div>
                  </div>

                  <div className="weather-detail-item">
                    <Thermometer size={21} />
                    <div>
                      <span>বৃষ্টির পরিমাণ</span>
                      <strong>
                        {current.rain ?? "—"} মিমি
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Forecast */}
            <section className="weather-forecast-section">
              <div className="weather-section-title">
                <div>
                  <span className="section-eyebrow">আগামী দিনের পূর্বাভাস</span>
                  <h2>৭ দিনের আবহাওয়া</h2>
                  <p>
                    প্রতিদিনের সর্বোচ্চ ও সর্বনিম্ন তাপমাত্রা এবং বৃষ্টির তথ্য।
                  </p>
                </div>

                <CalendarDays size={28} />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <ForecastChart
                  days={chartDays}
                  title="৭ দিনের তাপমাত্রা ও বৃষ্টির পূর্বাভাস"
                />
              </div>
              <div className="weather-forecast-grid">
                {daily.time.map((date, index) => {
                  const info = getWeatherInfo(daily.weather_code[index]);
                  const DayIcon = info.Icon;

                  return (
                    <article className="weather-day-card" key={date}>
                      <span className="weather-day-name">
                        {index === 0
                          ? "আজ"
                          : formatDate(date, { weekday: "long" })}
                      </span>

                      <span className="weather-day-date">
                        {formatDate(date, {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>

                      <DayIcon size={34} strokeWidth={1.6} />

                      <span className="weather-day-condition">
                        {info.label}
                      </span>

                      <div className="weather-day-temperatures">
                        <strong>
                          {daily.temperature_2m_max[index]}°
                        </strong>
                        <span>
                          {daily.temperature_2m_min[index]}°
                        </span>
                      </div>

                      <div className="weather-day-rain">
                        <Droplets size={15} />
                        <span>
                          {daily.precipitation_sum[index] ?? "—"} মিমি
                        </span>
                      </div>

                      <div className="weather-day-rain">
                        <CloudRain size={15} />
                        <span>
                          {daily.precipitation_probability_max?.[index] ??
                            "—"}% বৃষ্টির সম্ভাবনা
                        </span>
                      </div>

                      <div className="weather-day-rain">
                        <Wind size={15} />
                        <span>
                          {daily.wind_speed_10m_max[index] ?? "—"} কিমি/ঘণ্টা
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* Alerts */}
            <section className="weather-alert-section">
              <div className="weather-section-title">
                <div>
                  <span className="section-eyebrow">আবহাওয়া সতর্কতা</span>
                  <h2>বিশেষ সতর্কবার্তা</h2>
                  <p>
                    পূর্বাভাসে পাওয়া নির্দিষ্ট গুরুতর আবহাওয়ার সংকেত।
                  </p>
                </div>

                <AlertTriangle size={28} />
              </div>

              {alerts.length > 0 ? (
                <div className="weather-alert-list">
                  {alerts.map((alert, index) => (
                    <article className="weather-alert-card" key={`${alert.date}-${index}`}>
                      <div className="weather-alert-icon">
                        <AlertTriangle size={23} />
                      </div>

                      <div>
                        <strong>{alert.title}</strong>
                        <p>{alert.description}</p>
                        <span>
                          {formatDate(alert.date, {
                            day: "numeric",
                            month: "long",
                            weekday: "long",
                          })}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="weather-no-alert">
                  <CloudSun size={27} />
                  <div>
                    <strong>নির্দিষ্ট গুরুতর আবহাওয়ার সংকেত পাওয়া যায়নি</strong>
                    <p>
                      এটি ঝুঁকি নেই—এমন নিশ্চয়তা নয়। নিয়মিত পূর্বাভাস ও
                      সরকারি সতর্কবার্তা দেখুন।
                    </p>
                  </div>
                </div>
              )}
                            <p style={{ marginTop: "14px", fontSize: "0.9rem" }}>
                {ALERT_NOTE} {WIND_NOTE}
              </p>
            </section>

            {/* Sunrise and sunset */}
            <section className="weather-sun-section">
              <article className="weather-sun-card">
                <Sunrise size={30} />
                <div>
                  <span>সূর্যোদয়</span>
                  <strong>{formatTime(daily.sunrise?.[0])}</strong>
                </div>
              </article>

              <article className="weather-sun-card">
                <Sunset size={30} />
                <div>
                  <span>সূর্যাস্ত</span>
                  <strong>{formatTime(daily.sunset?.[0])}</strong>
                </div>
              </article>
            </section>

            {/* Data source */}
            <section className="weather-source-panel">
              <div className="weather-source-heading">
                <Cloud size={20} />
                <strong>তথ্যসূত্র ও তথ্যের সীমাবদ্ধতা</strong>
              </div>

              <p>
                আবহাওয়ার তথ্য Open-Meteo API থেকে পাওয়া পূর্বাভাসভিত্তিক
                তথ্য। এটি সরাসরি মাঠের আবহাওয়া সেন্সর থেকে নেওয়া পর্যবেক্ষণ
                নয়।
              </p>

              <p>
                তথ্য সংগ্রহের সময়: {formatFreshness(weather.fetchedAt)}
              </p>

              <p>
                আবহাওয়ার মডেল সময়: {formatTime(current.time)}
              </p>

              <a
                href="https://open-meteo.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open-Meteo সম্পর্কে জানুন
              </a>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default Weather;