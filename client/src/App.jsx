
import { useState } from "react";
import "./App.css";

const crops = [
  { name: "ধান", english: "Rice", category: "শস্য" },
  { name: "আলু", english: "Potato", category: "সবজি" },
  { name: "টমেটো", english: "Tomato", category: "সবজি" },
];

const markets = [
  { name: "স্থানীয় বাজার ১", location: "বাজারের তথ্য যোগ করতে হবে", price: null },
  { name: "স্থানীয় বাজার ২", location: "বাজারের তথ্য যোগ করতে হবে", price: null },
];

function App() {
  const [selectedCrop, setSelectedCrop] = useState("ধান");
  const [quantity, setQuantity] = useState("100");
  const [price, setPrice] = useState("50");
  const [transport, setTransport] = useState("300");
  const [labour, setLabour] = useState("100");
  const [otherCost, setOtherCost] = useState("50");
  const [wastage, setWastage] = useState("0");

  const q = Number(quantity);
  const p = Number(price);
  const w = Number(wastage);
  const costs =
    Number(transport) + Number(labour) + Number(otherCost);

  const valid =
    quantity.trim() !== "" &&
    price.trim() !== "" &&
    transport.trim() !== "" &&
    labour.trim() !== "" &&
    otherCost.trim() !== "" &&
    wastage.trim() !== "" &&
    [q, p, w, costs].every(Number.isFinite) &&
    q > 0 &&
    p >= 0 &&
    Number(transport) >= 0 &&
    Number(labour) >= 0 &&
    Number(otherCost) >= 0 &&
    w >= 0 &&
    w <= 100;

  const sellable = valid ? q * (1 - w / 100) : 0;
  const gross = sellable * p;
  const net = gross - costs;

  const money = (value) =>
    value.toLocaleString("en-BD", {
      maximumFractionDigits: 2,
    });

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#home">
          <span className="brand-icon">🌱</span>
          <span>
            AgriSense <b>BD</b>
          </span>
        </a>

        <nav>
          <a href="#home">হোম</a>
          <a href="#markets">বাজারদর</a>
          <a href="#planner">বিক্রয় পরিকল্পনা</a>
          <a href="#about">আমাদের সম্পর্কে</a>
        </nav>

        <span className="version">MVP · v1</span>
      </header>

      <main id="home">
        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow">
              কৃষকের সিদ্ধান্তে তথ্যের শক্তি
            </span>

            <h1>
              সঠিক তথ্য নিয়ে
              <br />
              <span>স্মার্ট সিদ্ধান্ত নিন</span>
            </h1>

            <p>
              ফসলের প্রাথমিক নির্দেশনা দেখুন, বাজারের তথ্য যাচাই
              করুন এবং বিক্রির সম্ভাব্য আয় ও খরচ হিসাব করুন।
            </p>

            <a className="primary-btn" href="#planner">
              বিক্রয় হিসাব করুন ↓
            </a>

            <p className="hero-note">
              তথ্যের উৎস ও তারিখ যাচাই করে সিদ্ধান্ত নিন।
            </p>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="sun" />
            <div className="field field-back" />
            <div className="field field-front" />
            <div className="plant plant-one">🌾</div>
            <div className="plant plant-two">🌿</div>
            <div className="floating-card">
              🌱 <span>কৃষকের পাশে, তথ্যের সাথে</span>
            </div>
          </div>
        </section>

        <section className="stats">
          <article>
            <span>🌾</span>
            <div>
              <b>ফসল নির্দেশনা</b>
              <small>উৎসভিত্তিক তথ্য</small>
            </div>
          </article>

          <article>
            <span>🏪</span>
            <div>
              <b>বাজারদর</b>
              <small>তারিখসহ মূল্যতথ্য</small>
            </div>
          </article>

          <article>
            <span>🧮</span>
            <div>
              <b>বিক্রয় পরিকল্পনা</b>
              <small>খরচ বাদে সম্ভাব্য আয়</small>
            </div>
          </article>
        </section>

        <section className="section" id="markets">
          <div className="section-heading">
            <div>
              <span className="eyebrow">MARKET INFORMATION</span>
              <h2>বাজারের তথ্য</h2>
            </div>

            <span className="status">তথ্য যাচাই প্রয়োজন</span>
          </div>

          <p className="section-desc">
            বাস্তব বাজারদর সংগ্রহ ও যাচাই না করা পর্যন্ত এখানে
            কোনো মূল্যকে প্রকৃত বা আজকের বাজারদর হিসেবে দেখানো
            হচ্ছে না।
          </p>

          <div className="market-grid">
            {markets.map((market) => (
              <article className="market-card" key={market.name}>
                <span className="market-icon">🏬</span>
                <h3>{market.name}</h3>
                <p>{market.location}</p>

                <div className="price-row">
                  <b>
                    {market.price === null
                      ? "তথ্য পাওয়া যায়নি"
                      : market.price}
                  </b>
                  <span>মূল্য/একক</span>
                </div>

                <small>
                  উৎস ও সংগ্রহের তারিখ যোগ করতে হবে
                </small>
              </article>
            ))}
          </div>
        </section>

        <section className="section crop-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">CROP GUIDANCE</span>
              <h2>ফসল নির্দেশনা</h2>
            </div>
          </div>

          <p className="section-desc">
            ফসল নির্বাচন করো। বিস্তারিত কৃষি পরামর্শ নির্ভরযোগ্য
            উৎস যাচাই করে পরবর্তীতে যোগ করা হবে।
          </p>

          <div className="crop-grid">
            {crops.map((crop) => (
              <button
                className={`crop-card ${
                  selectedCrop === crop.name ? "active" : ""
                }`}
                key={crop.name}
                onClick={() => setSelectedCrop(crop.name)}
              >
                <span>
                  {crop.name === "ধান"
                    ? "🌾"
                    : crop.name === "আলু"
                      ? "🥔"
                      : "🍅"}
                </span>
                <b>{crop.name}</b>
                <small>
                  {crop.english} · {crop.category}
                </small>
              </button>
            ))}
          </div>

          <div className="guidance-note">
            <span>ℹ️</span>
            <div>
              <b>{selectedCrop} সম্পর্কে</b>
              <p>
                এই ফসলের জন্য যাচাইকৃত কৃষি নির্দেশনা এখনো
                যোগ করা হয়নি।
              </p>
            </div>
          </div>
        </section>

        <section className="section planner-section" id="planner">
          <div className="section-heading">
            <div>
              <span className="eyebrow">SMART SELL PLANNER</span>
              <h2>বিক্রির হিসাব করুন</h2>
            </div>
          </div>

          <p className="section-desc">
            নিজের দেওয়া মূল্য ও খরচ দিয়ে একটি উদাহরণ হিসাব করুন।
            এটি প্রকৃত বাজারদর নয়।
          </p>

          <div className="planner-layout">
            <div className="planner-form">
              <label>
                ফসল নির্বাচন
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                >
                  {crops.map((crop) => (
                    <option key={crop.name} value={crop.name}>
                      {crop.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="input-grid">
                <label>
                  পরিমাণ (কেজি)
                  <input
                    type="number"
                    min="0.01"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </label>

                <label>
                  নিজের দেওয়া মূল্য (৳/কেজি)
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </label>

                <label>
                  পরিবহন খরচ (৳)
                  <input
                    type="number"
                    min="0"
                    value={transport}
                    onChange={(e) => setTransport(e.target.value)}
                  />
                </label>

                <label>
                  শ্রম/লোডিং (৳)
                  <input
                    type="number"
                    min="0"
                    value={labour}
                    onChange={(e) => setLabour(e.target.value)}
                  />
                </label>

                <label>
                  অন্যান্য বিক্রয় খরচ (৳)
                  <input
                    type="number"
                    min="0"
                    value={otherCost}
                    onChange={(e) => setOtherCost(e.target.value)}
                  />
                </label>

                <label>
                  সম্ভাব্য অপচয় (%)
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={wastage}
                    onChange={(e) => setWastage(e.target.value)}
                  />
                </label>
              </div>

              <p className="input-hint">
                মূল্যটি তোমার দেওয়া অনুমান; এটি যাচাইকৃত বাজারদর নয়।
              </p>
            </div>

            <aside className="result-card">
              <span className="result-label">
                আনুমানিক নিট বিক্রয় আয়
              </span>

              <div className="net-value">
                ৳{valid ? money(net) : "—"}
              </div>

              {!valid && (
                <p className="error-text">
                  সঠিক পরিমাণ, মূল্য, খরচ ও ০–১০০% অপচয় দাও।
                </p>
              )}

              <div className="result-line">
                <span>বিক্রয়যোগ্য পরিমাণ</span>
                <b>
                  {valid ? money(sellable) : "—"} কেজি
                </b>
              </div>

              <div className="result-line">
                <span>মোট বিক্রয় আয়</span>
                <b>৳{valid ? money(gross) : "—"}</b>
              </div>

              <div className="result-line">
                <span>মোট বিক্রয় খরচ</span>
                <b>৳{valid ? money(costs) : "—"}</b>
              </div>

              <p className="result-disclaimer">
                এটি অনুমানভিত্তিক বিক্রয় আয়, সম্পূর্ণ কৃষি
                মুনাফা নয়।
              </p>
            </aside>
          </div>
        </section>

        <section className="about-section" id="about">
          <span className="eyebrow">ABOUT AGRISENSE BD</span>
          <h2>তথ্যভিত্তিক কৃষি সিদ্ধান্তের সহায়ক</h2>

          <p>
            AgriSense BD নির্বাচিত ফসলের উৎসভিত্তিক নির্দেশনা,
            তারিখসহ বাজারমূল্য এবং কৃষকের দেওয়া খরচ ব্যবহার করে
            বিক্রয়ের সম্ভাব্য নিট আয় হিসাব করতে সহায়তা করবে।
          </p>

          <p className="disclaimer">
            সীমিত তথ্যের ভিত্তিতে তৈরি এই MVP কোনো নিশ্চিত
            বাজারদর, কৃষি রোগ নির্ণয় বা নিশ্চিত মুনাফার
            প্রতিশ্রুতি দেয় না।
          </p>
        </section>
      </main>

      <footer>
        <a className="brand" href="#home">
          🌱 AgriSense <b>BD</b>
        </a>
        <span>From Soil to Sale · Student Project</span>
      </footer>
    </div>
  );
}

export default App;
