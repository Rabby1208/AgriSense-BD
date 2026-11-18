// =====================================================
// AGRISENSE BD — আবহাওয়া সতর্কতার নিয়ম
// তাপপ্রবাহ, শৈত্যপ্রবাহ ও বৃষ্টির শ্রেণি BMD-র শ্রেণিবিভাগ অনুযায়ী
// (BAMIS দৈনিক আবহাওয়া টেবিলে প্রকাশিত)।
// এগুলো পূর্বাভাস-মডেলের সংখ্যা, মাঠের নিশ্চিত পর্যবেক্ষণ নয়।
// =====================================================

export const ALERT_THRESHOLD_SOURCE = {
  organization: "BMD / BAMIS (DAE)",
  document: "BAMIS দৈনিক আবহাওয়া টেবিল",
  url: "https://www.bamis.gov.bd/res/public/weather_table/pdf/2024-09-08.pdf",
  status: "TODO_VERIFY",
};

// মূল PDF-এর সঙ্গে মিলিয়ে দেখার পর এটি true করুন।
export const ALERT_THRESHOLDS_VERIFIED = false;

// যাচাইকৃত সীমা না পাওয়া পর্যন্ত null থাকবে। সংখ্যা বানানো যাবে না।
export const WIND_ALERT_THRESHOLD_KMH = null;

export const ALERT_NOTE = ALERT_THRESHOLDS_VERIFIED
  ? "সতর্কতার সীমা BMD-র শ্রেণিবিভাগ অনুযায়ী। এটি পূর্বাভাস, নিশ্চিত পর্যবেক্ষণ নয়।"
  : "সতর্কতার সীমা BMD-র শ্রেণিবিভাগ থেকে নেওয়া, তবে মূল নথির সঙ্গে মেলানো বাকি (TODO_VERIFY)। এটি পূর্বাভাস, নিশ্চিত পর্যবেক্ষণ নয়।";

export const WIND_NOTE =
  WIND_ALERT_THRESHOLD_KMH === null
    ? "শক্তিশালী বাতাসের সতর্কতার যাচাইকৃত সীমা এখনো যোগ করা হয়নি (TODO_VERIFY), তাই বাতাসের সতর্কতা দেখানো হচ্ছে না।"
    : "";

// ছোট থেকে বড় ক্রমে। শেষে মিলে যাওয়া শ্রেণিটিই নেওয়া হয়।
const HEAT_LEVELS = [
  { min: 36, label: "মৃদু" },
  { min: 38, label: "মাঝারি" },
  { min: 40, label: "তীব্র" },
  { min: 42, label: "অতি তীব্র" },
];

// ন্যূনতম তাপমাত্রা যত কম, শ্রেণি তত তীব্র
const COLD_LEVELS = [
  { max: 10, label: "মৃদু" },
  { max: 8, label: "মাঝারি" },
  { max: 6, label: "তীব্র" },
  { max: 4, label: "অতি তীব্র" },
];

function getHeatLevel(maxTemp) {
  return HEAT_LEVELS.filter((level) => maxTemp >= level.min).pop() ?? null;
}

function getColdLevel(minTemp) {
  return COLD_LEVELS.filter((level) => minTemp <= level.max).pop() ?? null;
}

function getRainLevel(rainMm) {
  if (rainMm > 88) return "অতি ভারী";
  if (rainMm >= 44) return "ভারী";
  if (rainMm >= 23) return "মাঝারি ভারী";
  return null;
}

function formatTemp(value) {
  return Number(value).toLocaleString("bn-BD", { maximumFractionDigits: 1 });
}

function formatMm(value) {
  return Number(value).toLocaleString("bn-BD", { maximumFractionDigits: 0 });
}

// Open-Meteo-র daily অবজেক্ট থেকে সতর্কতার তালিকা বানায়।
export function buildWeatherAlerts(daily) {
  if (!daily?.time) return [];

  const alerts = [];

  daily.time.forEach((date, index) => {
    const maxTemp = daily.temperature_2m_max?.[index];
    const minTemp = daily.temperature_2m_min?.[index];
    const rain = daily.precipitation_sum?.[index];
    const code = daily.weather_code?.[index];

    if (typeof rain === "number") {
      const level = getRainLevel(rain);

      if (level) {
        alerts.push({
          date,
          type: "rain",
          title: `${level} বৃষ্টির সম্ভাবনা`,
          description: `পূর্বাভাসে ওই দিনের মোট বৃষ্টি প্রায় ${formatMm(rain)} মিমি। মাঠের পানি নিষ্কাশন ও কাজের পরিকল্পনায় সতর্ক থাকুন।`,
        });
      }
    }

    if (typeof maxTemp === "number") {
      const level = getHeatLevel(maxTemp);

      if (level) {
        alerts.push({
          date,
          type: "heat",
          title: `${level.label} তাপপ্রবাহের সম্ভাবনা`,
          description: `পূর্বাভাসে সর্বোচ্চ তাপমাত্রা প্রায় ${formatTemp(maxTemp)}°C। দুপুরে খোলা মাঠে কাজ কমান ও পর্যাপ্ত পানি পান করুন।`,
        });
      }
    }

    if (typeof minTemp === "number") {
      const level = getColdLevel(minTemp);

      if (level) {
        alerts.push({
          date,
          type: "cold",
          title: `${level.label} শৈত্যপ্রবাহের সম্ভাবনা`,
          description: `পূর্বাভাসে সর্বনিম্ন তাপমাত্রা প্রায় ${formatTemp(minTemp)}°C। স্থানীয় কৃষি অফিসের পরামর্শ দেখুন।`,
        });
      }
    }

    if ([95, 96, 99].includes(code)) {
      alerts.push({
        date,
        type: "storm",
        title: "বজ্রঝড়ের সম্ভাবনা",
        description:
          "পূর্বাভাসে বজ্রঝড়ের সংকেত রয়েছে। খোলা মাঠে কাজ করার সময় সতর্ক থাকুন।",
      });
    }
  });

  return alerts;
}