
import { useState } from "react";
import {
  Bug,
  Leaf,
  Search,
  ShieldCheck,
  AlertTriangle,
  Info,
  Sprout,
  BookOpen,
} from "lucide-react";

import PageHero from "../components/PageHero";
import "./PestDisease.css";

const crops = [
  { id: "boro_rice", name: "বোরো ধান", english: "Boro Rice" },
  { id: "potato", name: "আলু", english: "Potato" },
  { id: "tomato", name: "টমেটো", english: "Tomato" },
  { id: "mustard", name: "সরিষা", english: "Mustard" },
];

function PestDisease() {
  const [selectedCrop, setSelectedCrop] = useState("boro_rice");

  const crop = crops.find((item) => item.id === selectedCrop);

  return (
    <div className="pest-page">
      <PageHero
        eyebrow="CROP PROTECTION"
        title="রোগ ও পোকামাকড় নির্দেশিকা"
        description="ফসলের রোগবালাই সম্পর্কে জানুন এবং নির্ভরযোগ্য কৃষি তথ্যের ভিত্তিতে সচেতন সিদ্ধান্ত নিন।"
        icon={Bug}
      />

      <div className="pest-container">

        {/* Crop Selection */}
        <section className="pest-selection-card">
          <div className="pest-section-heading">
            <div className="pest-icon-box">
              <Sprout size={22} />
            </div>

            <div>
              <h2>আপনার ফসল নির্বাচন করুন</h2>
              <p>যে ফসল সম্পর্কে তথ্য জানতে চান সেটি নির্বাচন করুন।</p>
            </div>
          </div>

          <div className="pest-select-wrapper">
            <label htmlFor="pest-crop">ফসলের নাম</label>

            <select
              id="pest-crop"
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
            >
              {crops.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.english})
                </option>
              ))}
            </select>
          </div>

          <div className="pest-selected-crop">
            <Leaf size={18} />
            <span>নির্বাচিত ফসল: <strong>{crop.name}</strong></span>
          </div>
        </section>

        {/* Data Availability */}
        <section className="pest-status-card">
          <div className="pest-status-icon">
            <AlertTriangle size={26} />
          </div>

          <div className="pest-status-content">
            <span className="pest-status-label">DATA STATUS</span>
            <h2>যাচাইকৃত তথ্য এখনো প্রস্তুত নয়</h2>
            <p>
              {crop.name} ফসলের জন্য যাচাইকৃত রোগ, পোকামাকড়,
              লক্ষণ এবং প্রতিকার সম্পর্কিত তথ্য এখনো যুক্ত করা হয়নি।
              নির্ভরযোগ্য তথ্য যাচাই না হওয়া পর্যন্ত কোনো নির্দিষ্ট
              রোগ বা প্রতিকারের পরামর্শ দেখানো হচ্ছে না।
            </p>
            <span className="pest-todo-badge">TODO_VERIFY</span>
          </div>
        </section>

        {/* Information Categories */}
        <section className="pest-info-section">
          <div className="pest-section-title">
            <h2>এই নির্দেশিকায় কী কী থাকবে?</h2>
            <p>যাচাইকৃত তথ্য যুক্ত হলে নিচের বিষয়গুলো দেখা যাবে।</p>
          </div>

          <div className="pest-info-grid">
            <div className="pest-info-card">
              <div className="pest-info-icon">
                <Bug size={23} />
              </div>
              <h3>রোগ ও পোকামাকড়</h3>
              <p>
                ফসলের জন্য পরিচিত রোগ এবং ক্ষতিকর পোকামাকড়ের
                যাচাইকৃত পরিচিতি।
              </p>
              <span>তথ্য যাচাই প্রয়োজন</span>
            </div>

            <div className="pest-info-card">
              <div className="pest-info-icon">
                <Search size={23} />
              </div>
              <h3>লক্ষণ শনাক্তকরণ</h3>
              <p>
                পাতার দাগ, রঙ পরিবর্তন এবং অন্যান্য দৃশ্যমান
                লক্ষণ সম্পর্কে তথ্য।
              </p>
              <span>তথ্য যাচাই প্রয়োজন</span>
            </div>

            <div className="pest-info-card">
              <div className="pest-info-icon">
                <Info size={23} />
              </div>
              <h3>অনুকূল পরিবেশ</h3>
              <p>
                কোন পরিবেশে রোগ বা পোকামাকড়ের ঝুঁকি বাড়তে পারে,
                তার যাচাইকৃত তথ্য।
              </p>
              <span>তথ্য যাচাই প্রয়োজন</span>
            </div>

            <div className="pest-info-card">
              <div className="pest-info-icon">
                <ShieldCheck size={23} />
              </div>
              <h3>প্রতিরোধ ও ব্যবস্থাপনা</h3>
              <p>
                কৃষি বিশেষজ্ঞ ও নির্ভরযোগ্য উৎসের ভিত্তিতে
                প্রতিরোধ এবং ব্যবস্থাপনার নির্দেশনা।
              </p>
              <span>তথ্য যাচাই প্রয়োজন</span>
            </div>
          </div>
        </section>

        {/* Weather Risk Note */}
        <section className="pest-weather-note">
          <div className="pest-note-icon">
            <Info size={22} />
          </div>

          <div>
            <h3>আবহাওয়া ও রোগবালাইয়ের ঝুঁকি</h3>
            <p>
              তাপমাত্রা, বৃষ্টিপাত এবং আর্দ্রতা কিছু রোগ বা
              পোকামাকড়ের অনুকূল পরিবেশ তৈরি করতে পারে।
              তবে শুধু আবহাওয়ার তথ্য দিয়ে কোনো রোগ নিশ্চিত
              করা যায় না। তাই যাচাইকৃত কৃষি তথ্য ছাড়া
              ঝুঁকির স্কোর দেখানো হবে না।
            </p>
          </div>
        </section>

        {/* Sources */}
        <section className="pest-source-card">
          <div className="pest-source-heading">
            <BookOpen size={21} />
            <h3>তথ্যের সম্ভাব্য নির্ভরযোগ্য উৎস</h3>
          </div>

          <ul>
            <li>Bangladesh Agricultural Research Institute (BARI)</li>
            <li>Bangladesh Rice Research Institute (BRRI)</li>
            <li>Department of Agricultural Extension (DAE)</li>
            <li>Bangladesh Agro-Meteorological Information Service (BAMIS)</li>
          </ul>

          <p className="pest-source-warning">
            উৎসের নাম উল্লেখ করা মানেই তথ্য যাচাই করা হয়েছে এমন নয়।
            প্রতিটি তথ্যের সঙ্গে নির্দিষ্ট উৎস ও যাচাইয়ের তারিখ
            যুক্ত করা হবে।
          </p>
        </section>

        <div className="pest-disclaimer">
          <AlertTriangle size={17} />
          <p>
            এই পেজটি কৃষি তথ্য সহায়তার জন্য। এটি রোগ নির্ণয় বা
            কৃষি বিশেষজ্ঞের পরামর্শের বিকল্প নয়।
          </p>
        </div>

      </div>
    </div>
  );
}

export default PestDisease;
