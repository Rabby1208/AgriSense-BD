import { buildWeatherAlerts } from "./weatherAlerts";
import { parseDateInput } from "./dates";

// আজকের তারিখ (ঢাকার সময় অনুযায়ী) "YYYY-MM-DD" আকারে
export function getDhakaToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Open-Meteo-র daily থেকে আজ থেকে শুরু করে `count` দিনের সারসংক্ষেপ।
// এখানে কোনো সীমা (threshold) বানানো হয়নি; শুধু পূর্বাভাসের মান সাজানো হয়েছে।
export function buildOutlook(daily, today, count = 3) {
  if (!daily?.time?.length) return [];

  const startIndex = Math.max(daily.time.indexOf(today), 0);

  return daily.time.slice(startIndex, startIndex + count).map((date, offset) => {
    const index = startIndex + offset;

    return {
      date,
      weatherCode: daily.weather_code?.[index] ?? null,
      maxTemp: daily.temperature_2m_max?.[index] ?? null,
      minTemp: daily.temperature_2m_min?.[index] ?? null,
      rain: daily.precipitation_sum?.[index] ?? null,
      rainProbability: daily.precipitation_probability_max?.[index] ?? null,
      windMax: daily.wind_speed_10m_max?.[index] ?? null,
    };
  });
}

// আগামী ৩ দিনের মধ্যে থাকা সতর্কতা (BMD শ্রেণি, যাচাই বাকি থাকার নোটসহ UI-তে দেখাতে হবে)
export function buildUpcomingAlerts(daily, outlook) {
  const dates = new Set(outlook.map((day) => day.date));

  return buildWeatherAlerts(daily).filter((alert) => dates.has(alert.date));
}

// পূর্বাভাসে আজ বা আগামীকাল যেকোনো পরিমাণ বৃষ্টি আছে কি না (কোনো বানানো সীমা নেই)
export function hasForecastRainSoon(outlook) {
  return outlook
    .slice(0, 2)
    .some((day) => typeof day.rain === "number" && day.rain > 0);
}

// রোপণের পর কত দিন হলো। শুধু তারিখের হিসাব, কোনো কৃষি-তথ্য নয়।
export function getDaysSincePlanting(plantingDate, today) {
  const planted = parseDateInput(plantingDate);
  const now = parseDateInput(today);

  if (!planted || !now) return null;

  return Math.round((now.getTime() - planted.getTime()) / 86400000);
}