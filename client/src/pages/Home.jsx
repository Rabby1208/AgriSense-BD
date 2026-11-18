
import { Link } from "react-router-dom";
import TodaySummaryCard from "../components/TodaySummaryCard";
import {
  Sprout,
  CloudSun,
  CalendarCheck,
  FlaskConical,
  Droplets,
  Bug,
  Leaf,
  ArrowRight,
  ShieldCheck,
  MapPin,
  BookOpen,
  CloudRain,
  FileText,
  Activity,
  Sun,
  Wheat,
} from "lucide-react";

const features = [
  {
    icon: CalendarCheck,
    title: "আজকের মাঠের করণীয়",
    description:
      "আবহাওয়া ও ফসলের অবস্থার তথ্য অনুযায়ী প্রয়োজনীয় কৃষিকাজ সম্পর্কে জানুন।",
    path: "/daily-actions",
    color: "green",
  },
  {
    icon: Sprout,
    title: "ফসল নির্বাচন ও পরামর্শ",
    description:
      "এলাকা, মাটি, মৌসুম ও সেচের সুবিধা অনুযায়ী ফসল সম্পর্কে তথ্য জানুন।",
    path: "/advisory",
    color: "blue",
  },
  {
    icon: Activity,
    title: "ফসলের বৃদ্ধি ও ঝুঁকি",
    description:
      "ফসলের বিভিন্ন বৃদ্ধির পর্যায় এবং সম্ভাব্য আবহাওয়াজনিত ঝুঁকি বুঝুন।",
    path: "/crop-stages",
    color: "orange",
  },
  {
    icon: FlaskConical,
    title: "সার ক্যালকুলেটর",
    description:
      "যাচাইকৃত সার প্রয়োগের তথ্য থাকলে জমির পরিমাণ অনুযায়ী হিসাব করুন।",
    path: "/fertilizer",
    color: "purple",
  },
  {
    icon: Droplets,
    title: "সেচ পরামর্শ",
    description:
      "আবহাওয়া, ফসল ও প্রয়োজনীয় তথ্যের ভিত্তিতে সেচ সম্পর্কে সহায়তা পান।",
    path: "/irrigation",
    color: "blue",
  },
  {
    icon: Bug,
    title: "রোগ ও পোকামাকড়",
    description:
      "লক্ষণ, প্রতিরোধ এবং আবহাওয়াসংশ্লিষ্ট সম্ভাব্য ঝুঁকি সম্পর্কে জানুন।",
    path: "/pest-disease",
    color: "orange",
  },
];

const weatherFeatures = [
  {
    icon: CloudSun,
    title: "৭ দিনের আবহাওয়া",
    description: "আবহাওয়ার পূর্বাভাস ও তথ্যের সময়সীমা দেখুন।",
  },
  {
    icon: CloudRain,
    title: "চরম আবহাওয়ার সতর্কতা",
    description: "অতিরিক্ত বৃষ্টি, তাপপ্রবাহ ও শৈত্যপ্রবাহের ঝুঁকি সম্পর্কে জানুন।",
  },
  {
    icon: Sun,
    title: "আবহাওয়াভিত্তিক কৃষি সিদ্ধান্ত",
    description: "আবহাওয়ার তথ্য কৃষিকাজে কীভাবে প্রভাব ফেলতে পারে তা বুঝুন।",
  },
];

const supportedCrops = [
  { name: "বোরো ধান", english: "Boro Rice", icon: Wheat },
  { name: "আলু", english: "Potato", icon: Sprout },
  { name: "টমেটো", english: "Tomato", icon: Leaf },
  { name: "সরিষা", english: "Mustard", icon: Sprout },
];

function Home() {
  return (
    <main>
      {/* Hero section */}
      <section className="home-hero">
        <div className="container home-hero-grid">
          <div className="home-hero-content">
            <div className="hero-trust">
              <ShieldCheck size={16} />
              <span>তথ্যনির্ভর কৃষি সিদ্ধান্ত সহায়তা</span>
            </div>

            <h1>
              সঠিক তথ্যের ভিত্তিতে
              <span> আরও সচেতন কৃষি সিদ্ধান্ত</span>
            </h1>

            <p>
              আপনার জমি, মাটি, ফসল ও আবহাওয়ার তথ্য ব্যবহার করে
              কৃষিকাজের প্রয়োজনীয় পরামর্শ এবং সম্ভাব্য ঝুঁকি সম্পর্কে জানুন।
            </p>

            <div className="home-hero-actions">
              <Link to="/advisory" className="btn btn-primary">
                কৃষি পরামর্শ নিন
                <ArrowRight size={18} />
              </Link>

              <Link to="/weather" className="btn btn-outline">
                আবহাওয়া দেখুন
                <CloudSun size={18} />
              </Link>
            </div>

            <div className="home-hero-note">
              <ShieldCheck size={16} />
              <span>
                যাচাই না করা তথ্যকে নিশ্চিত কৃষি পরামর্শ হিসেবে দেখানো হবে না।
              </span>
            </div>
          </div>

          <div className="home-hero-visual">
            <div className="hero-visual-card">
              <div className="hero-visual-icon">
                <Sprout size={66} strokeWidth={1.4} />
              </div>

              <div className="hero-visual-caption">
                <span>AgriSense BD</span>
                <strong>কৃষিতে তথ্য, সিদ্ধান্তে সহায়তা</strong>
              </div>

              <div className="hero-floating-icon hero-floating-one">
                <CloudSun size={25} />
              </div>

              <div className="hero-floating-icon hero-floating-two">
                <Droplets size={25} />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* আজকের সারসংক্ষেপ */}
      <TodaySummaryCard />
      {/* Main features */}
      <section className="home-section">
        <div className="container">
          <div className="section-heading">
            <span className="section-eyebrow">কৃষি সহায়তা</span>
            <h2>এক জায়গায় প্রয়োজনীয় কৃষি তথ্য</h2>
            <p>
              কৃষিকাজের বিভিন্ন পর্যায়ে তথ্যভিত্তিক সিদ্ধান্ত নিতে
              প্রয়োজনীয় সেবাগুলো ব্যবহার করুন।
            </p>
          </div>

          <div className="home-feature-grid">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Link
                  to={feature.path}
                  className="home-feature-card"
                  key={feature.path}
                >
                  <div className={`feature-icon ${feature.color}`}>
                    <Icon size={25} />
                  </div>

                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>

                  <span className="feature-card-link">
                    বিস্তারিত দেখুন
                    <ArrowRight size={16} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Weather section */}
      <section className="home-weather-section">
        <div className="container">
          <div className="weather-section-header">
            <div>
              <span className="section-eyebrow">আবহাওয়া ও সতর্কতা</span>
              <h2>আবহাওয়ার তথ্য বুঝে কৃষিকাজ করুন</h2>
              <p>
                পূর্বাভাস ও আবহাওয়াসংশ্লিষ্ট সম্ভাব্য ঝুঁকি
                কৃষি সিদ্ধান্ত গ্রহণে সহায়তা করতে পারে।
              </p>
            </div>

            <Link to="/weather" className="text-link">
              আবহাওয়া পেজ
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="home-weather-grid">
            {weatherFeatures.map((item) => {
              const Icon = item.icon;

              return (
                <div className="home-weather-card" key={item.title}>
                  <div className="weather-feature-icon">
                    <Icon size={24} />
                  </div>

                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              );
            })}
          </div>

          <div className="data-availability-notice">
            <ShieldCheck size={20} />
            <div>
              <strong>তথ্যের নির্ভরযোগ্যতা</strong>
              <p>
                আবহাওয়া ও সতর্কতার তথ্য উৎস, হালনাগাদের সময় এবং
                পর্যাপ্ততা যাচাই করে দেখানো হবে। যাচাইকৃত তথ্য না থাকলে
                কোনো ঝুঁকির ফলাফল তৈরি করা হবে না।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Crop section */}
      <section className="home-section">
        <div className="container">
          <div className="section-heading">
            <span className="section-eyebrow">প্রাথমিক ফসলসমূহ</span>
            <h2>যেসব ফসল নিয়ে কাজ করা হচ্ছে</h2>
            <p>
              প্রাথমিক সংস্করণে বাংলাদেশের চারটি গুরুত্বপূর্ণ ফসলের
              যাচাইকৃত কৃষি তথ্য অন্তর্ভুক্ত করা হচ্ছে।
            </p>
          </div>

          <div className="home-crop-grid">
            {supportedCrops.map((crop) => {
              const Icon = crop.icon;

              return (
                <Link
                  to="/crops"
                  className="home-crop-card"
                  key={crop.english}
                >
                  <div className="crop-card-icon">
                    <Icon size={30} />
                  </div>

                  <div>
                    <h3>{crop.name}</h3>
                    <span>{crop.english}</span>
                  </div>

                  <ArrowRight size={18} className="crop-card-arrow" />
                </Link>
              );
            })}
          </div>

          <div className="home-crop-action">
            <Link to="/crops" className="btn btn-outline">
              সব ফসলের তথ্য দেখুন
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* Additional tools */}
      <section className="home-tools-section">
        <div className="container home-tools-grid">
          <div className="home-tools-content">
            <span className="section-eyebrow">সহজ ব্যবহার</span>
            <h2>কৃষি তথ্য সংরক্ষণ ও বুঝতে সহায়ক সুবিধা</h2>

            <p>
              প্রয়োজনীয় ফসলের পরিকল্পনা প্রিন্ট করুন, বাংলায় তথ্য শুনুন
              এবং ব্যবহৃত তথ্যের মূল উৎস সম্পর্কে জানুন।
            </p>

            <div className="home-tool-links">
              <Link to="/crop-plan">
                <FileText size={19} />
                ফসলের পরিকল্পনা
                <ArrowRight size={16} />
              </Link>

              <Link to="/sources">
                <BookOpen size={19} />
                তথ্যের উৎস
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="home-tools-visual">
            <div className="tools-visual-item">
              <FileText size={28} />
              <div>
                <strong>PDF ও প্রিন্ট</strong>
                <span>কৃষি তথ্য সংরক্ষণ</span>
              </div>
            </div>

            <div className="tools-visual-item">
              <Activity size={28} />
              <div>
                <strong>বাংলা Text-to-Speech</strong>
                <span>লেখা শুনে তথ্য বোঝা</span>
              </div>
            </div>

            <div className="tools-visual-item">
              <MapPin size={28} />
              <div>
                <strong>এলাকাভিত্তিক তথ্য</strong>
                <span>নির্বাচিত এলাকার কৃষি সহায়তা</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="home-disclaimer-section">
        <div className="container">
          <div className="home-disclaimer">
            <ShieldCheck size={24} />
            <div>
              <strong>গুরুত্বপূর্ণ সতর্কতা</strong>
              <p>
                AgriSense BD কৃষি তথ্য ও সিদ্ধান্ত গ্রহণে সহায়ক একটি
                প্ল্যাটফর্ম। আবহাওয়া বা লক্ষণভিত্তিক ঝুঁকি নিশ্চিত রোগ
                নির্ণয় নয়। প্রয়োজন অনুযায়ী স্থানীয় কৃষি অফিসের পরামর্শ নিন।
                তথ্য অপর্যাপ্ত বা যাচাই না হলে ফলাফল দেওয়া হবে না।
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
