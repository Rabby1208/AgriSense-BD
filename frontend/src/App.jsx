
import { useRef, useState } from "react";
import {
  Leaf, Sprout, CloudSun, ScanSearch, Calculator,
  TrendingUp, Menu, X, Upload, Image as ImageIcon,
  ArrowRight, ShieldCheck, Droplets, Sun, Wheat,
  CheckCircle2, AlertCircle, LoaderCircle
} from "lucide-react";

import { predictPlantDisease } from "./services/mlApi";
import "./App.css";

const crops = [
  { id: "rice", name: "Rice", subtitle: "ধান", emoji: "🌾", color: "rice" },
  { id: "potato", name: "Potato", subtitle: "আলু", emoji: "🥔", color: "potato" },
  { id: "tomato", name: "Tomato", subtitle: "টমেটো", emoji: "🍅", color: "tomato" },
  { id: "maize", name: "Maize", subtitle: "ভুট্টা", emoji: "🌽", color: "maize" },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState("rice");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef(null);

  const [landArea, setLandArea] = useState(1);
  const [fertilizerRate, setFertilizerRate] = useState(20);

  const [totalCost, setTotalCost] = useState(10000);
  const [expectedRevenue, setExpectedRevenue] = useState(15000);

  const closeMenu = () => setMenuOpen(false);

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please upload a JPG, PNG or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setPrediction(null);
    setError("");
  };

  const handlePrediction = async () => {
    if (!image) {
      setError("Please upload a plant leaf image first.");
      return;
    }

    setLoading(true);
    setError("");
    setPrediction(null);

    try {
      const result = await predictPlantDisease(selectedCrop, image);
      setPrediction(result);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        "Unable to connect to the ML service."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = (result) => {
    switch (result?.detection_status) {
      case "success":
        return result.disease_detected
          ? "A possible disease condition was identified."
          : "The plant appears healthy according to the model.";
      case "uncertain":
        return "The model is uncertain. Please upload a clearer image.";
      case "crop_mismatch":
        return "The uploaded image may not match your selected crop.";
      case "unknown":
        return "The selected crop could not be reliably confirmed.";
      default:
        return result?.message || "Prediction completed.";
    }
  };

  const fertilizerTotal = Math.max(0, Number(landArea) || 0) *
    Math.max(0, Number(fertilizerRate) || 0);

  const profitLoss =
    (Number(expectedRevenue) || 0) - (Number(totalCost) || 0);

  return (
    <div className="app">
      <header className="navbar">
        <a href="#home" className="brand" onClick={closeMenu}>
          <span className="brand-icon"><Sprout size={25} /></span>
          <span>AgriSense<span className="brand-highlight">BD</span></span>
        </a>

        <button
          className="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <a href="#home" onClick={closeMenu}>Home</a>
          <a href="#crops" onClick={closeMenu}>Crops</a>
          <a href="#detection" onClick={closeMenu}>Disease Detection</a>
          <a href="#tools" onClick={closeMenu}>Farm Tools</a>
          <a href="#about" onClick={closeMenu}>About</a>
          <a href="#login" className="nav-login" onClick={closeMenu}>
            Login / Register
          </a>
        </nav>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="eyebrow">
              <Leaf size={15} /> SMART AGRICULTURE PLATFORM
            </div>

            <h1>
              Grow Smarter.
              <br />
              <span>Farm Better.</span>
            </h1>

            <p>
              Empowering farmers with smart crop information,
              AI-powered plant disease estimation and practical
              farming tools.
            </p>

            <div className="hero-actions">
              <a href="#detection" className="btn-primary">
                Detect Plant Disease <ArrowRight size={18} />
              </a>
              <a href="#crops" className="btn-outline">Explore Crops</a>
            </div>

            <div className="hero-trust">
              <span><ShieldCheck size={17} /> Smart farming support</span>
              <span><Sprout size={17} /> 4 supported crops</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-card">
              <img
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000"
                alt="Green agricultural field"
              />
              <div className="floating-card weather-card">
                <CloudSun size={25} />
                <div>
                  <strong>Weather</strong>
                  <small>Smart farm planning</small>
                </div>
              </div>
              <div className="floating-card crop-card">
                <Sprout size={24} />
                <div>
                  <strong>Healthy Crops</strong>
                  <small>Better decisions</small>
                </div>
              </div>
            </div>
            <div className="hero-decoration"></div>
          </div>
        </section>

        <section className="stats-strip">
          <div><strong>04</strong><span>Supported Crops</span></div>
          <div><strong>AI</strong><span>Plant Analysis</span></div>
          <div><strong>24/7</strong><span>Digital Access</span></div>
          <div><strong>BD</strong><span>Built for Agriculture</span></div>
        </section>

        <section className="section crops-section" id="crops">
          <div className="section-heading">
            <span className="section-tag">CROP SELECTION</span>
            <h2>Explore Your Crops</h2>
            <p>Select a crop to explore its information or start disease detection.</p>
          </div>

          <div className="crop-grid">
            {crops.map((crop) => (
              <button
                className={`crop-card ${crop.color}`}
                key={crop.id}
                onClick={() => {
                  setSelectedCrop(crop.id);
                  document.getElementById("detection")?.scrollIntoView({
                    behavior: "smooth"
                  });
                }}
              >
                <span className="crop-emoji">{crop.emoji}</span>
                <span className="crop-name">{crop.name}</span>
                <span className="crop-subtitle">{crop.subtitle}</span>
                <span className="crop-action">Select crop <ArrowRight size={15} /></span>
              </button>
            ))}
          </div>
        </section>

        <section className="section detection-section" id="detection">
          <div className="section-heading">
            <span className="section-tag">AI PLANT ANALYSIS</span>
            <h2>Plant Disease Detection</h2>
            <p>
              Upload a clear leaf image and select the crop.
              Our AI model will estimate its possible condition.
            </p>
          </div>

          <div className="detection-layout">
            <div className="detection-form">
              <label className="field-label">Select your crop</label>
              <div className="crop-select-grid">
                {crops.map((crop) => (
                  <button
                    key={crop.id}
                    className={selectedCrop === crop.id ? "crop-option active" : "crop-option"}
                    onClick={() => {
                      setSelectedCrop(crop.id);
                      setPrediction(null);
                    }}
                  >
                    <span>{crop.emoji}</span>
                    {crop.name}
                  </button>
                ))}
              </div>

              <label className="field-label upload-label">Upload leaf image</label>
              <button
                type="button"
                className="upload-box"
                onClick={() => fileInput.current?.click()}
              >
                {preview ? (
                  <img src={preview} alt="Selected plant leaf preview" />
                ) : (
                  <>
                    <span className="upload-icon"><Upload size={27} /></span>
                    <strong>Click to upload an image</strong>
                    <small>JPG, PNG or WEBP · Maximum 5 MB</small>
                  </>
                )}
              </button>

              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={handleImage}
              />

              {image && (
                <div className="file-info">
                  <ImageIcon size={16} />
                  <span>{image.name}</span>
                  <button onClick={() => {
                    setImage(null);
                    setPreview("");
                    setPrediction(null);
                  }}>Remove</button>
                </div>
              )}

              <button
                className="btn-primary predict-button"
                onClick={handlePrediction}
                disabled={loading || !image}
              >
                {loading ? (
                  <><LoaderCircle className="spin" size={19} /> Analyzing...</>
                ) : (
                  <><ScanSearch size={19} /> Analyze Plant</>
                )}
              </button>

              {error && (
                <div className="alert error-alert">
                  <AlertCircle size={18} /> {error}
                </div>
              )}
            </div>

            <div className="result-panel">
              <div className="result-header">
                <div className="result-icon"><ScanSearch size={23} /></div>
                <div>
                  <h3>Analysis Result</h3>
                  <p>Your prediction will appear here</p>
                </div>
              </div>

              {!prediction && !loading && (
                <div className="empty-result">
                  <div className="empty-illustration">🌿</div>
                  <h3>Ready to analyze</h3>
                  <p>Choose a crop, upload a leaf image and click Analyze Plant.</p>
                </div>
              )}

              {loading && (
                <div className="empty-result">
                  <LoaderCircle className="spin loading-icon" size={40} />
                  <h3>Analyzing your image...</h3>
                  <p>Please wait while the AI model processes the image.</p>
                </div>
              )}

              {prediction && (
                <div className="prediction-result">
                  <div className="result-status">
                    {prediction.detection_status === "success"
                      ? <CheckCircle2 size={19} />
                      : <AlertCircle size={19} />}
                    {prediction.detection_status?.replaceAll("_", " ").toUpperCase()}
                  </div>

                  <div className="result-data">
                    <span>Selected crop</span>
                    <strong>{prediction.selected_crop || selectedCrop}</strong>
                  </div>

                  {prediction.crop && (
                    <div className="result-data">
                      <span>Detected crop</span>
                      <strong>{prediction.crop}</strong>
                    </div>
                  )}

                  {prediction.disease && (
                    <div className="disease-name">
                      <small>Possible condition</small>
                      <h2>{prediction.disease}</h2>
                    </div>
                  )}

                  {prediction.disease_detected === false &&
                    prediction.detection_status === "success" && (
                      <div className="disease-name">
                        <small>Plant condition</small>
                        <h2>Healthy</h2>
                      </div>
                    )}

                  {typeof prediction.confidence === "number" && (
                    <div className="confidence">
                      <div>
                        <span>Model confidence</span>
                        <strong>{(prediction.confidence * 100).toFixed(2)}%</strong>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.min(100, prediction.confidence * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <p className="result-message">{getStatusMessage(prediction)}</p>

                  {prediction.message && (
                    <p className="result-message">{prediction.message}</p>
                  )}

                  <p className="disclaimer">
                    {prediction.disclaimer ||
                      "AI-generated estimate only. This is not a confirmed plant diagnosis. Consult an agricultural expert before treatment decisions."}
                  </p>

                  {prediction.model_version && (
                    <small className="model-version">
                      Model: {prediction.model_version}
                    </small>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="section tools-section" id="tools">
          <div className="section-heading">
            <span className="section-tag">FARM MANAGEMENT</span>
            <h2>Practical Farming Tools</h2>
            <p>Simple calculators to support better farming decisions.</p>
          </div>

          <div className="tools-grid">
            <div className="tool-card">
              <div className="tool-icon"><Calculator size={24} /></div>
              <h3>Fertilizer Calculator</h3>
              <p>Estimate fertilizer quantity based on land area and application rate.</p>

              <label>Land area (acre)</label>
              <input
                type="number"
                min="0"
                value={landArea}
                onChange={(e) => setLandArea(e.target.value)}
              />

              <label>Fertilizer rate (kg/acre)</label>
              <input
                type="number"
                min="0"
                value={fertilizerRate}
                onChange={(e) => setFertilizerRate(e.target.value)}
              />

              <div className="calculation-result">
                <span>Estimated fertilizer</span>
                <strong>{fertilizerTotal.toFixed(2)} kg</strong>
              </div>
              <small className="tool-note">
                Illustrative calculation. Follow crop-specific expert recommendations.
              </small>
            </div>

            <div className="tool-card">
              <div className="tool-icon"><TrendingUp size={24} /></div>
              <h3>Cost & Profit/Loss</h3>
              <p>Estimate your farming outcome by entering cost and expected revenue.</p>

              <label>Total farming cost (৳)</label>
              <input
                type="number"
                min="0"
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
              />

              <label>Expected revenue (৳)</label>
              <input
                type="number"
                min="0"
                value={expectedRevenue}
                onChange={(e) => setExpectedRevenue(e.target.value)}
              />

              <div className="calculation-result">
                <span>{profitLoss >= 0 ? "Estimated profit" : "Estimated loss"}</span>
                <strong className={profitLoss >= 0 ? "positive" : "negative"}>
                  ৳{Math.abs(profitLoss).toLocaleString("en-BD")}
                </strong>
              </div>
              <small className="tool-note">
                This is an estimate based on the values you enter.
              </small>
            </div>

            <div className="tool-card weather-tool">
              <div className="tool-icon"><CloudSun size={24} /></div>
              <h3>Weather Information</h3>
              <p>Weather information will help farmers plan their farming activities.</p>
              <div className="weather-preview">
                <Sun size={34} />
                <div>
                  <strong>Weather updates</strong>
                  <span>Open-Meteo integration planned</span>
                </div>
              </div>
              <small className="tool-note">
                Live location-based weather will be connected in the next development step.
              </small>
            </div>
          </div>
        </section>

        <section className="section about-section" id="about">
          <div className="about-content">
            <span className="section-tag">ABOUT AGRISENSE BD</span>
            <h2>Technology for Better Agriculture</h2>
            <p>
              AgriSense BD is a smart agriculture platform designed to
              provide farmers with crop information, plant disease
              estimation and useful farming management tools.
            </p>
            <div className="about-points">
              <span><CheckCircle2 size={18} /> AI-powered plant analysis</span>
              <span><CheckCircle2 size={18} /> Crop-focused information</span>
              <span><CheckCircle2 size={18} /> Practical farm calculators</span>
            </div>
          </div>
          <div className="about-visual">
            <img
              src="https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?w=900"
              alt="Agricultural green plants"
            />
          </div>
        </section>
      </main>

      <footer className="footer">
        <a href="#home" className="brand footer-brand">
          <span className="brand-icon"><Sprout size={23} /></span>
          <span>AgriSense<span className="brand-highlight">BD</span></span>
        </a>
        <p>Smart Agriculture. Better Decisions.</p>
        <small>© {new Date().getFullYear()} AgriSense BD. All rights reserved.</small>
      </footer>
    </div>
  );
}

export default App;
