
import { useMemo, useState } from "react";
import useFarmerProfile from "../hooks/useFarmerProfile";
import { LOCATION_OPTIONS, findLocation } from "../utils/locations";
import {
  Sprout,
  MapPin,
  LandPlot,
  Droplets,
  CalendarDays,
  ArrowRight,
  ShieldCheck,
  Info,
  RotateCcw,
} from "lucide-react";

const initialForm = {
  district: "",
  upazila: "",
  landDecimal: "",
  soilType: "",
  irrigation: "",
  crop: "",
  plantingDate: "",
};

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

function Advisory() {
    const { profile, updateProfile } = useFarmerProfile();

  const [form, setForm] = useState(() => {
    const saved = findLocation(profile.upazilaId);

    return {
      ...initialForm,
      district: saved?.districtId ?? "",
      upazila: saved?.upazilaId ?? "",
      crop: profile.cropId,
      plantingDate: profile.plantingDate,
    };
  });

  const districtOptions = [
    ...new Map(
      LOCATION_OPTIONS.map((item) => [item.districtId, item.district])
    ).entries(),
  ];

  const upazilaOptions = LOCATION_OPTIONS.filter(
    (item) => item.districtId === form.district
  );
  const [submitted, setSubmitted] = useState(false);

  const landBigha = useMemo(() => {
    const decimal = Number(form.landDecimal);

    if (!form.landDecimal || !Number.isFinite(decimal) || decimal <= 0) {
      return "";
    }

    return (decimal / 33).toFixed(3);
  }, [form.landDecimal]);

    function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    // সংরক্ষিত তথ্য সব পেজে মিলিয়ে রাখা
    const profileKey = { crop: "cropId", plantingDate: "plantingDate" }[name];

    if (profileKey) updateProfile({ [profileKey]: value });

    setSubmitted(false);
  }

  function handleDistrictChange(event) {
    const districtId = event.target.value;
    const first = LOCATION_OPTIONS.find((item) => item.districtId === districtId);

    setForm((previous) => ({
      ...previous,
      district: districtId,
      upazila: first?.upazilaId ?? "",
    }));

    updateProfile({ upazilaId: first?.upazilaId ?? "" });
    setSubmitted(false);
  }

  function handleUpazilaChange(event) {
    const upazilaId = event.target.value;

    setForm((previous) => ({ ...previous, upazila: upazilaId }));
    updateProfile({ upazilaId });
    setSubmitted(false);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const decimal = Number(form.landDecimal);

    if (!Number.isFinite(decimal) || decimal <= 0) {
      return;
    }

    // This step collects user inputs only.
    // Verified advisory calculation will be connected to the backend later.
    setSubmitted(true);
  }

  function handleReset() {
    setForm(initialForm);
    setSubmitted(false);
  }

  return (
    <main className="advisory-page">
      <section className="advisory-hero">
        <div className="container">
          <div className="advisory-hero-content">
            <span className="advisory-eyebrow">
              <Sprout size={16} />
              ব্যক্তিগত কৃষি তথ্য
            </span>

            <h1>আপনার জমির জন্য কৃষি পরামর্শ</h1>

            <p>
              আপনার এলাকার অবস্থান, জমির পরিমাণ, মাটির ধরন এবং
              ফসলের তথ্য দিন। প্রয়োজনীয় তথ্য সংগ্রহের পর যাচাইকৃত
              কৃষি উপাত্তের ভিত্তিতে পরামর্শ তৈরি করা হবে।
            </p>
          </div>
        </div>
      </section>

      <section className="advisory-content-section">
        <div className="container advisory-layout">
          <div className="advisory-form-card">
            <div className="advisory-card-heading">
              <div className="advisory-heading-icon">
                <LandPlot size={23} />
              </div>

              <div>
                <h2>জমি ও ফসলের তথ্য</h2>
                <p>প্রয়োজনীয় তথ্যগুলো সঠিকভাবে পূরণ করুন।</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Location */}
              <div className="advisory-form-group">
                <div className="advisory-field-heading">
                  <MapPin size={18} />
                  <h3>১. জমির অবস্থান</h3>
                </div>
<div className="advisory-input-grid">
                  <div className="advisory-field">
                    <label htmlFor="district">জেলা</label>
                    <select
                      id="district"
                      name="district"
                      value={form.district}
                      onChange={handleDistrictChange}
                      required
                    >
                      <option value="">জেলা নির্বাচন করুন</option>
                      {districtOptions.map(([id, name]) => (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="advisory-field">
                    <label htmlFor="upazila">উপজেলা</label>
                    <select
                      id="upazila"
                      name="upazila"
                      value={form.upazila}
                      onChange={handleUpazilaChange}
                      required
                      disabled={upazilaOptions.length === 0}
                    >
                      <option value="">উপজেলা নির্বাচন করুন</option>
                      {upazilaOptions.map((item) => (
                        <option key={item.upazilaId} value={item.upazilaId}>
                          {item.upazila}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <p className="advisory-field-help">
                  এখন শুধু যাচাইকৃত তিনটি এলাকা নির্বাচন করা যায়।
                </p>
                
              </div>

              {/* Land area */}
              <div className="advisory-form-group">
                <div className="advisory-field-heading">
                  <LandPlot size={18} />
                  <h3>২. জমির পরিমাণ</h3>
                </div>

                <div className="advisory-input-grid">
                  <div className="advisory-field">
                    <label htmlFor="landDecimal">
                      জমির পরিমাণ (শতাংশ / Decimal)
                    </label>

                    <input
                      id="landDecimal"
                      name="landDecimal"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={form.landDecimal}
                      onChange={handleChange}
                      placeholder="জমির পরিমাণ লিখুন"
                      required
                    />
                  </div>

                  <div className="advisory-field">
                    <label htmlFor="landBigha">
                      সমপরিমাণ জমি (বিঘা)
                    </label>

                    <input
                      id="landBigha"
                      type="text"
                      value={landBigha}
                      placeholder="স্বয়ংক্রিয়ভাবে হিসাব হবে"
                      readOnly
                    />
                  </div>
                </div>

                <p className="advisory-field-help">
                  হিসাবের জন্য ১ বিঘা = ৩৩ শতাংশ ধরা হয়েছে।
                </p>
              </div>

              {/* Soil */}
              <div className="advisory-form-group">
                <div className="advisory-field-heading">
                  <Sprout size={18} />
                  <h3>৩. মাটির ধরন</h3>
                </div>

                <div className="advisory-field">
                  <label htmlFor="soilType">আপনার জমির মাটি</label>

                  <select
                    id="soilType"
                    name="soilType"
                    value={form.soilType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">মাটির ধরন নির্বাচন করুন</option>

                    {soilOptions.map((soil) => (
                      <option key={soil.value} value={soil.value}>
                        {soil.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Irrigation */}
              <div className="advisory-form-group">
                <div className="advisory-field-heading">
                  <Droplets size={18} />
                  <h3>৪. সেচের সুবিধা</h3>
                </div>

                <div className="advisory-field">
                  <label htmlFor="irrigation">
                    আপনার জমিতে সেচের ব্যবস্থা আছে?
                  </label>

                  <select
                    id="irrigation"
                    name="irrigation"
                    value={form.irrigation}
                    onChange={handleChange}
                    required
                  >
                    <option value="">নির্বাচন করুন</option>
                    <option value="available">হ্যাঁ, সেচের ব্যবস্থা আছে</option>
                    <option value="unavailable">না, সেচের ব্যবস্থা নেই</option>
                    <option value="limited">সীমিত সেচের ব্যবস্থা আছে</option>
                    <option value="unknown">নিশ্চিত নই</option>
                  </select>
                </div>
              </div>

              {/* Crop */}
              <div className="advisory-form-group">
                <div className="advisory-field-heading">
                  <Sprout size={18} />
                  <h3>৫. কোন ফসল চাষ করতে চান?</h3>
                </div>

                <div className="advisory-field">
                  <label htmlFor="crop">ফসল নির্বাচন</label>

                  <select
                    id="crop"
                    name="crop"
                    value={form.crop}
                    onChange={handleChange}
                  >
                    <option value="">এখনো ফসল নির্বাচন করিনি</option>

                    {cropOptions.map((crop) => (
                      <option key={crop.value} value={crop.value}>
                        {crop.label}
                      </option>
                    ))}
                  </select>

                  <p className="advisory-field-help">
                    ফসল নির্বাচন না করলেও বাকি তথ্য পূরণ করতে পারবেন।
                  </p>
                </div>
              </div>

              {/* Planting date */}
              <div className="advisory-form-group">
                <div className="advisory-field-heading">
                  <CalendarDays size={18} />
                  <h3>৬. রোপণের তারিখ</h3>
                </div>

                <div className="advisory-field">
                  <label htmlFor="plantingDate">
                    রোপণের তারিখ (যদি জানা থাকে)
                  </label>

                  <input
                    id="plantingDate"
                    name="plantingDate"
                    type="date"
                    value={form.plantingDate}
                    onChange={handleChange}
                  />
                </div>

                <p className="advisory-field-help">
                  ভবিষ্যতে রোপণ করতে চাইলে সম্ভাব্য তারিখ দিতে পারেন।
                </p>
              </div>

              {/* Actions */}
              <div className="advisory-form-actions">
                <button type="button" className="advisory-reset-button" onClick={handleReset}>
                  <RotateCcw size={17} />
                  মুছে ফেলুন
                </button>

                <button type="submit" className="advisory-submit-button">
                  তথ্য যাচাইয়ের জন্য জমা দিন
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>

            {submitted && (
              <div className="advisory-submit-notice" role="status">
                <ShieldCheck size={21} />

                <div>
                  <strong>তথ্যগুলো ফর্মে গ্রহণ করা হয়েছে।</strong>
                  <p>
                    এখনো কৃষি পরামর্শ তৈরি হয়নি। যাচাইকৃত কৃষি ডেটা,
                    প্রয়োজনীয় তথ্য এবং Backend সংযোগ সম্পন্ন হলে
                    ফলাফল দেখানো হবে।
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Information panel */}
          <aside className="advisory-info-panel">
            <div className="advisory-info-card">
              <div className="advisory-info-icon">
                <Info size={23} />
              </div>

              <h3>এই তথ্যগুলো কেন প্রয়োজন?</h3>

              <ul>
                <li>এলাকার ভিত্তিতে কৃষি তথ্য নির্বাচন করতে।</li>
                <li>জমির পরিমাণ অনুযায়ী হিসাব করতে।</li>
                <li>মাটির ধরন ও সেচের সুবিধা বিবেচনা করতে।</li>
                <li>ফসলের পর্যায় অনুযায়ী তথ্য সাজাতে।</li>
              </ul>
            </div>

            <div className="advisory-info-card advisory-source-card">
              <ShieldCheck size={23} />

              <h3>তথ্যের নির্ভরযোগ্যতা</h3>

              <p>
                কৃষি পরামর্শের জন্য BARC, BRRI, BARI ও DAE-এর
                যাচাইকৃত তথ্য ব্যবহার করার পরিকল্পনা রয়েছে।
                প্রতিটি পরামর্শের সঙ্গে তথ্যসূত্র দেখানো হবে।
              </p>
            </div>

            <div className="advisory-disclaimer">
              <strong>মনে রাখবেন</strong>
              <p>
                ফর্মে তথ্য দেওয়া মানেই কৃষি পরামর্শ নিশ্চিত হওয়া নয়।
                তথ্য অপর্যাপ্ত বা যাচাই না হলে কোনো সুপারিশ দেওয়া হবে না।
                নিশ্চিত হতে স্থানীয় কৃষি অফিসের সঙ্গে যোগাযোগ করুন।
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default Advisory;
