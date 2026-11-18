

import {
  Sprout,
  Target,
  HeartHandshake,
  CloudSun,
  ShieldCheck,
  Database,
  Code2,
  Users,
  Leaf,
} from "lucide-react";
import PageHero from "../components/PageHero";
import "./About.css";

const features = [
  {
    icon: Sprout,
    title: "ফসল বিষয়ক পরামর্শ",
    description:
      "ফসল নির্বাচন, চাষাবাদ এবং ফসলের বৃদ্ধি পর্যায় অনুযায়ী প্রয়োজনীয় তথ্য।",
  },
  {
    icon: CloudSun,
    title: "আবহাওয়া তথ্য",
    description:
      "আবহাওয়ার পূর্বাভাস এবং কৃষিকাজে আবহাওয়ার সম্ভাব্য প্রভাব সম্পর্কে ধারণা।",
  },
  {
    icon: ShieldCheck,
    title: "রোগ ও পোকামাকড়ের ঝুঁকি",
    description:
      "আবহাওয়ার পরিস্থিতির ভিত্তিতে সম্ভাব্য ঝুঁকি সম্পর্কে সতর্কতা ও তথ্য।",
  },
  {
    icon: Database,
    title: "তথ্যভিত্তিক নির্দেশনা",
    description:
      "বিশ্বস্ত কৃষি তথ্যসূত্র ব্যবহার করে কৃষকদের জন্য সহজবোধ্য নির্দেশনা।",
  },
];

const technologies = [
  "React",
  "JavaScript",
  "CSS",
  "Node.js",
  "Express.js",
  "MySQL",
  "Open-Meteo API",
];

function About() {
  return (
    <div className="about-page">
      <PageHero
        eyebrow="AGRI SENSE BD"
        title="আমাদের সম্পর্কে"
        subtitle="প্রযুক্তির মাধ্যমে কৃষিকে আরও তথ্যভিত্তিক, সহজ এবং সচেতন করে তোলাই আমাদের লক্ষ্য।"
      />

      <div className="about-container">
        {/* Introduction */}
        <section className="about-intro">
          <div className="about-intro-content">
            <span className="about-label">WELCOME TO AGRISENSE BD</span>
            <h2>
              কৃষির জন্য প্রযুক্তি,
              <span> কৃষকের জন্য সহজ সমাধান</span>
            </h2>

            <p>
              AgriSense BD একটি কৃষিভিত্তিক ডিজিটাল সহায়ক প্ল্যাটফর্ম।
              এর মাধ্যমে বাংলাদেশের কৃষকদের ফসল চাষ, আবহাওয়া,
              সেচ, সার এবং সম্ভাব্য রোগ ও পোকামাকড়ের ঝুঁকি সম্পর্কে
              প্রয়োজনীয় তথ্য সহজভাবে পৌঁছে দেওয়ার চেষ্টা করা হচ্ছে।
            </p>

            <p>
              আমাদের লক্ষ্য হলো কৃষকদের সিদ্ধান্ত গ্রহণে সহায়তা করা,
              যেন তাঁরা প্রয়োজনীয় তথ্য বুঝে সময়মতো কৃষিকাজের পরিকল্পনা
              করতে পারেন।
            </p>
          </div>

          <div className="about-intro-visual">
            <div className="about-visual-circle">
              <Sprout size={76} strokeWidth={1.4} />
            </div>
            <div className="about-visual-caption">
              <span>AgriSense BD</span>
              <small>Smart Agriculture Support</small>
            </div>
          </div>
        </section>

        {/* Mission and Vision */}
        <section className="about-purpose">
          <article className="purpose-card">
            <div className="purpose-icon">
              <Target size={25} />
            </div>
            <h2>আমাদের লক্ষ্য</h2>
            <p>
              কৃষকদের কাছে কৃষি ও আবহাওয়া সম্পর্কিত প্রয়োজনীয় তথ্য
              সহজ ভাষায় উপস্থাপন করা এবং তথ্যভিত্তিক কৃষি সিদ্ধান্ত
              গ্রহণে সহায়তা করা।
            </p>
          </article>

          <article className="purpose-card">
            <div className="purpose-icon">
              <HeartHandshake size={25} />
            </div>
            <h2>আমাদের উদ্দেশ্য</h2>
            <p>
              আধুনিক প্রযুক্তি ব্যবহার করে কৃষকদের জন্য সহজলভ্য,
              ব্যবহারবান্ধব এবং তথ্যের উৎস সম্পর্কে স্বচ্ছ একটি
              ডিজিটাল কৃষি সহায়ক ব্যবস্থা তৈরি করা।
            </p>
          </article>
        </section>

        {/* Features */}
        <section className="about-features">
          <div className="about-section-heading">
            <span className="about-label">WHAT WE OFFER</span>
            <h2>AgriSense BD-এর সুবিধাসমূহ</h2>
            <p>
              কৃষিকাজের বিভিন্ন পর্যায়ে প্রয়োজনীয় তথ্য এক জায়গায় পাওয়ার সুবিধা।
            </p>
          </div>

          <div className="about-feature-grid">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article className="about-feature-card" key={feature.title}>
                  <div className="about-feature-icon">
                    <Icon size={25} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* How it helps */}
        <section className="about-help">
          <div className="about-help-icon">
            <Users size={30} />
          </div>

          <div>
            <span className="about-label">OUR APPROACH</span>
            <h2>কৃষকের পাশে প্রযুক্তি</h2>
            <p>
              প্রতিটি কৃষকের প্রয়োজন এক নয়। তাই ফসল, জমির পরিমাণ,
              মাটির ধরন, সেচের সুবিধা এবং এলাকার তথ্য বিবেচনায়
              রেখে প্রাসঙ্গিক কৃষি তথ্য উপস্থাপন করাই AgriSense BD-এর
              পরিকল্পনা।
            </p>
          </div>
        </section>

        {/* Technology */}
        <section className="about-tech">
          <div className="about-section-heading">
            <span className="about-label">TECHNOLOGY</span>
            <h2>ব্যবহৃত প্রযুক্তি</h2>
            <p>
              ওয়েব প্রযুক্তি ও আবহাওয়া API ব্যবহার করে তৈরি এই প্ল্যাটফর্ম।
            </p>
          </div>

          <div className="about-tech-content">
            <div className="about-tech-icon">
              <Code2 size={35} />
            </div>

            <div className="about-tech-list">
              {technologies.map((technology) => (
                <span className="tech-tag" key={technology}>
                  {technology}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Transparency */}
        <section className="about-transparency">
          <div className="about-transparency-icon">
            <ShieldCheck size={27} />
          </div>

          <div>
            <h2>বিশ্বস্ত তথ্য আমাদের অগ্রাধিকার</h2>
            <p>
              আমরা যাচাই করা তথ্য ও তথ্যের উৎসকে গুরুত্ব দিই।
              কোনো তথ্য নিশ্চিত না হলে সেটিকে নিশ্চিত পরামর্শ হিসেবে
              উপস্থাপন করা উচিত নয়। আবহাওয়ার পূর্বাভাসকে সরাসরি
              মাঠের পর্যবেক্ষণ হিসেবে বিবেচনা করা হয় না।
            </p>
          </div>
        </section>

        <footer className="about-footer">
          <div className="about-footer-logo">
            <Leaf size={21} />
            <strong>AgriSense BD</strong>
          </div>
          <p>প্রযুক্তির ছোঁয়ায় স্মার্ট কৃষির পথে।</p>
          <small>© {new Date().getFullYear()} AgriSense BD. All rights reserved.</small>
        </footer>
      </div>
    </div>
  );
}

export default About;
