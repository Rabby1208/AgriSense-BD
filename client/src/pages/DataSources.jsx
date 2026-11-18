

import {
  Database,
  CloudSun,
  Sprout,
  BookOpen,
  ShieldCheck,
  Info,
 
} from "lucide-react";
import PageHero from "../components/PageHero";
import "./DataSources.css";

const sources = [
  {
    name: "বাংলাদেশ কৃষি গবেষণা কাউন্সিল (BARC)",
    shortName: "BARC",
    category: "কৃষি গবেষণা ও নির্দেশিকা",
    description:
      "ফসল উৎপাদন, মাটি, সার ব্যবস্থাপনা এবং কৃষি বিষয়ক গবেষণালব্ধ তথ্যের রেফারেন্স।",
    icon: Sprout,
  },
  {
    name: "বাংলাদেশ ধান গবেষণা ইনস্টিটিউট (BRRI)",
    shortName: "BRRI",
    category: "ধান চাষ বিষয়ক তথ্য",
    description:
      "ধানের জাত, চাষ পদ্ধতি, উৎপাদন প্রযুক্তি এবং ধান চাষের নির্দেশিকার তথ্যসূত্র।",
    icon: BookOpen,
  },
  {
    name: "বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট (BARI)",
    shortName: "BARI",
    category: "ফসল ও কৃষি প্রযুক্তি",
    description:
      "আলু, টমেটো, সরিষাসহ বিভিন্ন ফসলের চাষাবাদ ও কৃষি প্রযুক্তি বিষয়ক তথ্যসূত্র।",
    icon: Sprout,
  },
  {
    name: "কৃষি সম্প্রসারণ অধিদপ্তর (DAE)",
    shortName: "DAE",
    category: "কৃষি পরামর্শ ও সম্প্রসারণ",
    description:
      "কৃষকদের জন্য কৃষি পরামর্শ, ফসল ব্যবস্থাপনা এবং সম্প্রসারণ কার্যক্রমের তথ্যসূত্র।",
    icon: ShieldCheck,
  },
  {
    name: "বাংলাদেশ কৃষি আবহাওয়া তথ্য পোর্টাল (BAMIS)",
    shortName: "BAMIS",
    category: "কৃষি আবহাওয়া ও সতর্কতা",
    description:
      "কৃষি আবহাওয়া বুলেটিন, আবহাওয়া-ভিত্তিক কৃষি পরামর্শ এবং সতর্কতার তথ্যসূত্র।",
    icon: CloudSun,
  },
  {
    name: "বাংলাদেশ আবহাওয়া অধিদপ্তর (BMD)",
    shortName: "BMD",
    category: "আবহাওয়া বিষয়ক তথ্য",
    description:
      "বাংলাদেশের আবহাওয়া পর্যবেক্ষণ, পূর্বাভাস এবং আবহাওয়া সতর্কতার প্রাতিষ্ঠানিক তথ্যসূত্র।",
    icon: CloudSun,
  },
  {
    name: "Open-Meteo",
    shortName: "Weather API",
    category: "আবহাওয়া API",
    description:
      "AgriSense BD-তে আবহাওয়ার পূর্বাভাস ও আবহাওয়া-সংক্রান্ত ডেটা সংগ্রহের জন্য ব্যবহৃত API।",
    icon: Database,
  },
];

function DataSources() {
  return (
    <div className="data-sources-page">
      <PageHero
        eyebrow="তথ্য ও নির্ভরযোগ্যতা"
        title="তথ্যসূত্র"
        description="AgriSense BD-এর কৃষি পরামর্শ, আবহাওয়া তথ্য এবং নির্দেশিকার পেছনে ব্যবহৃত তথ্যের উৎস সম্পর্কে জানুন।"
      />

      <div className="data-sources-container">
        <section className="sources-intro">
          <div className="sources-intro-icon">
            <Database size={25} />
          </div>

          <div>
            <h2>আমাদের তথ্য কোথা থেকে আসে?</h2>
            <p>
              AgriSense BD কৃষি বিষয়ক তথ্যের জন্য বাংলাদেশের কৃষি গবেষণা
              প্রতিষ্ঠান ও সরকারি সংস্থার প্রকাশনা এবং আবহাওয়ার জন্য
              Open-Meteo API ব্যবহার করে। প্রতিটি তথ্যের উৎস ও যাচাইয়ের
              অবস্থা পরিষ্কারভাবে দেখানো আমাদের লক্ষ্য।
            </p>
          </div>
        </section>

        <section className="sources-section">
          <div className="sources-heading">
            <div>
              <span className="sources-kicker">OUR DATA PARTNERS</span>
              <h2>কৃষি ও আবহাওয়ার তথ্যসূত্র</h2>
              <p>যেসব প্রতিষ্ঠান ও সেবা আমাদের তথ্যের রেফারেন্স হিসেবে ব্যবহৃত হয়।</p>
            </div>

            <span className="sources-count">
              {sources.length} টি উৎস
            </span>
          </div>

          <div className="sources-grid">
            {sources.map((source) => {
              const Icon = source.icon;

              return (
                <article className="source-card" key={source.shortName}>
                  <div className="source-card-top">
                    <div className="source-icon">
                      <Icon size={23} />
                    </div>
                    <span className="source-short-name">
                      {source.shortName}
                    </span>
                  </div>

                  <span className="source-category">
                    {source.category}
                  </span>

                  <h3>{source.name}</h3>

                  <p>{source.description}</p>

                  <div className="source-card-footer">
                    <Info size={15} />
                    <span>তথ্যসূত্র হিসেবে নির্ধারিত</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="data-transparency">
          <div className="transparency-heading">
            <ShieldCheck size={23} />
            <h2>তথ্যের স্বচ্ছতা ও নির্ভরযোগ্যতা</h2>
          </div>

          <div className="transparency-grid">
            <div className="transparency-item">
              <h3>তথ্যের উৎস</h3>
              <p>
                কৃষি পরামর্শের ক্ষেত্রে সংশ্লিষ্ট প্রতিষ্ঠানের প্রকাশনা
                ও নির্দেশিকাকে গুরুত্ব দেওয়া হয়।
              </p>
            </div>

            <div className="transparency-item">
              <h3>তথ্যের সময়</h3>
              <p>
                আবহাওয়ার তথ্যের ক্ষেত্রে সংগ্রহের সময় এবং পূর্বাভাসের
                কার্যকর সময় আলাদাভাবে দেখানো উচিত।
              </p>
            </div>

            <div className="transparency-item">
              <h3>যাচাই না করা তথ্য</h3>
              <p>
                কোনো তথ্য যাচাই করা না থাকলে সেটিকে নিশ্চিত পরামর্শ
                হিসেবে দেখানো হবে না।
              </p>
            </div>

            <div className="transparency-item">
              <h3>আবহাওয়ার সীমাবদ্ধতা</h3>
              <p>
                API-এর পূর্বাভাস মাঠের সরাসরি পর্যবেক্ষণ বা সেন্সরের
                পরিমাপ নয়।
              </p>
            </div>
          </div>
        </section>

        <section className="sources-note">
          <Info size={19} />
          <p>
            <strong>বিশেষ দ্রষ্টব্য:</strong> কোনো প্রতিষ্ঠানকে তথ্যসূত্র
            হিসেবে উল্লেখ করার অর্থ এই নয় যে প্রতিষ্ঠানটি AgriSense BD-এর
            সঙ্গে সরাসরি যুক্ত বা সব তথ্য স্বয়ংক্রিয়ভাবে তাদের কাছ থেকে
            সংগ্রহ করা হচ্ছে। প্রতিটি তথ্যের প্রকৃত উৎস ও সংযোগের অবস্থা
            আলাদাভাবে যাচাই করতে হবে।
          </p>
        </section>
      </div>
    </div>
  );
}

export default DataSources;
