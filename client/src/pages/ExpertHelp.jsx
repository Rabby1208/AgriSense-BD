import { useState } from "react";
import {
  Camera,
  CheckCircle2,
  ClipboardCopy,
  ExternalLink,
  Headset,
  Info,
  MapPin,
  Phone,
  Video,
} from "lucide-react";

import PageHero from "../components/PageHero";
import StatusBadge from "../components/StatusBadge";
import useApiData from "../hooks/useApiData";
import useFarmerProfile from "../hooks/useFarmerProfile";
import { fetchCrops } from "../services/api";
import { findLocation } from "../utils/locations";
import { parseDateInput, formatDate } from "../utils/dates";
import {
  KRISHI_CALL_CENTRE,
  UPAZILA_AGRICULTURE_OFFICES,
} from "../utils/expertContacts";

import "./ExpertHelp.css";

const PHOTO_TIPS = [
  "আক্রান্ত পাতা বা ফলের কাছ থেকে একটা পরিষ্কার ছবি তুলুন।",
  "পুরো গাছের একটা ছবি তুলুন, যাতে বোঝা যায় কতটা অংশ আক্রান্ত।",
  "জমির একটা দূর থেকে তোলা ছবি তুলুন, যাতে ছড়িয়ে পড়ার ধরন বোঝা যায়।",
  "দিনের আলোতে ছবি তুলুন এবং ছবি যেন ঝাপসা না হয়।",
  "কবে থেকে সমস্যা দেখছেন তা মনে রাখুন বা লিখে রাখুন।",
];

function formatPhone(phone) {
  return phone.replace(/[^\d+]/g, "");
}

function ExpertHelp() {
  const { profile } = useFarmerProfile();
  const { data: crops } = useApiData(fetchCrops);

  const [problemText, setProblemText] = useState("");
  const [copyState, setCopyState] = useState("idle");

  const location = findLocation(profile.upazilaId);
  const crop = (crops ?? []).find((item) => item.id === profile.cropId);
  const plantedDate = parseDateInput(profile.plantingDate);

  // নিজের উপজেলার অফিস আগে দেখানো হবে
  const offices = [...UPAZILA_AGRICULTURE_OFFICES].sort((a, b) => {
    if (a.upazilaId === profile.upazilaId) return -1;
    if (b.upazilaId === profile.upazilaId) return 1;
    return 0;
  });

  const summaryLines = [
    "কৃষি সমস্যার সারসংক্ষেপ",
    `এলাকা: ${location ? `${location.upazila}, ${location.district}` : "দেওয়া হয়নি"}`,
    `ফসল: ${crop ? crop.name_bn : "দেওয়া হয়নি"}`,
    `রোপণের তারিখ: ${plantedDate ? formatDate(plantedDate) : "দেওয়া হয়নি"}`,
    `সমস্যার বিবরণ: ${problemText.trim() || "লেখা হয়নি"}`,
  ];
  const summaryText = summaryLines.join("\n");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopyState("done");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <main className="expert-page">
      <PageHero
        eyebrow="বিশেষজ্ঞের সাহায্য"
        title="কৃষি বিশেষজ্ঞের সঙ্গে কথা বলুন"
        description="ফসলের সমস্যা হলে সরকারি কৃষি কল সেন্টার বা স্থানীয় কৃষি অফিসে যোগাযোগ করুন।"
        icon={Headset}
      />

      <div className="container expert-content">
        {/* ১. কৃষি কল সেন্টার */}
        <section className="expert-card expert-card--main">
          <h2>
            <Phone size={20} />
            {KRISHI_CALL_CENTRE.name} ({KRISHI_CALL_CENTRE.phone})
          </h2>

          <p className="expert-text">
            {KRISHI_CALL_CENTRE.organization}-এর এই সেবায় ফোন করে ফসলের
            সমস্যা নিয়ে বিশেষজ্ঞের পরামর্শ চাওয়া যায়।
          </p>

          <a
            className="btn btn-primary expert-call"
            href={`tel:${KRISHI_CALL_CENTRE.phone}`}
          >
            <Phone size={20} />
            {KRISHI_CALL_CENTRE.phone} নম্বরে ফোন করুন
          </a>

          <p className="expert-note">
            <Info size={15} />
            সেবার সময় ও কলের খরচ আমরা এখনো যাচাই করিনি (TODO_VERIFY)। ফোন
            করার আগে{" "}
            <a href={KRISHI_CALL_CENTRE.source_url} target="_blank" rel="noreferrer">
              কৃষি তথ্য সার্ভিসের ওয়েবসাইটে
              <ExternalLink size={13} />
            </a>{" "}
            দেখে নিন। নম্বরটি সরকারি পোর্টালে পাওয়া গেছে, যাচাইয়ের তারিখ:{" "}
            {formatDate(parseDateInput(KRISHI_CALL_CENTRE.verified_at))}।
          </p>
        </section>

        {/* ২. উপজেলা কৃষি অফিস */}
        <section className="expert-card">
          <h2>
            <MapPin size={20} />
            উপজেলা কৃষি অফিস
          </h2>

          <ul className="expert-offices">
            {offices.map((office) => (
              <li key={office.upazilaId}>
                <div>
                  <strong>{office.name}</strong>

                  {office.phone ? (
                    <p>
                      <a href={`tel:${formatPhone(office.phone)}`}>{office.phone}</a>
                    </p>
                  ) : (
                                        <p className="expert-pending">
                      <StatusBadge label="যাচাই বাকি (TODO_VERIFY)" />
                      নম্বর যাচাইয়ের অপেক্ষায়
                    </p>
                  )}

                  {office.address && <p>{office.address}</p>}
                </div>

                {office.upazilaId === profile.upazilaId && (
                  <span className="expert-badge">আপনার এলাকা</span>
                )}
              </li>
            ))}
          </ul>

          <p className="expert-note">
            <Info size={15} />
            অফিসের নম্বর কৃষি সম্প্রসারণ অধিদপ্তর বা উপজেলা পোর্টাল থেকে
            যাচাই হলেই এখানে দেখানো হবে। যাচাই ছাড়া কোনো নম্বর দেওয়া হয় না।
          </p>
        </section>

        {/* ৩. সমস্যার সারসংক্ষেপ */}
        <section className="expert-card">
          <h2>
            <ClipboardCopy size={20} />
            সমস্যা জানানোর জন্য সারসংক্ষেপ
          </h2>

          <p className="expert-text">
            ফোনে বা অফিসে গিয়ে কী বলবেন তা আগে থেকে গুছিয়ে নিন। আপনার
            সংরক্ষিত তথ্য নিচে এসে যাবে।
          </p>

          <label className="expert-field">
            সমস্যার বিবরণ
            <textarea
              rows={4}
              value={problemText}
              onChange={(event) => {
                setProblemText(event.target.value);
                setCopyState("idle");
              }}
              placeholder="যেমন: পাতায় দাগ দেখা যাচ্ছে, কবে থেকে, কত অংশে"
            />
          </label>

          <pre className="expert-summary">{summaryText}</pre>

          <button
            type="button"
            className="btn btn-outline expert-copy"
            onClick={handleCopy}
          >
            <ClipboardCopy size={18} />
            সারসংক্ষেপ কপি করুন
          </button>

          {copyState === "done" && (
            <p className="expert-ok">
              <CheckCircle2 size={16} />
              কপি হয়েছে।
            </p>
          )}

          {copyState === "failed" && (
            <p className="expert-note">
              <Info size={15} />
              কপি করা যায়নি। লেখাটি নিজে সিলেক্ট করে কপি করুন।
            </p>
          )}

          <p className="expert-note">
            <Info size={15} />
            এই লেখা আপনার ব্রাউজারেই থাকে, কোথাও পাঠানো হয় না।
          </p>
        </section>

        {/* ৪. ছবি তোলার নির্দেশনা */}
        <section className="expert-card">
          <h2>
            <Camera size={20} />
            ভালো ছবি তোলার নিয়ম
          </h2>

          <ul className="expert-tips">
            {PHOTO_TIPS.map((tip) => (
              <li key={tip}>
                <CheckCircle2 size={17} />
                {tip}
              </li>
            ))}
          </ul>
        </section>

        {/* ৫. আসছে */}
        <section className="expert-card expert-card--soon">
          <h2>
            <Video size={20} />
            ছবি পাঠানো ও ভিডিও কল (এখনো চালু হয়নি)
          </h2>

          <p className="expert-text">
            ওয়েবসাইট থেকে সরাসরি ছবি আপলোড ও কৃষি কর্মকর্তার সঙ্গে ভিডিও কল
            যুক্ত করার পরিকল্পনা আছে। এটি চালু করতে কর্মকর্তাদের সম্মতি ও
            সার্ভারের ব্যবস্থা লাগবে। তাই আপাতত ওপরের ফোন ও অফিসের মাধ্যমে
            যোগাযোগ করুন।
          </p>
        </section>

        <section className="expert-card expert-card--watch">
          <h2>
            <Info size={20} />
            গুরুত্বপূর্ণ নির্দেশনা
          </h2>

          <p className="expert-text">
            AgriSense BD রোগ নির্ণয় করে না। রোগ বা পোকার সঠিক পরিচয় ও
            প্রতিকারের জন্য কৃষি কর্মকর্তা বা বিশেষজ্ঞের পরামর্শ নিন।
          </p>
        </section>
      </div>
    </main>
  );
}

export default ExpertHelp;