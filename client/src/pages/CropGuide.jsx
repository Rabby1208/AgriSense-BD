
import { useEffect, useState } from "react";
import {
  Sprout,
  Leaf,
  BookOpen,
  CalendarDays,
  FlaskConical,
  Droplets,
  Bug,
  Info,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  MapPin,
} from "lucide-react";

import PageHero from "../components/PageHero";
import { fetchCrops, fetchCropDetails } from "../services/api";
import "./CropGuide.css";

function statusLabel(status) {
  const labels = {
    Matched: "যাচাইকৃত",
    "Not matched": "মেলেনি",
    "Not measurable": "পরিমাপযোগ্য নয়",
    "Insufficient data": "পর্যাপ্ত তথ্য নেই",
    TODO_VERIFY: "যাচাই প্রয়োজন",
  };

  return labels[status] || "তথ্য যাচাই প্রয়োজন";
}

function getStatusClass(status) {
  if (status === "Matched") return "crop-status-verified";
  if (status === "Not matched") return "crop-status-unmatched";
  return "crop-status-pending";
}

function CropGuide() {
  const [crops, setCrops] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState("");
  const [cropDetails, setCropDetails] = useState(null);

  const [listLoading, setListLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailsError, setDetailsError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // Load crop list from crop registry API
  useEffect(() => {
    const controller = new AbortController();

    async function loadCrops() {
      setListLoading(true);
      setError("");

      try {
        const data = await fetchCrops({ signal: controller.signal });
        const activeCrops = data.filter((crop) => crop.active !== false);

        setCrops(activeCrops);

        setSelectedCropId((current) => {
          if (activeCrops.some((crop) => crop.id === current)) {
            return current;
          }

          return activeCrops[0]?.id || "";
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "ফসলের তালিকা পাওয়া যায়নি।");
        }
      } finally {
        if (!controller.signal.aborted) {
          setListLoading(false);
        }
      }
    }

    loadCrops();

    return () => controller.abort();
  }, [retryCount]);

  // Load selected crop details
  useEffect(() => {
       if (!selectedCropId) return;

    const controller = new AbortController();

    async function loadCropDetails() {
      setDetailsLoading(true);
      setDetailsError("");
      setCropDetails(null);

      try {
        const data = await fetchCropDetails(selectedCropId, {
          signal: controller.signal,
        });

        setCropDetails(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setDetailsError(
            err.message || "এই ফসলের বিস্তারিত তথ্য পাওয়া যায়নি।"
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setDetailsLoading(false);
        }
      }
    }

    loadCropDetails();

    return () => controller.abort();
  }, [selectedCropId]);

  const selectedCrop = crops.find(
    (crop) => crop.id === selectedCropId
  );

  const crop = cropDetails?.crop;
  const source = crop?.source;

  const seasonRecords = cropDetails?.season_suitability || [];
  const fertilizerRecords =
    cropDetails?.fertilizer?.recommendations || [];
  const irrigationRecords =
    cropDetails?.irrigation?.recommendations || [];
  const pestRecords = cropDetails?.diseases_and_pests || [];

  const harvest = cropDetails?.harvest?.days_after_planting;

  return (
    <div className="crop-guide-page">
      <PageHero
        eyebrow="CROP KNOWLEDGE CENTER"
        title="ফসল নির্দেশিকা"
        description="সমর্থিত ফসলের তথ্য, চাষের উপযোগিতা এবং কৃষি ব্যবস্থাপনা সম্পর্কে জানুন।"
        icon={Sprout}
      />

      <main className="crop-guide-container">
        {/* Intro */}
        <section className="crop-guide-intro">
          <div className="crop-guide-intro-icon">
            <BookOpen size={27} />
          </div>

          <div>
            <h2>আপনার ফসল সম্পর্কে জানুন</h2>
            <p>
              ফসল নির্বাচন করে উপলভ্য কৃষি তথ্য দেখুন।
              প্রতিটি তথ্যের যাচাইয়ের অবস্থা ও উৎস আলাদাভাবে
              দেখানো হয়েছে।
            </p>
          </div>
        </section>

        {/* Crop selector */}
        <section className="crop-guide-selector">
          <div className="crop-guide-selector-heading">
            <div className="crop-guide-selector-icon">
              <Leaf size={22} />
            </div>

            <div>
              <h2>ফসল নির্বাচন করুন</h2>
              <p>তালিকা crop registry থেকে লোড হয়।</p>
            </div>
          </div>

          {listLoading && (
            <div className="crop-guide-loading">
              <RefreshCw size={20} className="crop-guide-spin" />
              ফসলের তালিকা লোড হচ্ছে...
            </div>
          )}

          {error && (
            <div className="crop-guide-error">
              <AlertTriangle size={20} />
              <div>
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => setRetryCount((count) => count + 1)}
                >
                  আবার চেষ্টা করুন
                </button>
              </div>
            </div>
          )}

          {!listLoading && !error && crops.length === 0 && (
            <div className="crop-guide-empty">
              এখনো কোনো সক্রিয় ফসলের তথ্য পাওয়া যায়নি।
            </div>
          )}

          {!listLoading && !error && crops.length > 0 && (
            <div className="crop-guide-crop-list">
              {crops.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`crop-guide-choice ${
                    selectedCropId === item.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedCropId(item.id)}
                >
                  <Sprout size={19} />
                  <span>
                    <strong>{item.name_bn || item.name_en}</strong>
                    <small>{item.name_en}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Selected crop details */}
        {selectedCrop && (
          <section className="crop-guide-details">
            <div className="crop-guide-title-row">
              <div>
                <span className="crop-guide-eyebrow">SELECTED CROP</span>
                <h2>{crop?.name_bn || selectedCrop.name_bn}</h2>
                <p>{crop?.name_en || selectedCrop.name_en}</p>
              </div>

              <span className="crop-guide-id">
                {selectedCrop.id}
              </span>
            </div>

            {detailsLoading && (
              <div className="crop-guide-loading crop-guide-detail-loading">
                <RefreshCw size={21} className="crop-guide-spin" />
                ফসলের বিস্তারিত তথ্য লোড হচ্ছে...
              </div>
            )}

            {detailsError && (
              <div className="crop-guide-error">
                <AlertTriangle size={20} />
                <p>{detailsError}</p>
              </div>
            )}

            {!detailsLoading && !detailsError && cropDetails && (
              <>
                {/* General data status */}
                <div className="crop-guide-data-status">
                  <div className="crop-guide-status-icon">
                    <Info size={22} />
                  </div>

                  <div>
                    <strong>তথ্যের যাচাইয়ের অবস্থা</strong>
                    <p>
                      এই ফসলের মূল তথ্যের status:{" "}
                      <span className={getStatusClass(source?.status)}>
                        {statusLabel(source?.status)}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Data cards */}
                <div className="crop-guide-section-heading">
                  <h3>ফসলের বিস্তারিত তথ্য</h3>
                  <p>
                    JSON crop data থেকে পাওয়া তথ্য নিচে দেখানো হয়েছে।
                  </p>
                </div>

                <div className="crop-guide-data-grid">
                  {/* Season suitability */}
                  <article className="crop-guide-data-card">
                    <div className="crop-guide-card-icon">
                      <CalendarDays size={22} />
                    </div>
                    <h3>মৌসুম ও উপযোগিতা</h3>

                    {seasonRecords.length > 0 &&
                    seasonRecords.some(
                      (record) =>
                        record.season_id ||
                        record.districts?.length ||
                        record.soil_types?.length
                    ) ? (
                      seasonRecords.map((record, index) => (
                        <div className="crop-guide-record" key={index}>
                          <p>
                            মৌসুম: {record.season_id || "তথ্য নেই"}
                          </p>
                          <p>
                            এলাকা: {record.districts?.join(", ") || "তথ্য নেই"}
                          </p>
                          <p>
                            মাটি: {record.soil_types?.join(", ") || "তথ্য নেই"}
                          </p>
                          <span className={getStatusClass(record.suitability?.status)}>
                            {statusLabel(record.suitability?.status)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="crop-guide-unavailable">
                        যাচাইকৃত মৌসুম ও উপযোগিতার তথ্য এখনো যুক্ত হয়নি।
                      </p>
                    )}
                  </article>

                  {/* Fertilizer */}
                  <article className="crop-guide-data-card">
                    <div className="crop-guide-card-icon">
                      <FlaskConical size={22} />
                    </div>
                    <h3>সার ব্যবস্থাপনা</h3>

                    {fertilizerRecords.some(
                      (record) => record.fertilizer_name
                    ) ? (
                      fertilizerRecords
                        .filter((record) => record.fertilizer_name)
                        .map((record, index) => (
                          <div className="crop-guide-record" key={index}>
                            <p>{record.fertilizer_name}</p>
                            <span className={getStatusClass(record.total_dose?.status)}>
                              {statusLabel(record.total_dose?.status)}
                            </span>
                          </div>
                        ))
                    ) : (
                      <p className="crop-guide-unavailable">
                        যাচাইকৃত সার ও প্রয়োগের মাত্রা এখনো যুক্ত হয়নি।
                      </p>
                    )}
                  </article>

                  {/* Irrigation */}
                  <article className="crop-guide-data-card">
                    <div className="crop-guide-card-icon">
                      <Droplets size={22} />
                    </div>
                    <h3>সেচ ব্যবস্থাপনা</h3>

                    {irrigationRecords.some(
                      (record) => record.crop_stage
                    ) ? (
                      irrigationRecords
                        .filter((record) => record.crop_stage)
                        .map((record, index) => (
                          <div className="crop-guide-record" key={index}>
                            <p>ফসলের পর্যায়: {record.crop_stage}</p>
                            <span className={getStatusClass(record.water_requirement?.status)}>
                              {statusLabel(record.water_requirement?.status)}
                            </span>
                          </div>
                        ))
                    ) : (
                      <p className="crop-guide-unavailable">
                        যাচাইকৃত সেচের পরিমাণ ও সময় এখনো যুক্ত হয়নি।
                      </p>
                    )}
                  </article>

                  {/* Harvest */}
                  <article className="crop-guide-data-card">
                    <div className="crop-guide-card-icon">
                      <Sprout size={22} />
                    </div>
                    <h3>ফসল কাটার সময়</h3>

                    {harvest?.value != null &&
                    harvest?.status === "Matched" ? (
                      <p className="crop-guide-record">
                        রোপণের পর {harvest.value} {harvest.unit}
                      </p>
                    ) : (
                      <p className="crop-guide-unavailable">
                        যাচাইকৃত ফসল কাটার সময় এখনো পাওয়া যায়নি।
                      </p>
                    )}

                    <span className={getStatusClass(harvest?.status)}>
                      {statusLabel(harvest?.status)}
                    </span>
                  </article>

                  {/* Pest and disease */}
                  <article className="crop-guide-data-card">
                    <div className="crop-guide-card-icon">
                      <Bug size={22} />
                    </div>
                    <h3>রোগ ও পোকামাকড়</h3>

                    {pestRecords.some(
                      (record) =>
                        record.name_bn &&
                        record.status === "Matched"
                    ) ? (
                      pestRecords
                        .filter(
                          (record) =>
                            record.name_bn &&
                            record.status === "Matched"
                        )
                        .map((record) => (
                          <div className="crop-guide-record" key={record.id}>
                            <p>{record.name_bn}</p>
                            <span className="crop-status-verified">
                              যাচাইকৃত
                            </span>
                          </div>
                        ))
                    ) : (
                      <p className="crop-guide-unavailable">
                        যাচাইকৃত রোগ ও পোকামাকড়ের তথ্য এখনো যুক্ত হয়নি।
                      </p>
                    )}
                  </article>

                  {/* Growth stages */}
                  <article className="crop-guide-data-card">
                    <div className="crop-guide-card-icon">
                      <MapPin size={22} />
                    </div>
                    <h3>ফসলের বৃদ্ধি পর্যায়</h3>
                    <p className="crop-guide-unavailable">
                      বর্তমান crop JSON schema-তে growth-stage-এর
                      বিস্তারিত তথ্য নেই। যাচাইকৃত পর্যায়ভিত্তিক
                      তথ্য যুক্ত হলে এখানে দেখানো হবে।
                    </p>
                  </article>
                </div>

                {/* Source information */}
                <section className="crop-guide-source">
                  <div className="crop-guide-source-heading">
                    <ShieldCheck size={21} />
                    <h3>তথ্যের উৎস</h3>
                  </div>

                  <p>
                    প্রতিষ্ঠান: {source?.organization || "এখনো নির্ধারিত নয়"}
                  </p>
                  <p>
                    নথি: {source?.document || "এখনো যুক্ত হয়নি"}
                  </p>
                  <p>
                    পৃষ্ঠা: {source?.page ?? "উল্লেখ নেই"}
                  </p>

                  {source?.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      মূল উৎস দেখুন <ExternalLink size={15} />
                    </a>
                  )}

                  <span className={getStatusClass(source?.status)}>
                    {statusLabel(source?.status)}
                  </span>
                </section>
              </>
            )}
          </section>
        )}

        {/* Disclaimer */}
        <section className="crop-guide-disclaimer">
          <Info size={19} />
          <p>
            যাচাই না করা তথ্যকে কৃষি পরামর্শ হিসেবে ব্যবহার করবেন না।
            সার, সেচ বা রোগ ব্যবস্থাপনার সিদ্ধান্ত নেওয়ার আগে
            নির্ভরযোগ্য কৃষি উৎস বা স্থানীয় কৃষি কর্মকর্তার পরামর্শ নিন।
          </p>
        </section>
      </main>
    </div>
  );
}

export default CropGuide;
