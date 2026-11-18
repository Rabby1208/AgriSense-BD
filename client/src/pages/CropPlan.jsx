
import { useEffect, useMemo, useState } from "react";
import useFarmerProfile from "../hooks/useFarmerProfile";
import { findLocation } from "../utils/locations";
import {
  Sprout,
  Leaf,
  MapPin,
  CalendarDays,
  Ruler,
  Droplets,
  Printer,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Info,
  ClipboardList,
} from "lucide-react";

import PageHero from "../components/PageHero";
import {
  fetchCrops,
  fetchLocations,
  fetchCropDetails,
} from "../services/api";

import "./CropPlan.css";

const SOIL_TYPES = [
  { value: "clay", label: "এঁটেল মাটি" },
  { value: "loamy", label: "দোআঁশ মাটি" },
  { value: "sandy", label: "বেলে মাটি" },
  { value: "silty", label: "পলিমাটি" },
  { value: "unknown", label: "জানি না" },
];

const IRRIGATION_OPTIONS = [
  { value: "available", label: "সেচের সুবিধা আছে" },
  { value: "unavailable", label: "সেচের সুবিধা নেই" },
  { value: "limited", label: "সীমিত সেচের সুবিধা" },
];

const initialForm = {
  district: "",
  upazila: "",
  area: "",
  areaUnit: "decimal",
  soil: "unknown",
  irrigation: "available",
  cropId: "",
  plantingDate: "",
};

function getStatusText(status) {
  const labels = {
    Matched: "যাচাইকৃত",
    "Not matched": "মেলেনি",
    "Not measurable": "পরিমাপযোগ্য নয়",
    "Insufficient data": "পর্যাপ্ত তথ্য নেই",
    TODO_VERIFY: "যাচাই প্রয়োজন",
  };

  return labels[status] || "যাচাই প্রয়োজন";
}

function CropPlan() {
    const { profile, updateProfile } = useFarmerProfile();

  const [form, setForm] = useState(() => {
    const saved = findLocation(profile.upazilaId);

    return {
      ...initialForm,
      district: saved?.districtId ?? "",
      upazila: saved?.upazilaId ?? "",
      cropId: profile.cropId,
      plantingDate: profile.plantingDate,
    };
  });

  const [crops, setCrops] = useState([]);
  const [locations, setLocations] = useState([]);
  const [cropDetails, setCropDetails] = useState(null);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");

  const [plan, setPlan] = useState(null);

  // Load crop registry and locations
  useEffect(() => {
    const controller = new AbortController();

    async function loadInitialData() {
      setLoading(true);
      setError("");

      try {
        const [cropData, locationData] = await Promise.all([
          fetchCrops({ signal: controller.signal }),
          fetchLocations({ signal: controller.signal }),
        ]);

        const activeCrops = cropData.filter(
          (crop) => crop.active !== false
        );

        setCrops(activeCrops);
        setLocations(locationData);

        setForm((previous) => ({
          ...previous,
          cropId: previous.cropId || activeCrops[0]?.id || "",
          district:
            previous.district || locationData[0]?.district_id || "",
          upazila:
            previous.upazila ||
            locationData[0]?.upazilas?.[0]?.id ||
            "",
        }));
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "প্রাথমিক তথ্য লোড করা যায়নি।");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => controller.abort();
  }, []);

  // Load selected crop details
  useEffect(() => {
       if (!form.cropId) return;

    const controller = new AbortController();

    async function loadDetails() {
      setDetailLoading(true);
      setDetailError("");
      setCropDetails(null);

      try {
        const data = await fetchCropDetails(form.cropId, {
          signal: controller.signal,
        });

        setCropDetails(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setDetailError(
            err.message || "ফসলের বিস্তারিত তথ্য পাওয়া যায়নি।"
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setDetailLoading(false);
        }
      }
    }

    loadDetails();

    return () => controller.abort();
  }, [form.cropId]);

  const selectedDistrict = locations.find(
    (item) => item.district_id === form.district
  );

  const upazilas = selectedDistrict?.upazilas || [];

  const selectedCrop = crops.find(
    (item) => item.id === form.cropId
  );

  const areaInDecimal = useMemo(() => {
    const amount = Number(form.area);

    if (!Number.isFinite(amount) || amount <= 0) {
      return null;
    }

    return form.areaUnit === "bigha" ? amount * 33 : amount;
  }, [form.area, form.areaUnit]);

   function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    // সংরক্ষিত তথ্য সব পেজে মিলিয়ে রাখা
    const profileKey = {
      upazila: "upazilaId",
      cropId: "cropId",
      plantingDate: "plantingDate",
    }[field];

    if (profileKey) updateProfile({ [profileKey]: value });

    setPlan(null);
  }

  function handleDistrictChange(districtId) {
    const district = locations.find(
      (item) => item.district_id === districtId
    );

    setForm((previous) => ({
      ...previous,
      district: districtId,
      upazila: district?.upazilas?.[0]?.id || "",
    }));
    
    updateProfile({ upazilaId: district?.upazilas?.[0]?.id || "" });

    setPlan(null);
  }

  function createPlan(event) {
    event.preventDefault();

    if (
      !form.district ||
      !form.upazila ||
      !form.cropId ||
      !form.plantingDate ||
      !areaInDecimal
    ) {
      return;
    }

    const plantingDate = new Date(
      `${form.plantingDate}T12:00:00`
    );

    if (Number.isNaN(plantingDate.getTime())) {
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (plantingDate > today) {
      setPlan({
        invalidDate: true,
      });
      return;
    }

    setPlan({
     id: `AGRI-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      createdAt: new Date().toLocaleString("bn-BD"),
      districtName: selectedDistrict?.district_name_bn,
      upazilaName:
        upazilas.find((item) => item.id === form.upazila)?.name_bn,
      cropName: selectedCrop?.name_bn || selectedCrop?.name_en,
      cropEnglish: selectedCrop?.name_en,
      area: Number(form.area),
      areaUnit: form.areaUnit,
      areaInDecimal,
      soilName:
        SOIL_TYPES.find((item) => item.value === form.soil)?.label,
      irrigationName:
        IRRIGATION_OPTIONS.find(
          (item) => item.value === form.irrigation
        )?.label,
      plantingDate: form.plantingDate,
    });
  }

  function printPlan() {
    window.print();
  }

  const source = cropDetails?.crop?.source;
  const harvest = cropDetails?.harvest?.days_after_planting;

  return (
    <div className="crop-plan-page">
      <PageHero
        eyebrow="PERSONAL CROP PLANNING"
        title="আমার ফসল পরিকল্পনা"
        description="আপনার জমি ও ফসলের তথ্য দিয়ে ব্যক্তিগত ফসল পরিকল্পনা তৈরি করুন।"
        icon={ClipboardList}
      />

      <main className="crop-plan-container">

        {/* Intro */}
        <section className="crop-plan-intro">
          <div className="crop-plan-intro-icon">
            <Sprout size={27} />
          </div>

          <div>
            <h2>আপনার জমির তথ্য দিন</h2>
            <p>
              প্রয়োজনীয় তথ্য পূরণ করলে আপনার জন্য একটি
              প্রিন্ট-উপযোগী ফসল পরিকল্পনা তৈরি হবে।
            </p>
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div className="crop-plan-state">
            <RefreshCw className="crop-plan-spin" size={23} />
            <p>জেলা ও ফসলের তথ্য লোড হচ্ছে...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="crop-plan-error">
            <AlertTriangle size={21} />
            <div>
              <strong>তথ্য লোড করা যায়নি</strong>
              <p>{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
              >
                আবার চেষ্টা করুন
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <form className="crop-plan-form" onSubmit={createPlan}>

            {/* Location */}
            <section className="crop-plan-section">
              <div className="crop-plan-section-heading">
                <div className="crop-plan-section-icon">
                  <MapPin size={22} />
                </div>
                <div>
                  <h2>১. জমির অবস্থান</h2>
                  <p>আপনার জমি কোন এলাকায় অবস্থিত?</p>
                </div>
              </div>

              <div className="crop-plan-fields">
                <div className="crop-plan-field">
                  <label htmlFor="plan-district">
                    জেলা <span>*</span>
                  </label>

                  <select
                    id="plan-district"
                    value={form.district}
                    onChange={(e) =>
                      handleDistrictChange(e.target.value)
                    }
                    required
                  >
                    <option value="">জেলা নির্বাচন করুন</option>
                    {locations.map((item) => (
                      <option
                        key={item.district_id}
                        value={item.district_id}
                      >
                        {item.district_name_bn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="crop-plan-field">
                  <label htmlFor="plan-upazila">
                    উপজেলা <span>*</span>
                  </label>

                  <select
                    id="plan-upazila"
                    value={form.upazila}
                    onChange={(e) =>
                      updateField("upazila", e.target.value)
                    }
                    required
                    disabled={!upazilas.length}
                  >
                    <option value="">উপজেলা নির্বাচন করুন</option>
                    {upazilas.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name_bn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Land */}
            <section className="crop-plan-section">
              <div className="crop-plan-section-heading">
                <div className="crop-plan-section-icon">
                  <Ruler size={22} />
                </div>
                <div>
                  <h2>২. জমির পরিমাণ</h2>
                  <p>আপনার মোট জমির পরিমাণ লিখুন।</p>
                </div>
              </div>

              <div className="crop-plan-fields">
                <div className="crop-plan-field">
                  <label htmlFor="plan-area">
                    জমির পরিমাণ <span>*</span>
                  </label>

                  <input
                    id="plan-area"
                    type="number"
                    min="0.01"
                    step="any"
                    placeholder="যেমন: ৫০"
                    value={form.area}
                    onChange={(e) =>
                      updateField("area", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="crop-plan-field">
                  <label htmlFor="plan-area-unit">
                    জমির একক
                  </label>

                  <select
                    id="plan-area-unit"
                    value={form.areaUnit}
                    onChange={(e) =>
                      updateField("areaUnit", e.target.value)
                    }
                  >
                    <option value="decimal">শতাংশ (Decimal)</option>
                    <option value="bigha">বিঘা (Bigha)</option>
                  </select>
                </div>
              </div>

              {areaInDecimal && (
                <div className="crop-plan-conversion">
                  <Info size={17} />
                  আপনার জমির পরিমাণ:
                  <strong>
                    {areaInDecimal.toLocaleString("bn-BD", {
                      maximumFractionDigits: 2,
                    })} শতাংশ
                  </strong>
                  <span>(১ বিঘা = ৩৩ শতাংশ)</span>
                </div>
              )}
            </section>

            {/* Soil */}
            <section className="crop-plan-section">
              <div className="crop-plan-section-heading">
                <div className="crop-plan-section-icon">
                  <Sprout size={22} />
                </div>
                <div>
                  <h2>৩. মাটির ধরন ও সেচ</h2>
                  <p>জমির মাটি এবং সেচের সুবিধা নির্বাচন করুন।</p>
                </div>
              </div>

              <div className="crop-plan-fields">
                <div className="crop-plan-field">
                  <label htmlFor="plan-soil">মাটির ধরন</label>

                  <select
                    id="plan-soil"
                    value={form.soil}
                    onChange={(e) =>
                      updateField("soil", e.target.value)
                    }
                  >
                    {SOIL_TYPES.map((soil) => (
                      <option key={soil.value} value={soil.value}>
                        {soil.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="crop-plan-field">
                  <label htmlFor="plan-irrigation">
                    <Droplets size={15} /> সেচের সুবিধা
                  </label>

                  <select
                    id="plan-irrigation"
                    value={form.irrigation}
                    onChange={(e) =>
                      updateField("irrigation", e.target.value)
                    }
                  >
                    {IRRIGATION_OPTIONS.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Crop */}
            <section className="crop-plan-section">
              <div className="crop-plan-section-heading">
                <div className="crop-plan-section-icon">
                  <Leaf size={22} />
                </div>
                <div>
                  <h2>৪. ফসল নির্বাচন</h2>
                  <p>যে ফসলের জন্য পরিকল্পনা করতে চান সেটি নির্বাচন করুন।</p>
                </div>
              </div>

              <div className="crop-plan-fields">
                <div className="crop-plan-field">
                  <label htmlFor="plan-crop">
                    ফসলের নাম <span>*</span>
                  </label>

                  <select
                    id="plan-crop"
                    value={form.cropId}
                    onChange={(e) =>
                      updateField("cropId", e.target.value)
                    }
                    required
                  >
                    {crops.map((crop) => (
                      <option key={crop.id} value={crop.id}>
                        {crop.name_bn} ({crop.name_en})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="crop-plan-field">
                  <label htmlFor="plan-date">
                    <CalendarDays size={15} />
                    রোপণের তারিখ <span>*</span>
                  </label>

                  <input
                    id="plan-date"
                    type="date"
                    value={form.plantingDate}
                    max={new Date().toLocaleDateString("en-CA")}
                    onChange={(e) =>
                      updateField("plantingDate", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              {detailLoading && (
                <div className="crop-plan-inline-loading">
                  <RefreshCw size={17} className="crop-plan-spin" />
                  নির্বাচিত ফসলের তথ্য যাচাই করা হচ্ছে...
                </div>
              )}

              {detailError && (
                <div className="crop-plan-inline-error">
                  <AlertTriangle size={17} />
                  {detailError}
                </div>
              )}

              {!detailLoading && cropDetails && (
                <div className="crop-plan-crop-info">
                  <ShieldCheck size={19} />
                  <div>
                    <strong>ফসলের ডেটা পাওয়া গেছে</strong>
                    <p>
                      উৎসের অবস্থা:{" "}
                      {getStatusText(source?.status)}
                    </p>
                    <p>
                      ফসল কাটার সময়:{" "}
                      {harvest?.status === "Matched" &&
                      harvest.value != null
                        ? `${harvest.value} ${harvest.unit}`
                        : "যাচাইকৃত তথ্য নেই"}
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Submit */}
            <div className="crop-plan-submit">
              <button
                type="submit"
                className="crop-plan-primary-btn"
                disabled={!form.cropId || detailLoading}
              >
                <ClipboardList size={19} />
                আমার ফসল পরিকল্পনা তৈরি করুন
              </button>
            </div>
          </form>
        )}

        {/* Generated plan */}
        {plan && (
          <section className="crop-plan-result" id="crop-plan-print">
            {plan.invalidDate ? (
              <div className="crop-plan-error">
                <AlertTriangle size={20} />
                রোপণের তারিখ সঠিকভাবে নির্বাচন করুন।
              </div>
            ) : (
              <>
                <div className="crop-plan-result-header">
                  <div>
                    <span>AGRISENSE BD</span>
                    <h2>আমার ফসল পরিকল্পনা</h2>
                    <p>পরিকল্পনা নম্বর: {plan.id}</p>
                  </div>

                  <button
                    type="button"
                    className="crop-plan-print-btn"
                    onClick={printPlan}
                  >
                    <Printer size={18} />
                    প্রিন্ট / PDF
                  </button>
                </div>

                <div className="crop-plan-result-grid">
                  <div>
                    <span>ফসল</span>
                    <strong>{plan.cropName}</strong>
                    <small>{plan.cropEnglish}</small>
                  </div>

                  <div>
                    <span>জমির পরিমাণ</span>
                    <strong>
                      {plan.area.toLocaleString("bn-BD")}{" "}
                      {plan.areaUnit === "bigha" ? "বিঘা" : "শতাংশ"}
                    </strong>
                    <small>
                      {plan.areaInDecimal.toLocaleString("bn-BD", {
                        maximumFractionDigits: 2,
                      })} শতাংশ
                    </small>
                  </div>

                  <div>
                    <span>জেলা ও উপজেলা</span>
                    <strong>{plan.districtName}</strong>
                    <small>{plan.upazilaName}</small>
                  </div>

                  <div>
                    <span>রোপণের তারিখ</span>
                    <strong>{plan.plantingDate}</strong>
                  </div>

                  <div>
                    <span>মাটির ধরন</span>
                    <strong>{plan.soilName}</strong>
                  </div>

                  <div>
                    <span>সেচের সুবিধা</span>
                    <strong>{plan.irrigationName}</strong>
                  </div>
                </div>

                <div className="crop-plan-result-notice">
                  <Info size={20} />
                  <div>
                    <strong>পরিকল্পনার সীমাবদ্ধতা</strong>
                    <p>
                      এই পরিকল্পনায় আপনার দেওয়া জমি ও ফসলের তথ্য
                      সংরক্ষিতভাবে দেখানো হয়েছে। যাচাইকৃত সার মাত্রা,
                      সেচের পরিমাণ, রোগের ঝুঁকি বা ফসল কাটার তারিখ
                      পাওয়া না গেলে সেগুলো হিসাব করা হয়নি।
                    </p>
                  </div>
                </div>

                <div className="crop-plan-result-source">
                  <strong>কৃষি তথ্যের উৎস</strong>
                  <p>
                    {source?.organization || "নির্দিষ্ট যাচাইকৃত উৎস নেই"}
                  </p>
                  <p>
                    তথ্যের অবস্থা: {getStatusText(source?.status)}
                  </p>
                  {source?.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      মূল উৎস দেখুন
                    </a>
                  )}
                </div>

                <p className="crop-plan-generated-date">
                  পরিকল্পনা তৈরির সময়: {plan.createdAt}
                </p>
              </>
            )}
          </section>
        )}

        <section className="crop-plan-disclaimer">
          <AlertTriangle size={19} />
          <p>
            এই পরিকল্পনা কৃষকের দেওয়া তথ্যের ভিত্তিতে তৈরি।
            এটি নিজে থেকে জমির উপযোগিতা বা উৎপাদনের নিশ্চয়তা দেয় না।
            কৃষি নির্দেশনা ব্যবহারের আগে তথ্যের উৎস ও যাচাইয়ের অবস্থা দেখুন।
          </p>
        </section>
      </main>
    </div>
  );
}

export default CropPlan;
