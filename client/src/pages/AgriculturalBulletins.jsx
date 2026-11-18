
import {
  CloudRain,
  ExternalLink,
  FileText,
  Info,
  CalendarDays,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
} from "lucide-react";

import PageHero from "../components/PageHero";
import "./AgriculturalBulletins.css";

const officialSources = [
  {
    name: "BAMIS",
    fullName: "Bangladesh Agro-Meteorological Information Service",
    description:
      "কৃষি আবহাওয়া, ফসলভিত্তিক পরামর্শ এবং কৃষি আবহাওয়া বুলেটিনের জন্য অফিসিয়াল উৎস।",
    url: "https://www.bamis.gov.bd/",
    icon: CloudRain,
  },
  {
    name: "BMD",
    fullName: "Bangladesh Meteorological Department",
    description:
      "আবহাওয়ার পূর্বাভাস, সতর্কবার্তা এবং আবহাওয়া সংক্রান্ত সরকারি তথ্য।",
    url: "https://bmd.gov.bd/",
    icon: CloudRain,
  },
  {
    name: "DAE",
    fullName: "Department of Agricultural Extension",
    description:
      "কৃষি সম্প্রসারণ, কৃষকদের জন্য নির্দেশনা এবং সরকারি কৃষি তথ্য।",
    url: "https://dae.gov.bd/",
    icon: BookOpen,
  },
];

function AgriculturalBulletins() {
  return (
    <div className="bulletins-page">
      <PageHero
        eyebrow="AGRICULTURAL INFORMATION"
        title="কৃষি আবহাওয়া বুলেটিন"
        description="সরকারি ও নির্ভরযোগ্য উৎস থেকে কৃষি আবহাওয়া সংক্রান্ত বুলেটিন এবং সতর্কবার্তা খুঁজে নিন।"
        icon={FileText}
      />

      <main className="bulletins-container">

        {/* Introduction */}
        <section className="bulletins-intro">
          <div className="bulletins-intro-icon">
            <CloudRain size={28} />
          </div>

          <div>
            <h2>কৃষি আবহাওয়া তথ্য কেন গুরুত্বপূর্ণ?</h2>
            <p>
              বৃষ্টি, তাপমাত্রা, ঝড় এবং অন্যান্য আবহাওয়ার পরিবর্তন
              কৃষিকাজে প্রভাব ফেলতে পারে। তাই কৃষিকাজের পরিকল্পনার
              আগে সরকারি কৃষি আবহাওয়া বুলেটিন ও সতর্কবার্তা
              দেখে নেওয়া গুরুত্বপূর্ণ।
            </p>
          </div>
        </section>

        {/* Official Sources */}
        <section className="bulletins-section">
          <div className="bulletins-heading">
            <div>
              <h2>অফিসিয়াল তথ্যের উৎস</h2>
              <p>নিচের সরকারি ওয়েবসাইটগুলো থেকে বুলেটিন দেখুন।</p>
            </div>

            <span className="bulletins-source-count">
              ৩টি উৎস
            </span>
          </div>

          <div className="bulletins-source-grid">
            {officialSources.map((source) => {
              const SourceIcon = source.icon;

              return (
                <article className="bulletins-source-card" key={source.name}>
                  <div className="bulletins-source-top">
                    <div className="bulletins-source-icon">
                      <SourceIcon size={24} />
                    </div>

                    <span className="bulletins-official-label">
                      Official Source
                    </span>
                  </div>

                  <h3>{source.name}</h3>
                  <h4>{source.fullName}</h4>

                  <p>{source.description}</p>

                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bulletins-source-link"
                  >
                    অফিসিয়াল ওয়েবসাইট দেখুন
                    <ExternalLink size={16} />
                  </a>
                </article>
              );
            })}
          </div>
        </section>

        {/* Bulletin Availability */}
        <section className="bulletins-availability">
          <div className="bulletins-availability-icon">
            <AlertTriangle size={25} />
          </div>

          <div className="bulletins-availability-content">
            <span className="bulletins-status-label">
              BULLETIN DATA STATUS
            </span>

            <h2>বুলেটিন ডেটা এখনো সংযুক্ত করা হয়নি</h2>

            <p>
              AgriSense BD-তে এখনো BAMIS বা BMD-এর বুলেটিন
              স্বয়ংক্রিয়ভাবে সংগ্রহ করার ব্যবস্থা যুক্ত হয়নি।
              সর্বশেষ বুলেটিন দেখতে সংশ্লিষ্ট অফিসিয়াল ওয়েবসাইটে যান।
            </p>

            <span className="bulletins-todo-badge">
              TODO_VERIFY
            </span>
          </div>
        </section>

        {/* Future Bulletin Information */}
        <section className="bulletins-section">
          <div className="bulletins-heading">
            <div>
              <h2>বুলেটিনে কী কী তথ্য থাকবে?</h2>
              <p>যাচাইকৃত বুলেটিন যুক্ত হলে এই তথ্যগুলো দেখানো হবে।</p>
            </div>
          </div>

          <div className="bulletins-feature-grid">
            <div className="bulletins-feature">
              <CalendarDays size={23} />
              <h3>প্রকাশের তারিখ</h3>
              <p>বুলেটিনটি কখন প্রকাশিত হয়েছে।</p>
            </div>

            <div className="bulletins-feature">
              <CloudRain size={23} />
              <h3>আবহাওয়ার পূর্বাভাস</h3>
              <p>বৃষ্টি, তাপমাত্রা ও অন্যান্য আবহাওয়ার তথ্য।</p>
            </div>

            <div className="bulletins-feature">
              <FileText size={23} />
              <h3>কৃষি পরামর্শ</h3>
              <p>ফসল ও কৃষিকাজ সম্পর্কিত নির্দেশনা।</p>
            </div>

            <div className="bulletins-feature">
              <ShieldCheck size={23} />
              <h3>সতর্কবার্তা</h3>
              <p>প্রতিকূল আবহাওয়ার ক্ষেত্রে প্রকাশিত সতর্কতা।</p>
            </div>
          </div>
        </section>

        {/* Data Reliability */}
        <section className="bulletins-reliability">
          <div className="bulletins-reliability-icon">
            <Info size={22} />
          </div>

          <div>
            <h3>তথ্যের নির্ভরযোগ্যতা</h3>
            <p>
              প্রতিটি বুলেটিনের সঙ্গে উৎস, প্রকাশের তারিখ,
              সংগ্রহের সময় এবং তথ্যের ধরন দেখানো হবে।
              পুরোনো বুলেটিনকে সর্বশেষ তথ্য হিসেবে দেখানো হবে না।
              আবহাওয়ার পূর্বাভাসকে বাস্তব পর্যবেক্ষণ হিসেবেও
              উপস্থাপন করা হবে না।
            </p>
          </div>
        </section>

        <div className="bulletins-disclaimer">
          <Info size={17} />
          <p>
            কৃষিকাজের সিদ্ধান্ত নেওয়ার আগে সর্বশেষ সরকারি
            বুলেটিন এবং স্থানীয় কৃষি কর্মকর্তার পরামর্শ যাচাই করুন।
          </p>
        </div>

      </main>
    </div>
  );
}

export default AgriculturalBulletins;
