
import {
  Sprout,
  CalendarDays,
  ShieldAlert,
  Info,
  CheckCircle2,
  Wheat,
  Leaf,
  CircleHelp,
} from "lucide-react";

const stageFeatures = [
  {
    icon: Sprout,
    title: "বৃদ্ধির পর্যায়",
    description:
      "বীজ বপন থেকে ফসলের পরিপক্বতা পর্যন্ত বিভিন্ন পর্যায়ের তথ্য।",
  },
  {
    icon: ShieldAlert,
    title: "সম্ভাব্য ঝুঁকি",
    description:
      "ফসলের পর্যায় ও আবহাওয়ার তথ্যের ভিত্তিতে সম্ভাব্য রোগ ও পোকার ঝুঁকি।",
  },
  {
    icon: CalendarDays,
    title: "পরিচর্যার সময়",
    description:
      "প্রতিটি পর্যায়ে প্রয়োজনীয় পরিচর্যার যাচাইকৃত সময় ও নির্দেশনা।",
  },
];

function CropStages() {
  return (
    <main className="crop-stages-page">
      <section className="crop-stages-hero">
        <div className="container">
          <div className="crop-stages-hero-content">
            <span className="section-eyebrow">
              <Sprout size={16} />
              Crop Growth & Risk
            </span>

            <h1>ফসলের বৃদ্ধি ও সম্ভাব্য ঝুঁকি</h1>

            <p>
              ফসলের পর্যায় অনুযায়ী পরিচর্যা, আবহাওয়াজনিত
              সম্ভাব্য ঝুঁকি এবং প্রয়োজনীয় কৃষি-তথ্য জানুন।
            </p>
          </div>

          <div className="crop-stages-hero-icon">
            <Wheat size={76} strokeWidth={1.3} />
          </div>
        </div>
      </section>

      <section className="container crop-stages-content">
        <div className="crop-stages-intro">
          <div>
            <span className="section-eyebrow">কীভাবে কাজ করবে?</span>
            <h2>ফসলের পর্যায়ভিত্তিক তথ্য</h2>
            <p>
              ফসলের নাম ও রোপণের তারিখ অনুযায়ী পর্যায় নির্ধারণের
              জন্য যাচাইকৃত ফসলভিত্তিক তথ্য প্রয়োজন।
            </p>
          </div>
        </div>

        <div className="crop-stage-feature-grid">
          {stageFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <article className="crop-stage-feature" key={feature.title}>
                <div className="crop-stage-feature-icon">
                  <Icon size={24} />
                </div>

                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            );
          })}
        </div>

        <section className="crop-stage-data-panel">
          <div className="crop-stage-panel-heading">
            <div className="crop-stage-panel-icon">
              <Leaf size={23} />
            </div>

            <div>
              <h2>ফসলের পর্যায়ের তথ্য</h2>
              <p>
                ফসলভিত্তিক যাচাইকৃত তথ্য সংযুক্ত হলে এখানে
                পর্যায়গুলো প্রদর্শিত হবে।
              </p>
            </div>
          </div>

          <div className="crop-stage-empty-state">
            <div className="crop-stage-empty-icon">
              <CircleHelp size={34} />
            </div>

            <h3>যাচাইকৃত তথ্য এখনো সংযুক্ত হয়নি</h3>

            <p>
              বর্তমানে ফসলের পর্যায়, পর্যায়ের সময়কাল এবং
              পর্যায়ভিত্তিক পরিচর্যার তথ্য যাচাই করা হচ্ছে।
              পর্যাপ্ত তথ্য ছাড়া কোনো ফলাফল তৈরি করা হবে না।
            </p>

            <span className="crop-stage-status">
              <Info size={15} />
              তথ্য যাচাই প্রয়োজন
            </span>
          </div>
        </section>

        <section className="crop-stage-source-note">
          <CheckCircle2 size={21} />

          <div>
            <h3>তথ্যের নির্ভরযোগ্যতা</h3>
            <p>
              প্রতিটি ফসলের পর্যায় ও কৃষি নির্দেশনার সঙ্গে
              সংশ্লিষ্ট উৎস যুক্ত করা হবে। যেমন BRRI, BARI,
              BARC এবং DAE-এর যাচাইকৃত প্রকাশনা।
            </p>
          </div>
        </section>

        <div className="crop-stage-disclaimer">
          <ShieldAlert size={20} />
          <p>
            এখানে দেখানো তথ্য এখনো কৃষি পরামর্শ হিসেবে ব্যবহারযোগ্য নয়।
            রোগ বা পোকামাকড়ের সম্ভাব্য ঝুঁকি নিশ্চিত রোগ নির্ণয় নয়।
            নিশ্চিত হতে স্থানীয় কৃষি অফিসে যোগাযোগ করুন।
          </p>
        </div>
      </section>
    </main>
  );
}

export default CropStages;
