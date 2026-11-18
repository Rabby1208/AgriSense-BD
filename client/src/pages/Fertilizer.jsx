
import { useState } from "react";
import useFarmerProfile from "../hooks/useFarmerProfile";
import {
  Calculator,
  Sprout,
  LandPlot,
  Info,
  ShieldAlert,
  Database,
  CalendarDays,
  FlaskConical,
} from "lucide-react";

const crops = [
  { value: "boro_rice", label: "বোরো ধান" },
  { value: "potato", label: "আলু" },
  { value: "tomato", label: "টমেটো" },
  { value: "mustard", label: "সরিষা" },
];

function Fertilizer() {
    const { profile, updateProfile } = useFarmerProfile();

  const [crop, setCrop] = useState(profile.cropId);
  const [landDecimal, setLandDecimal] = useState("");
  const [soilType, setSoilType] = useState("");
   const [plantingDate, setPlantingDate] = useState(profile.plantingDate);

  const landValue = Number(landDecimal);
  const validLand =
    landDecimal.trim() !== "" &&
    Number.isFinite(landValue) &&
    landValue > 0;

  const bighaValue = validLand
    ? (landValue / 33).toFixed(3)
    : "0.000";

  return (
    <main className="fertilizer-page">
      <section className="fertilizer-hero">
        <div className="container">
          <div className="fertilizer-hero-content">
            <span className="section-eyebrow">
              <Calculator size={16} />
              Fertilizer Calculator
            </span>

            <h1>সার ক্যালকুলেটর</h1>

            <p>
              ফসল, জমির পরিমাণ, মাটির ধরন ও রোপণের সময় অনুযায়ী
              যাচাইকৃত সার প্রয়োগের হিসাব পাওয়ার ব্যবস্থা।
            </p>
          </div>

          <div className="fertilizer-hero-icon">
            <FlaskConical size={68} strokeWidth={1.4} />
          </div>
        </div>
      </section>

      <section className="container fertilizer-content">
        <div className="fertilizer-form-card">
          <div className="fertilizer-section-heading">
            <div className="fertilizer-heading-icon">
              <Sprout size={22} />
            </div>

            <div>
              <h2>জমি ও ফসলের তথ্য</h2>
              <p>আপনার জমি সম্পর্কিত তথ্য নির্বাচন করুন।</p>
            </div>
          </div>

          <div className="fertilizer-form-grid">
            <div className="fertilizer-field">
              <label htmlFor="fertilizer-crop">ফসল নির্বাচন করুন</label>

              <select
                id="fertilizer-crop"
                value={crop}
                                onChange={(event) => {
                  setCrop(event.target.value);
                  updateProfile({ cropId: event.target.value });
                }}
              >
                <option value="">ফসল নির্বাচন করুন</option>

                {crops.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="fertilizer-field">
              <label htmlFor="fertilizer-land">
                জমির পরিমাণ (শতাংশ / ডেসিমেল)
              </label>

              <input
                id="fertilizer-land"
                type="number"
                min="0"
                step="any"
                placeholder="যেমন: ৫০"
                value={landDecimal}
                onChange={(event) => setLandDecimal(event.target.value)}
              />

              <span className="fertilizer-field-help">
                ১ বিঘা = ৩৩ শতাংশ
              </span>
            </div>

            <div className="fertilizer-field">
              <label htmlFor="fertilizer-soil">মাটির ধরন</label>

              <select
                id="fertilizer-soil"
                value={soilType}
                onChange={(event) => setSoilType(event.target.value)}
              >
                <option value="">মাটির ধরন নির্বাচন করুন</option>
                <option value="clay">এঁটেল মাটি</option>
                <option value="loamy">দোআঁশ মাটি</option>
                <option value="sandy">বেলে মাটি</option>
                <option value="silty">পলি মাটি</option>
                <option value="unknown">জানা নেই</option>
              </select>
            </div>

            <div className="fertilizer-field">
              <label htmlFor="fertilizer-date">রোপণের তারিখ</label>

              <input
                id="fertilizer-date"
                type="date"
                value={plantingDate}
                                onChange={(event) => {
                  setPlantingDate(event.target.value);
                  updateProfile({ plantingDate: event.target.value });
                }}
              />
            </div>
          </div>

          <div className="fertilizer-land-preview">
            <div className="fertilizer-land-icon">
              <LandPlot size={22} />
            </div>

            <div>
              <span>জমির পরিমাণের রূপান্তর</span>

              <strong>
                {validLand ? `${landValue} শতাংশ` : "জমির পরিমাণ দিন"}
              </strong>
            </div>

            <div className="fertilizer-bigha-value">
              <span>বিঘা</span>
              <strong>{bighaValue}</strong>
            </div>
          </div>

          <div className="fertilizer-unavailable">
            <ShieldAlert size={22} />

            <div>
              <h3>সার প্রয়োগের হিসাব এখনো প্রস্তুত নয়</h3>

              <p>
                নির্বাচিত ফসল ও মাটির জন্য যাচাইকৃত সার প্রয়োগের
                মাত্রা, একক এবং প্রয়োগের সময়সূচি ডেটাবেজে
                সংযুক্ত না হওয়া পর্যন্ত হিসাব তৈরি করা হবে না।
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary fertilizer-calculate-button"
            disabled
          >
            <Calculator size={18} />
            সার হিসাব করুন
          </button>

          <p className="fertilizer-disabled-note">
            যাচাইকৃত কৃষি-তথ্য সংযুক্ত হলে এই সুবিধাটি চালু হবে।
          </p>
        </div>

        <aside className="fertilizer-info-card">
          <div className="fertilizer-info-icon">
            <Database size={23} />
          </div>

          <h2>যে তথ্যের ভিত্তিতে হিসাব হবে</h2>

          <ul>
            <li>
              <Sprout size={17} />
              ফসলভিত্তিক সুপারিশকৃত সার প্রয়োগের মাত্রা
            </li>

            <li>
              <LandPlot size={17} />
              জমির পরিমাণ ও মাটির ধরন
            </li>

            <li>
              <CalendarDays size={17} />
              সার প্রয়োগের কিস্তি ও সময়সূচি
            </li>

            <li>
              <Database size={17} />
              BARC, BRRI, BARI ও DAE-এর যাচাইকৃত তথ্যসূত্র
            </li>
          </ul>

          <div className="fertilizer-info-note">
            <Info size={18} />
            <p>
              জমির পরিমাণের রূপান্তর এবং সার প্রয়োগের সুপারিশ
              দুটি আলাদা বিষয়। শুধু জমির পরিমাণ জানলেই
              সঠিক সার প্রয়োগের মাত্রা নির্ধারণ করা যায় না।
            </p>
          </div>
        </aside>
      </section>

      <section className="container fertilizer-disclaimer">
        <ShieldAlert size={20} />

        <p>
          অতিরিক্ত বা অপর্যাপ্ত সার প্রয়োগ ফসল ও মাটির ক্ষতি করতে পারে।
          যাচাইকৃত সুপারিশ অনুসরণ করুন এবং নিশ্চিত হতে স্থানীয়
          কৃষি অফিসে যোগাযোগ করুন।
        </p>
      </section>
    </main>
  );
}

export default Fertilizer;
