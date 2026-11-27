
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Search,
  RefreshCw,
  MapPin,
  Package,
  ShoppingBasket,
  Leaf,
  AlertCircle,
  LoaderCircle,
  SlidersHorizontal
} from "lucide-react";

import "./Marketplace.css";

const API_URL = (import.meta.env.VITE_BACKEND_API_URL || "http://127.0.0.1:5000/api").replace(/\/$/, "");

const cropTranslations = {
  rice: "ধান",
  paddy: "ধান",
  "boro rice": "বোরো ধান",
  "aman rice": "আমন ধান",
  "aus rice": "আউশ ধান",
  wheat: "গম",
  tomato: "টমেটো",
  potato: "আলু",
  onion: "পেঁয়াজ",
  garlic: "রসুন",
  brinjal: "বেগুন",
  eggplant: "বেগুন",
  chili: "মরিচ",
  chilli: "মরিচ",
  maize: "ভুট্টা",
  corn: "ভুট্টা",
  mustard: "সরিষা",
  cucumber: "শসা",
  pumpkin: "মিষ্টি কুমড়া",
  "bitter gourd": "করলা",
  "bottle gourd": "লাউ",
  "snake gourd": "চিচিঙ্গা",
  cabbage: "বাঁধাকপি",
  cauliflower: "ফুলকপি",
  carrot: "গাজর",
  radish: "মূলা",
  spinach: "পালং শাক",
  "red amaranth": "লাল শাক",
  okra: "ঢেঁড়স",
  "lady finger": "ঢেঁড়স",
  papaya: "পেঁপে",
  banana: "কলা",
  mango: "আম",
  jackfruit: "কাঁঠাল",
  guava: "পেয়ারা",
  lentil: "মসুর ডাল",
  "red lentil": "মসুর ডাল",
  chickpea: "ছোলা",
  mung: "মুগ ডাল",
  "mung bean": "মুগ ডাল",
  "black gram": "মাষকলাই",
  groundnut: "চিনাবাদাম",
  peanut: "চিনাবাদাম",
  sugarcane: "আখ",
  jute: "পাট",
  cotton: "তুলা",
  sunflower: "সূর্যমুখী",
  watermelon: "তরমুজ",
  lemon: "লেবু",
  coriander: "ধনিয়া",
  ginger: "আদা",
  turmeric: "হলুদ",
  sweetpotato: "মিষ্টি আলু",
  "sweet potato": "মিষ্টি আলু"
};

function Marketplace() {
  const { i18n } = useTranslation();

  const isBangla = i18n.language?.startsWith("bn");

  const tx = (english, bangla) => {
    return isBangla ? bangla : english;
  };

  const translateCropName = (name) => {
    if (!name) {
      return tx("Unnamed Crop", "নামহীন ফসল");
    }

    if (!isBangla) {
      return name;
    }

    const normalized = String(name).trim().toLowerCase();

    return cropTranslations[normalized] || name;
  };

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");

  const fetchListings = async (
    searchValue = search,
    districtValue = district
  ) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (searchValue.trim()) {
        params.append("search", searchValue.trim());
      }

      if (districtValue.trim()) {
        params.append("district", districtValue.trim());
      }

      const query = params.toString();

      const response = await fetch(
        `${API_URL}/marketplace${query ? `?${query}` : ""}`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load marketplace listings."
        );
      }

      setListings(
        Array.isArray(result.listings) ? result.listings : []
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings("", "");
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchListings(search, district);
  };

  const handleReset = () => {
    setSearch("");
    setDistrict("");
    fetchListings("", "");
  };

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString(
      isBangla ? "bn-BD" : "en-BD"
    );
  };

  const formatQuantity = (quantity) => {
    return Number(quantity || 0).toLocaleString(
      isBangla ? "bn-BD" : "en-BD"
    );
  };

  return (
    <section className="marketplace-page" id="marketplace">
      <div className="marketplace-container">

        {/* HEADER */}
        <div className="marketplace-header">
          <div className="marketplace-heading-content">
            <span className="marketplace-eyebrow">
              <Leaf size={15} />
              AGRISENSE BD MARKETPLACE
            </span>

            <h2>
              {tx(
                "Farmer's Crop Marketplace",
                "কৃষকের ফসলের বাজার"
              )}
            </h2>

            <p>
              {tx(
                "Explore available agricultural products and discover crop prices from farmers.",
                "বিভিন্ন কৃষিপণ্য দেখুন এবং কৃষকদের কাছ থেকে ফসলের বাজারদর জানুন।"
              )}
            </p>
          </div>

          <div className="marketplace-count-card">
            <div className="marketplace-count-icon">
              <ShoppingBasket size={24} />
            </div>

            <div>
              <strong>{formatQuantity(listings.length)}</strong>
              <span>
                {tx("Available Listings", "উপলব্ধ পণ্য")}
              </span>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <form
          className="marketplace-search-form"
          onSubmit={handleSearch}
        >
          <div className="marketplace-input-group">
            <Search size={19} />

            <input
              type="text"
              placeholder={tx(
                "Search crop name...",
                "ফসলের নাম লিখুন..."
              )}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="marketplace-input-group">
            <MapPin size={19} />

            <input
              type="text"
              placeholder={tx(
                "Search district...",
                "জেলার নাম লিখুন..."
              )}
              value={district}
              onChange={(event) => setDistrict(event.target.value)}
            />
          </div>

          <button
            type="submit"
            className="marketplace-search-button"
            disabled={loading}
          >
            <Search size={17} />
            {tx("Search", "খুঁজুন")}
          </button>

          <button
            type="button"
            className="marketplace-reset-button"
            onClick={handleReset}
            disabled={loading}
          >
            <RefreshCw size={17} />
            {tx("Reset", "রিসেট")}
          </button>
        </form>

        {/* LISTING HEADING */}
        <div className="marketplace-listing-heading">
          <div>
            <span className="marketplace-section-label">
              <SlidersHorizontal size={15} />
              {tx("EXPLORE PRODUCTS", "পণ্য দেখুন")}
            </span>

            <h3>
              {tx("Available Crops", "উপলব্ধ ফসল")}
            </h3>
          </div>

          <button
            type="button"
            className="marketplace-refresh-button"
            onClick={() => fetchListings()}
            disabled={loading}
            title={tx("Refresh listings", "তালিকা রিফ্রেশ করুন")}
          >
            <RefreshCw
              size={17}
              className={loading ? "marketplace-spin" : ""}
            />
            {tx("Refresh", "রিফ্রেশ")}
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="marketplace-state">
            <LoaderCircle
              size={38}
              className="marketplace-spin"
            />

            <h3>
              {tx(
                "Loading marketplace...",
                "বাজারের তথ্য লোড হচ্ছে..."
              )}
            </h3>

            <p>
              {tx(
                "Please wait while we load available crop listings.",
                "উপলব্ধ ফসলের তালিকা লোড হওয়া পর্যন্ত অপেক্ষা করুন।"
              )}
            </p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="marketplace-state marketplace-error">
            <AlertCircle size={38} />

            <h3>
              {tx(
                "Unable to load marketplace",
                "বাজারের তথ্য লোড করা যাচ্ছে না"
              )}
            </h3>

            <p>{error}</p>

            <button
              type="button"
              onClick={() => fetchListings()}
              className="marketplace-search-button"
            >
              <RefreshCw size={17} />
              {tx("Try Again", "আবার চেষ্টা করুন")}
            </button>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && listings.length === 0 && (
          <div className="marketplace-state marketplace-empty">
            <div className="marketplace-empty-icon">
              <Package size={45} />
            </div>

            <h3>
              {tx(
                "No Crop Listings Available",
                "কোনো ফসলের তালিকা পাওয়া যায়নি"
              )}
            </h3>

            <p>
              {tx(
                "No active crop listings were found. Please check again later or try another search.",
                "কোনো সক্রিয় ফসলের তালিকা পাওয়া যায়নি। পরে আবার চেষ্টা করুন অথবা অন্য কিছু খুঁজুন।"
              )}
            </p>

            <button
              type="button"
              className="marketplace-search-button"
              onClick={handleReset}
            >
              <RefreshCw size={17} />
              {tx("Show All Listings", "সব পণ্য দেখুন")}
            </button>
          </div>
        )}

        {/* LISTINGS */}
        {!loading && !error && listings.length > 0 && (
          <div className="marketplace-grid">
            {listings.map((item) => {
              const translatedCropName = translateCropName(
                item.crop_name
              );

              return (
                <article
                  className="marketplace-card"
                  key={item.id}
                >
                  <div className="marketplace-image-wrapper">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={translatedCropName}
                        className="marketplace-crop-image"
                        loading="lazy"
                      />
                    ) : (
                      <div className="marketplace-image-placeholder">
                        <span>🌾</span>
                      </div>
                    )}

                    <span className="marketplace-available-badge">
                      {tx("Available", "উপলব্ধ")}
                    </span>
                  </div>

                  <div className="marketplace-card-body">
                    <h3>{translatedCropName}</h3>

                    <div className="marketplace-price">
                      <strong>
                        ৳{formatPrice(item.price_per_unit)}
                      </strong>

                      <span>
                        / {item.unit || "KG"}
                      </span>
                    </div>

                    <div className="marketplace-info-row">
                      <Package size={17} />

                      <span>
                        {tx(
                          "Available quantity:",
                          "উপলব্ধ পরিমাণ:"
                        )}{" "}
                        <strong>
                          {formatQuantity(
                            item.available_quantity ?? item.quantity ?? 0
                          )}{" "}
                          {item.unit || "KG"}
                        </strong>
                      </span>
                    </div>

                    <div className="marketplace-info-row">
                      <MapPin size={17} />

                      <span>
                        {[
                          item.upazila,
                          item.district
                        ].filter(Boolean).join(", ") ||
                          item.location ||
                          tx(
                            "Location not specified",
                            "ঠিকানা উল্লেখ করা হয়নি"
                          )}
                      </span>
                    </div>

                    {item.description && (
                      <p className="marketplace-description">
                        {item.description}
                      </p>
                    )}

                    <div className="marketplace-card-footer">
                      <span>
                        <Leaf size={15} />
                        AgriSense BD
                      </span>

                      <span className="marketplace-view-label">
                        {tx("Public Listing", "সর্বসাধারণের তালিকা")}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* GUEST INFORMATION */}
        <div className="marketplace-guest-note">
          <Leaf size={21} />

          <div>
            <strong>
              {tx(
                "Welcome to AgriSense BD Marketplace",
                "AgriSense BD বাজারে স্বাগতম"
              )}
            </strong>

            <p>
              {tx(
                "Visitors can explore crop listings and prices. Farmers can log in to manage their own crop listings from their dashboard.",
                "সকল দর্শনার্থী ফসলের তালিকা ও দাম দেখতে পারবেন। কৃষকরা লগইন করে ড্যাশবোর্ড থেকে নিজেদের ফসলের তালিকা পরিচালনা করতে পারবেন।"
              )}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Marketplace;
