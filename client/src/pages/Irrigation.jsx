import { useEffect, useState } from "react";
import useFarmerProfile from "../hooks/useFarmerProfile";
import { findLocation } from "../utils/locations";
import {
  Droplets,
  Sprout,
  LandPlot,
  CalendarDays,
  MapPin,
  Info,
  ShieldAlert,
  CloudRain,
  Thermometer,
  Wind,
  RefreshCw,
  CheckCircle2,
  CloudSun,
  AlertTriangle,
} from "lucide-react";

import PageHero from "../components/PageHero";
import { fetchWeather } from "../services/api";
import "./Irrigation.css";

// Weather Dashboard-এর সঙ্গে একই লোকেশন ব্যবহার করা হয়েছে।
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

const cropOptions = [
  { value: "boro_rice", label: "বোরো ধান" },
  { value: "potato", label: "আলু" },
  { value: "tomato", label: "টমেটো" },
  { value: "mustard", label: "সরিষা" },
];

const soilOptions = [
  { value: "clay", label: "এঁটেল মাটি" },
  { value: "loamy", label: "দোআঁশ মাটি" },
  { value: "sandy", label: "বেলে মাটি" },
  { value: "silty", label: "পলি মাটি" },
  { value: "unknown", label: "জানি না" },
];

const irrigationOptions = [
  { value: "available", label: "আছে" },
  { value: "limited", label: "সীমিত" },
  { value: "unavailable", label: "নেই" },
];

function formatDate(dateString) {
  if (!dateString) return "তথ্য নেই";

  return new Intl.DateTimeFormat("bn-BD", {
    day: "numeric",
    month: "long",
    weekday: "long",
    timeZone: "Asia/Dhaka",
  }).format(new Date(`${dateString}T00:00:00+06:00`));
}

function formatDateTime(dateString) {
  if (!dateString) return "সময় পাওয়া যায়নি";

  return new Intl.DateTimeFormat("bn-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

function Irrigation() {
    const { profile, updateProfile } = useFarmerProfile();

  const [form, setForm] = useState(() => {
    const saved = findLocation(profile.upazilaId);

    return {
      districtId: saved?.districtId ?? "gazipur",
      upazilaId: saved?.upazilaId ?? "gazipur_sadar",
      crop: profile.cropId || "boro_rice",
      landDecimal: "",
      soilType: "unknown",
      irrigation: "available",
      plantingDate: profile.plantingDate,
    };
  });

  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [requestCount, setRequestCount] = useState(0);

  const selectedLocation = locationOptions.find(
    (location) =>
      location.districtId === form.districtId &&
      location.upazilaId === form.upazilaId
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
    (location) => location.districtId === form.districtId
  );

  const selectedCrop = cropOptions.find(
    (crop) => crop.value === form.crop
  );

  const selectedSoil = soilOptions.find(
    (soil) => soil.value === form.soilType
  );

  const selectedIrrigation = irrigationOptions.find(
    (item) => item.value === form.irrigation
  );

  const landDecimal = Number(form.landDecimal);

  const landBigha =
    form.landDecimal && landDecimal > 0
      ? landDecimal / 33
      : null;

   const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    // সংরক্ষিত তথ্য সব পেজে মিলিয়ে রাখা
    const profileKey = {
      upazilaId: "upazilaId",
      crop: "cropId",
      plantingDate: "plantingDate",
    }[name];

    if (profileKey) updateProfile({ [profileKey]: value });

    setSubmitted(false);
    setError("");
  };

  const handleDistrictChange = (event) => {
    const nextDistrict = event.target.value;

    const firstUpazila = locationOptions.find(
      (location) => location.districtId === nextDistrict
    );

    setForm((previous) => ({
      ...previous,
      districtId: nextDistrict,
      upazilaId: firstUpazila?.upazilaId || "",
    }));
    
    updateProfile({ upazilaId: firstUpazila?.upazilaId || "" });

    setWeather(null);
    setSubmitted(false);
    setError("");
  };

  // এলাকা পরিবর্তন বা Refresh করলে আবহাওয়ার তথ্য নতুন করে আনা হবে।
  useEffect(() => {
    if (!selectedLocation) return undefined;

    const controller = new AbortController();

    async function loadWeather() {
      setLoading(true);
      setError("");
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
          setError(
            err.message || "আবহাওয়ার তথ্য পাওয়া যায়নি। আবার চেষ্টা করুন।"
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadWeather();

    return () => controller.abort();
  }, [selectedLocation, requestCount]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.landDecimal || landDecimal <= 0) {
      return;
    }

    setSubmitted(true);
  };

  const daily = weather?.daily;
  const current = weather?.current;

  const nextThreeDays = daily?.time?.slice(0, 3) || [];

  const nextThreeDaysRain = nextThreeDays.reduce(
    (total, date, index) => {
      return total + Number(daily.precipitation_sum[index] || 0);
    },
    0
  );

  const nextThreeDaysRainProbability = nextThreeDays.map(
    (date, index) => ({
      date,
      probability:
        daily.precipitation_probability_max?.[index] ?? null,
      rainfall: daily.precipitation_sum?.[index] ?? null,
    })
  );

  return (
    <main className="irrigation-page">
      <PageHero
        eyebrow="AgriSense BD · পানি ব্যবস্থাপনা"
        title="সঠিক সেচ ব্যবস্থাপনায় পানির অপচয় কমান"
        description="জমি, ফসল, মাটির ধরন ও এলাকার আবহাওয়ার তথ্য একসঙ্গে বিবেচনা করে সেচ ব্যবস্থাপনায় সহায়তা নিন।"
        icon={Droplets}
      />

      <div className="container irrigation-container">
        {/* Introduction cards */}
        <section className="irrigation-info-grid">
          <article className="irrigation-info-card">
            <div className="irrigation-info-icon">
              <CloudSun size={23} />
            </div>
            <h3>আবহাওয়ার তথ্য</h3>
            <p>
              এলাকার বর্তমান আবহাওয়া ও আগামী দিনের বৃষ্টির পূর্বাভাস
              দেখুন।
            </p>
          </article>

          <article className="irrigation-info-card">
            <div className="irrigation-info-icon">
              <Sprout size={23} />
            </div>
            <h3>ফসলের তথ্য</h3>
            <p>
              ফসল, রোপণের তারিখ ও বৃদ্ধির পর্যায় সেচ ব্যবস্থাপনায়
              গুরুত্বপূর্ণ।
            </p>
          </article>

          <article className="irrigation-info-card">
            <div className="irrigation-info-icon">
              <LandPlot size={23} />
            </div>
            <h3>মাটির বৈশিষ্ট্য</h3>
            <p>
              মাটির ধরন ও পানি ধারণক্ষমতা সেচের প্রয়োজনীয়তা
              মূল্যায়নে সাহায্য করে।
            </p>
          </article>
        </section>

        {/* Farmer input form */}
        <section className="irrigation-panel">
          <div className="irrigation-section-heading">
            <div>
              <span className="irrigation-kicker">জমির তথ্য</span>
              <h2>আপনার জমির তথ্য দিন</h2>
              <p>
                আপনার এলাকার আবহাওয়ার সঙ্গে জমির তথ্য মিলিয়ে দেখুন।
              </p>
            </div>

            <div className="irrigation-heading-icon">
              <LandPlot size={26} />
            </div>
          </div>

          <form className="irrigation-form" onSubmit={handleSubmit}>
            <div className="irrigation-form-grid">
              <div className="irrigation-field">
                <label htmlFor="irrigation-district">
                  <MapPin size={16} />
                  জেলা
                </label>

                <select
                  id="irrigation-district"
                  name="districtId"
                  value={form.districtId}
                  onChange={handleDistrictChange}
                >
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="irrigation-field">
                <label htmlFor="irrigation-upazila">
                  <MapPin size={16} />
                  উপজেলা
                </label>

                <select
                  id="irrigation-upazila"
                  name="upazilaId"
                  value={form.upazilaId}
                  onChange={updateField}
                >
                  {upazilas.map((upazila) => (
                    <option
                      key={upazila.upazilaId}
                      value={upazila.upazilaId}
                    >
                      {upazila.upazila}
                    </option>
                  ))}
                </select>
              </div>

              <div className="irrigation-field">
                <label htmlFor="irrigation-crop">
                  <Sprout size={16} />
                  ফসল
                </label>

                <select
                  id="irrigation-crop"
                  name="crop"
                  value={form.crop}
                  onChange={updateField}
                >
                  {cropOptions.map((crop) => (
                    <option key={crop.value} value={crop.value}>
                      {crop.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="irrigation-field">
                <label htmlFor="irrigation-land">
                  <LandPlot size={16} />
                  জমির পরিমাণ (ডেসিমেল)
                </label>

                <input
                  id="irrigation-land"
                  name="landDecimal"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.landDecimal}
                  onChange={updateField}
                  placeholder="যেমন: ৫০"
                  required
                />

                <small>
                  ১ বিঘা = ৩৩ ডেসিমেল
                  {landBigha !== null && (
                    <strong>
                      {" "}
                      · প্রায় {landBigha.toFixed(2)} বিঘা
                    </strong>
                  )}
                </small>
              </div>

              <div className="irrigation-field">
                <label htmlFor="irrigation-soil">
                  <LandPlot size={16} />
                  মাটির ধরন
                </label>

                <select
                  id="irrigation-soil"
                  name="soilType"
                  value={form.soilType}
                  onChange={updateField}
                >
                  {soilOptions.map((soil) => (
                    <option key={soil.value} value={soil.value}>
                      {soil.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="irrigation-field">
                <label htmlFor="irrigation-availability">
                  <Droplets size={16} />
                  সেচের সুবিধা
                </label>

                <select
                  id="irrigation-availability"
                  name="irrigation"
                  value={form.irrigation}
                  onChange={updateField}
                >
                  {irrigationOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="irrigation-field">
                <label htmlFor="irrigation-planting-date">
                  <CalendarDays size={16} />
                  রোপণ / বপনের তারিখ
                </label>

                <input
                  id="irrigation-planting-date"
                  name="plantingDate"
                  type="date"
                  value={form.plantingDate}
                  onChange={updateField}
                />
              </div>
            </div>

            <button
              className="irrigation-submit"
              type="submit"
              disabled={!form.landDecimal || landDecimal <= 0}
            >
              <CheckCircle2 size={18} />
              জমির তথ্য মূল্যায়ন করুন
            </button>
          </form>
        </section>

        {/* Weather data section */}
        <section className="irrigation-panel">
          <div className="irrigation-section-heading">
            <div>
              <span className="irrigation-kicker">স্থানীয় আবহাওয়া</span>
              <h2>সেচের জন্য আবহাওয়ার তথ্য</h2>
              <p>
                {selectedLocation?.upazila},{" "}
                {selectedLocation?.district} এলাকার পূর্বাভাস।
              </p>
            </div>

            <button
              type="button"
              className="irrigation-refresh"
              onClick={() => setRequestCount((count) => count + 1)}
              disabled={loading}
              aria-label="আবহাওয়ার তথ্য আবার আনুন"
            >
              <RefreshCw size={18} />
              <span>Refresh</span>
            </button>
          </div>

          {loading && (
            <div className="irrigation-weather-state">
              <RefreshCw size={25} className="irrigation-spin" />
              <p>আবহাওয়ার তথ্য আনা হচ্ছে...</p>
            </div>
          )}

          {!loading && error && (
            <div className="irrigation-weather-error" role="alert">
              <AlertTriangle size={23} />
              <div>
                <strong>আবহাওয়ার তথ্য পাওয়া যায়নি</strong>
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => setRequestCount((count) => count + 1)}
                >
                  আবার চেষ্টা করুন
                </button>
              </div>
            </div>
          )}

          {!loading && !error && weather && current && daily && (
            <>
              <div className="irrigation-weather-grid">
                <article className="irrigation-weather-card">
                  <div className="irrigation-weather-icon">
                    <Thermometer size={22} />
                  </div>
                  <span>বর্তমান তাপমাত্রা</span>
                  <strong>{current.temperature_2m ?? "—"}°C</strong>
                </article>

                <article className="irrigation-weather-card">
                  <div className="irrigation-weather-icon">
                    <Droplets size={22} />
                  </div>
                  <span>বর্তমান বৃষ্টিপাত</span>
                  <strong>{current.precipitation ?? "—"} মিমি</strong>
                </article>

                <article className="irrigation-weather-card">
                  <div className="irrigation-weather-icon">
                    <Wind size={22} />
                  </div>
                  <span>বাতাসের গতি</span>
                  <strong>{current.wind_speed_10m ?? "—"} কিমি/ঘণ্টা</strong>
                </article>

                <article className="irrigation-weather-card">
                  <div className="irrigation-weather-icon">
                    <CloudRain size={22} />
                  </div>
                  <span>আগামী ৩ দিনের পূর্বাভাসকৃত বৃষ্টি</span>
                  <strong>{nextThreeDaysRain.toFixed(1)} মিমি</strong>
                </article>
              </div>

              <div className="irrigation-rain-forecast">
                <h3>
                  <CloudRain size={19} />
                  আগামী ৩ দিনের বৃষ্টির পূর্বাভাস
                </h3>

                <div className="irrigation-rain-list">
                  {nextThreeDaysRainProbability.map((day) => (
                    <div className="irrigation-rain-day" key={day.date}>
                      <span>{formatDate(day.date)}</span>
                      <strong>
                        {day.rainfall ?? "—"} মিমি
                      </strong>
                      <span>
                        বৃষ্টির সম্ভাবনা:{" "}
                        {day.probability === null
                          ? "তথ্য নেই"
                          : `${day.probability}%`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="irrigation-weather-source">
                <Info size={15} />
                উৎস: Open-Meteo · পূর্বাভাসের তথ্য · সংগ্রহের সময়:{" "}
                {formatDateTime(weather.fetchedAt)}
              </p>
            </>
          )}
        </section>

        {/* Submitted land summary */}
        {submitted && (
          <section className="irrigation-panel irrigation-summary">
            <div className="irrigation-summary-heading">
              <CheckCircle2 size={23} />
              <div>
                <h2>আপনার জমির তথ্য</h2>
                <p>আপনার দেওয়া তথ্য সফলভাবে এই পেজে দেখানো হয়েছে।</p>
              </div>
            </div>

            <div className="irrigation-summary-grid">
              <div>
                <span>এলাকা</span>
                <strong>
                  {selectedLocation?.district},{" "}
                  {selectedLocation?.upazila}
                </strong>
              </div>

              <div>
                <span>ফসল</span>
                <strong>{selectedCrop?.label}</strong>
              </div>

              <div>
                <span>জমির পরিমাণ</span>
                <strong>
                  {landDecimal} ডেসিমেল
                  {landBigha !== null &&
                    ` (${landBigha.toFixed(2)} বিঘা)`}
                </strong>
              </div>

              <div>
                <span>মাটির ধরন</span>
                <strong>{selectedSoil?.label}</strong>
              </div>

              <div>
                <span>সেচের সুবিধা</span>
                <strong>{selectedIrrigation?.label}</strong>
              </div>

              <div>
                <span>রোপণের তারিখ</span>
                <strong>
                  {form.plantingDate
                    ? formatDate(form.plantingDate)
                    : "দেওয়া হয়নি"}
                </strong>
              </div>
            </div>
          </section>
        )}

        {/* Irrigation evaluation */}
        <section className="irrigation-panel irrigation-evaluation">
          <div className="irrigation-section-heading">
            <div>
              <span className="irrigation-kicker">সেচ মূল্যায়ন</span>
              <h2>সেচের প্রয়োজনীয়তা</h2>
              <p>
                আবহাওয়া ও জমির তথ্য একসঙ্গে দেখুন। তবে চূড়ান্ত
                সেচের পরিমাণ নির্ধারণের জন্য আরও যাচাইকৃত তথ্য প্রয়োজন।
              </p>
            </div>

            <span className="irrigation-status">
              <ShieldAlert size={15} />
              পরিমাণ নির্ধারিত নয়
            </span>
          </div>

          <div className="irrigation-unavailable">
            <div className="irrigation-unavailable-icon">
              <ShieldAlert size={29} />
            </div>

            <div>
              <h3>এখনো নির্দিষ্ট সেচের পরামর্শ দেওয়া যাচ্ছে না</h3>

              <p>
                আবহাওয়ার পূর্বাভাস পাওয়া গেলেও শুধু বৃষ্টিপাত,
                তাপমাত্রা বা ET₀ দিয়ে ফসলের প্রকৃত পানির চাহিদা
                নির্ধারণ করা যায় না।
              </p>
            </div>
          </div>

          <div className="irrigation-requirements">
            <div>
              <Info size={17} />
              <span>ফসল ও বৃদ্ধির পর্যায় অনুযায়ী যাচাইকৃত Kc</span>
            </div>

            <div>
              <Info size={17} />
              <span>মাটির পানি ধারণক্ষমতা ও আর্দ্রতা</span>
            </div>

            <div>
              <Info size={17} />
              <span>কার্যকর বৃষ্টিপাত ও সেচ পদ্ধতি</span>
            </div>

            <div>
              <Info size={17} />
              <span>স্থানীয় কৃষি নির্দেশিকা ও যাচাইকৃত উৎস</span>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="irrigation-disclaimer">
          <AlertTriangle size={20} />
          <p>
            <strong>গুরুত্বপূর্ণ:</strong> এই পেজের আবহাওয়ার তথ্য
            Open-Meteo-এর পূর্বাভাস, মাঠের সেন্সর থেকে পাওয়া তথ্য নয়।
            এখানে বৃষ্টির পরিমাণ দেখানো হচ্ছে, কিন্তু সেটি জমিতে
            কার্যকরভাবে কতটা পানি পৌঁছাবে তা বোঝায় না। যাচাইকৃত
            কৃষি তথ্য ছাড়া কোনো নির্দিষ্ট সেচের পরিমাণ বা সময়সূচি
            দেওয়া হচ্ছে না।
          </p>
        </section>
      </div>
    </main>
  );
}

export default Irrigation;