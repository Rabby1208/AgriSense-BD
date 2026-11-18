import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Info, MapPin, TriangleAlert } from "lucide-react";

import useApiData from "../hooks/useApiData";
import useFarmerProfile from "../hooks/useFarmerProfile";
import { fetchWeather } from "../services/api";
import { findLocation } from "../utils/locations";
import { getWeatherInfo } from "../utils/weatherCodes";
import {
  buildOutlook,
  buildUpcomingAlerts,
  getDhakaToday,
} from "../utils/todaySummary";

import "./TodaySummaryCard.css";

function formatNumber(value, digits = 0) {
  if (typeof value !== "number") return "তথ্য নেই";

  return value.toLocaleString("bn-BD", { maximumFractionDigits: digits });
}

// হোম পেজের "আজকের সারসংক্ষেপ" কার্ড।
// এলাকা সংরক্ষিত থাকলে আজকের পূর্বাভাস দেখায়; না থাকলে এলাকা বাছতে বলে।
function TodaySummaryCard() {
  const { profile } = useFarmerProfile();
  const location = findLocation(profile.upazilaId);

  const fetcher = useMemo(() => {
    if (!location) return null;

    return (options) =>
      fetchWeather(location.latitude, location.longitude, options);
  }, [location]);

  const { data: weather, error, loading, retry } = useApiData(fetcher);

  const outlook = weather ? buildOutlook(weather.daily, getDhakaToday(), 3) : [];
  const today = outlook[0];
  const alerts = weather ? buildUpcomingAlerts(weather.daily, outlook) : [];
  const info = today ? getWeatherInfo(today.weatherCode) : null;
  const Icon = info?.Icon;

  return (
    <div className="home-today">
      <div className="container">
        <div className="home-today-card">
          <h2>
            <MapPin size={20} />
            আজকের সারসংক্ষেপ
            {location && <span>({location.upazila})</span>}
          </h2>

          {!location && (
            <>
              <p>
                আপনার এলাকা বাছলে আজকের আবহাওয়ার পূর্বাভাস ও সম্ভাব্য সতর্কতা
                এখানে দেখা যাবে।
              </p>

              <Link to="/daily-actions" className="btn btn-primary">
                এলাকা বাছুন
                <ArrowRight size={18} />
              </Link>
            </>
          )}

          {location && loading && <p>আবহাওয়ার পূর্বাভাস আনা হচ্ছে…</p>}

          {location && error && (
            <p>
              আবহাওয়ার তথ্য আনা যায়নি।{" "}
              <button type="button" className="home-today-retry" onClick={retry}>
                আবার চেষ্টা করুন
              </button>
            </p>
          )}

          {location && weather && !today && (
            <p>আজকের জন্য পূর্বাভাসের তথ্য পাওয়া যায়নি।</p>
          )}

          {location && today && (
            <>
              <div className="home-today-grid">
                <div>
                  <small>আবহাওয়া</small>
                  <strong>
                    {Icon && <Icon size={20} />}
                    {info.label}
                  </strong>
                </div>

                <div>
                  <small>তাপমাত্রা</small>
                  <strong>
                    {formatNumber(today.minTemp, 1)}° থেকে{" "}
                    {formatNumber(today.maxTemp, 1)}°C
                  </strong>
                </div>

                <div>
                  <small>বৃষ্টি (পূর্বাভাস)</small>
                  <strong>প্রায় {formatNumber(today.rain, 1)} মিমি</strong>
                </div>
              </div>

              {alerts.length > 0 ? (
                <p className="home-today-alert">
                  <TriangleAlert size={18} />
                  আগামী ৩ দিনে {formatNumber(alerts.length)}টি সম্ভাব্য সতর্কতা
                  আছে।
                </p>
              ) : (
                <p className="home-today-ok">
                  আগামী ৩ দিনের পূর্বাভাসে কোনো সতর্কতার শ্রেণির মান পাওয়া
                  যায়নি।
                </p>
              )}

              <Link to="/daily-actions" className="home-today-link">
                বিস্তারিত দেখুন
                <ArrowRight size={16} />
              </Link>

              <p className="home-today-note">
                <Info size={14} />
                উৎস: Open-Meteo। এটি পূর্বাভাস, নিশ্চিত পর্যবেক্ষণ নয়।
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TodaySummaryCard;