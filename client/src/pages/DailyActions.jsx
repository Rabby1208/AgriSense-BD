import { useMemo } from "react";
import {
  CalendarDays,
  CloudRain,
  Droplets,
  Info,
  MapPin,
  Sprout,
  ThermometerSun,
  TriangleAlert,
  Trash2,
  Wind,
} from "lucide-react";

import PageHero from "../components/PageHero";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import ListenButton from "../components/ListenButton";
import ForecastChart from "../components/ForecastChart";
import useApiData from "../hooks/useApiData";
import useFarmerProfile from "../hooks/useFarmerProfile";
import { fetchCrops, fetchWeather } from "../services/api";
import { LOCATION_OPTIONS, findLocation } from "../utils/locations";
import { getWeatherInfo } from "../utils/weatherCodes";
import { ALERT_NOTE, WIND_NOTE } from "../utils/weatherAlerts";
import {
  buildOutlook,
  buildUpcomingAlerts,
  getDaysSincePlanting,
  getDhakaToday,
  hasForecastRainSoon,
} from "../utils/todaySummary";

import "./DailyActions.css";

const DAY_LABELS = ["আজ", "আগামীকাল", "পরশু"];

function formatNumber(value, digits = 0) {
  if (typeof value !== "number") return "তথ্য নেই";

  return value.toLocaleString("bn-BD", { maximumFractionDigits: digits });
}

function formatDateTime(isoString) {
  if (!isoString) return "তথ্য নেই";

  return new Date(isoString).toLocaleString("bn-BD", {
    timeZone: "Asia/Dhaka",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatShortDate(dateString) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
  });
}

function DailyActions() {
  const { profile, updateProfile, clearProfile } = useFarmerProfile();

  const location = findLocation(profile.upazilaId);
  const today = getDhakaToday();

  // ফসলের তালিকা
    const {
    data: crops,
    error: cropsError,
    loading: cropsLoading,
    retry: retryCrops,
  } = useApiData(fetchCrops);
  const activeCrops = (crops ?? []).filter((crop) => crop.active !== false);
  const selectedCrop = activeCrops.find((crop) => crop.id === profile.cropId);

  // আবহাওয়া (এলাকা বাছা হলেই আনা হয়)
  const weatherFetcher = useMemo(() => {
    if (!location) return null;

    return (options) =>
      fetchWeather(location.latitude, location.longitude, options);
  }, [location]);

  const {
    data: weather,
    error: weatherError,
    loading: weatherLoading,
    retry,
  } = useApiData(weatherFetcher);

  const outlook = weather ? buildOutlook(weather.daily, today, 3) : [];
  const upcomingAlerts = weather ? buildUpcomingAlerts(weather.daily, outlook) : [];
  const rainSoon = hasForecastRainSoon(outlook);
  
  // বাংলায় শোনার জন্য লেখা (শুধু পূর্বাভাস ও সতর্কতা, কোনো বানানো পরামর্শ নয়)
  const speechText =
    location && outlook.length > 0
      ? [
          `${location.upazila} এলাকার আগামী তিন দিনের আবহাওয়ার পূর্বাভাস।`,
          ...outlook.map((day, index) => {
            const info = getWeatherInfo(day.weatherCode);

            return `${DAY_LABELS[index]}: ${info.label}। সর্বোচ্চ তাপমাত্রা ${formatNumber(day.maxTemp, 1)} ডিগ্রি, সর্বনিম্ন ${formatNumber(day.minTemp, 1)} ডিগ্রি সেলসিয়াস। বৃষ্টি প্রায় ${formatNumber(day.rain, 1)} মিলিমিটার।`;
          }),
          ...upcomingAlerts.map((alert) => `${alert.title}। ${alert.description}`),
          "এটি আবহাওয়ার পূর্বাভাস, নিশ্চিত পর্যবেক্ষণ নয়।",
        ].join(" ")
      : "";
  const daysSincePlanting = profile.plantingDate
    ? getDaysSincePlanting(profile.plantingDate, today)
    : null;

  return (
    <main className="today-page">
      <PageHero
        eyebrow="দৈনিক কৃষি সহায়তা"
        title="আজকের মাঠের করণীয়"
        description="আপনার এলাকার আবহাওয়ার পূর্বাভাস, সম্ভাব্য সতর্কতা ও ফসলের তথ্য এক জায়গায়।"
        icon={CalendarDays}
      />

      <div className="container today-content">
        {/* ১. কৃষকের তথ্য */}
        <section className="today-card">
          <div className="today-card-head">
            <h2>
              <MapPin size={20} />
              আপনার তথ্য
            </h2>

            <button
              type="button"
              className="btn btn-outline today-clear"
              onClick={clearProfile}
            >
              <Trash2 size={16} />
              তথ্য মুছুন
            </button>
          </div>

          <div className="today-form">
            <label className="today-field">
              এলাকা (উপজেলা)
              <select
                value={profile.upazilaId}
                onChange={(event) =>
                  updateProfile({ upazilaId: event.target.value })
                }
              >
                <option value="">এলাকা বাছুন</option>
                {LOCATION_OPTIONS.map((item) => (
                  <option key={item.upazilaId} value={item.upazilaId}>
                    {item.upazila}, {item.district}
                  </option>
                ))}
              </select>
            </label>

            <label className="today-field">
              ফসল
              <select
                value={profile.cropId}
                onChange={(event) =>
                  updateProfile({ cropId: event.target.value })
                }
              >
                <option value="">ফসল বাছুন</option>
                {activeCrops.map((crop) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.name_bn}
                  </option>
                ))}
              </select>
              
              {cropsLoading && (
                <span className="today-field-note">ফসলের তালিকা আনা হচ্ছে…</span>
              )}

              {cropsError && (
                <span className="today-field-note">
                  ফসলের তালিকা আনা যায়নি। সার্ভার (backend) চালু আছে কি না দেখুন।{" "}
                  <button type="button" onClick={retryCrops}>
                    আবার চেষ্টা করুন
                  </button>
                </span>
              )}
            </label>

            <label className="today-field">
              রোপণের তারিখ
              <input
                type="date"
                value={profile.plantingDate}
                max={today}
                onChange={(event) =>
                  updateProfile({ plantingDate: event.target.value })
                }
              />
            </label>
          </div>

          <p className="today-note">
            <Info size={15} />
            এই তথ্য শুধু আপনার এই ফোন বা কম্পিউটারের ব্রাউজারে থাকে। কোনো
            সার্ভারে পাঠানো হয় না।
          </p>
        </section>

        {/* ২. এলাকা না বাছলে */}
        {!location && (
          <section className="today-card">
            <p className="today-empty">
              আজকের আবহাওয়া ও সতর্কতা দেখতে ওপরে আপনার এলাকা বাছুন।
            </p>
          </section>
        )}

        {/* ৩. লোডিং ও ত্রুটি */}
        {location && weatherLoading && (
          <section className="today-card">
            <LoadingState message="আবহাওয়ার পূর্বাভাস আনা হচ্ছে…" />
          </section>
        )}

        {location && weatherError && (
          <ErrorState
            title="আবহাওয়ার তথ্য আনা যায়নি"
            error={weatherError}
            onRetry={retry}
          />
        )}

        {/* ৪. আবহাওয়ার তথ্য এলে */}
        {location && weather && (
          <>
            {outlook.length === 0 && (
              <section className="today-card">
                <p className="today-empty">
                  আজকের জন্য পূর্বাভাসের তথ্য পাওয়া যায়নি।
                </p>
              </section>
            )}

            {outlook.length > 0 && (
              <section className="today-card">
                <h2>
                  <CloudRain size={20} />
                  {location.upazila}: আগামী ৩ দিনের পূর্বাভাস
                </h2>
             <div style={{ marginBottom: "14px" }}>
                  <ListenButton text={speechText} />
                </div>
                <div className="today-outlook">
                  {outlook.map((day, index) => {
                    const info = getWeatherInfo(day.weatherCode);
                    const Icon = info.Icon;

                    return (
                      <article className="today-day" key={day.date}>
                        <h3>
                          {DAY_LABELS[index]} ({formatShortDate(day.date)})
                        </h3>

                        <p>
                          <Icon size={18} />
                          {info.label}
                        </p>

                        <p>
                          <ThermometerSun size={18} />
                          সর্বোচ্চ {formatNumber(day.maxTemp, 1)}°C, সর্বনিম্ন{" "}
                          {formatNumber(day.minTemp, 1)}°C
                        </p>

                        <p>
                          <Droplets size={18} />
                          বৃষ্টি প্রায় {formatNumber(day.rain, 1)} মিমি
                          {typeof day.rainProbability === "number" &&
                            ` (সম্ভাবনা ${formatNumber(day.rainProbability)}%)`}
                        </p>

                        <p>
                          <Wind size={18} />
                          বাতাস সর্বোচ্চ {formatNumber(day.windMax)} কিমি/ঘণ্টা
                        </p>
                      </article>
                    );
                  })}
                </div>
                <ForecastChart days={outlook} />
                <p className="today-note">
                  <Info size={15} />
                  উৎস: Open-Meteo (আবহাওয়া মডেলের পূর্বাভাস)। এটি নিশ্চিত
                  পর্যবেক্ষণ বা মাঠের সরাসরি সেন্সর-তথ্য নয়। তথ্য আনা হয়েছে:{" "}
                  {formatDateTime(weather.fetchedAt)}।
                </p>
              </section>
            )}

            {/* বৃষ্টির মনোযোগ-কার্ড */}
            {outlook.length > 0 && (
              <section className="today-card today-card--watch">
                <h2>
                  <Droplets size={20} />
                  বৃষ্টি নিয়ে খেয়াল রাখুন
                </h2>

                {rainSoon ? (
                  <p>
                    পূর্বাভাসে আজ বা আগামীকাল বৃষ্টির সম্ভাবনা আছে। সার, কীটনাশক
                    বা সেচ দেওয়ার আগে এটি মাথায় রাখুন এবং যাচাইকৃত কৃষি
                    নির্দেশিকা বা স্থানীয় কৃষি অফিসের পরামর্শ দেখুন।
                  </p>
                ) : (
                  <p>
                    পূর্বাভাসে আজ ও আগামীকাল বৃষ্টির তথ্য নেই। তবে পূর্বাভাস
                    বদলাতে পারে, তাই কাজের আগে আবার দেখে নিন।
                  </p>
                )}
              </section>
            )}

            {/* সতর্কতা */}
            <section className="today-card">
              <h2>
                <TriangleAlert size={20} />
                আগামী ৩ দিনের সম্ভাব্য সতর্কতা
              </h2>

              {upcomingAlerts.length === 0 ? (
                <p className="today-empty">
                  আগামী ৩ দিনের পূর্বাভাসে কোনো সতর্কতার শ্রেণির মান পাওয়া
                  যায়নি।
                </p>
              ) : (
                <ul className="today-alerts">
                  {upcomingAlerts.map((alert) => (
                    <li key={`${alert.date}-${alert.type}`}>
                      <TriangleAlert size={20} />
                      <div>
                        <strong>
                          {formatShortDate(alert.date)}: {alert.title}
                        </strong>
                        <p>{alert.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <p className="today-note">
                <Info size={15} />
                {ALERT_NOTE} {WIND_NOTE}
              </p>
            </section>
          </>
        )}

        {/* ৫. ফসল ও রোপণের পর কত দিন */}
        <section className="today-card">
          <h2>
            <Sprout size={20} />
            আপনার ফসল
          </h2>

          {!selectedCrop && (
            <p className="today-empty">ওপরে আপনার ফসল বাছুন।</p>
          )}

          {selectedCrop && !profile.plantingDate && (
            <p className="today-empty">
              {selectedCrop.name_bn} বাছা হয়েছে। রোপণের তারিখ দিলে কত দিন
              হলো তা দেখাবে।
            </p>
          )}

          {selectedCrop && profile.plantingDate && daysSincePlanting === null && (
            <p className="today-empty">রোপণের তারিখটি সঠিক নয়।</p>
          )}

          {selectedCrop && daysSincePlanting !== null && daysSincePlanting < 0 && (
            <p className="today-empty">
              রোপণের তারিখ ভবিষ্যতে দেওয়া হয়েছে। সঠিক তারিখ দিন।
            </p>
          )}

          {selectedCrop && daysSincePlanting !== null && daysSincePlanting >= 0 && (
            <p className="today-big">
              {selectedCrop.name_bn} রোপণের পর আজ{" "}
              <strong>{formatNumber(daysSincePlanting)}</strong> দিন।
            </p>
          )}

          <p className="today-note">
            <Info size={15} />
            ফসলের বৃদ্ধির পর্যায় ও পর্যায়ভিত্তিক করণীয় যাচাইকৃত তথ্য ছাড়া
            দেখানো হয় না। এই তথ্য যাচাই হলে এখানে যোগ হবে।
          </p>
        </section>

        {/* ৬. নির্দেশনা */}
        <section className="today-card today-card--watch">
          <h2>
            <Info size={20} />
            গুরুত্বপূর্ণ নির্দেশনা
          </h2>
          <p>
            এখানকার তথ্য আবহাওয়ার পূর্বাভাসভিত্তিক সহায়ক তথ্য, চূড়ান্ত কৃষি
            পরামর্শ নয়। সার, কীটনাশক বা সেচ প্রয়োগের আগে যাচাইকৃত কৃষি
            নির্দেশিকা অনুসরণ করুন এবং নিশ্চিত হতে স্থানীয় উপজেলা কৃষি
            অফিসে যোগাযোগ করুন।
          </p>
        </section>
      </div>
    </main>
  );
}

export default DailyActions;