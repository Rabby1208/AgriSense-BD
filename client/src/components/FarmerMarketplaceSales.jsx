
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useTranslation } from "react-i18next";

import {
  Store,
  Plus,
  Trash2,
  RefreshCw,
  LoaderCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";

import "./FarmerMarketplaceSales.css";

const API_URL = (import.meta.env.VITE_BACKEND_API_URL || "http://127.0.0.1:5000/api").replace(/\/$/, "");
const REFRESH_INTERVAL = 5000;

const listingInitial = {
  farmer_crop_id: "",
  quantity: "",
  unit: "KG",
  price_per_unit: "",
  location: "",
  description: "",
};

const saleInitial = {
  farmer_crop_id: "",
  quantity: "",
  unit: "KG",
  unit_price: "",
  sale_date: new Date().toISOString().slice(0, 10),
  buyer_name: "",
  notes: "",
};

const cropTranslations = {
  rice: "ধান",
  paddy: "ধান",
  potato: "আলু",
  tomato: "টমেটো",
  maize: "ভুট্টা",
  corn: "ভুট্টা",
  wheat: "গম",
  onion: "পেঁয়াজ",
  garlic: "রসুন",
  chilli: "মরিচ",
  chili: "মরিচ",
  brinjal: "বেগুন",
  eggplant: "বেগুন",
  cabbage: "বাঁধাকপি",
  cauliflower: "ফুলকপি",
  cucumber: "শসা",
  pumpkin: "মিষ্টি কুমড়া",
  papaya: "পেঁপে",
  mango: "আম",
  banana: "কলা",
  jackfruit: "কাঁঠাল",
  lentil: "মসুর ডাল",
  mustard: "সরিষা",
  soybean: "সয়াবিন",
  sugarcane: "আখ",
  watermelon: "তরমুজ",
  okra: "ঢেঁড়স",
  spinach: "পালং শাক",
  coriander: "ধনিয়া",
  ginger: "আদা",
  turmeric: "হলুদ",
};

const translations = {
  en: {
    eyebrow: "FARMER BUSINESS CENTER",
    title: "Marketplace & Sales",
    description:
      "Manage your crop listings, sales records and profit/loss.",
    lastUpdated: "Last updated",
    autoRefresh: "Auto refresh every 5 seconds",
    refresh: "Refresh",
    loading: "Loading marketplace and sales data...",
    myListings: "My Listings",
    mySales: "My Sales",
    profitLoss: "Profit & Loss",
    totalListings: "Total Listings",
    totalSalesRecords: "Sales Records",
    totalRevenue: "Total Sales Revenue",
    listingsTitle: "My Marketplace Listings",
    listingsDescription:
      "Only harvested crops can be listed in the marketplace.",
    createListing: "Create Listing",
    close: "Close",
    selectHarvestedCrop: "Select Harvested Crop",
    selectCrop: "Select crop",
    quantity: "Quantity",
    unit: "Unit",
    pricePerUnit: "Price per Unit (৳)",
    location: "Location",
    locationPlaceholder: "District / Upazila",
    descriptionLabel: "Description",
    publishListing: "Publish Listing",
    saving: "Saving...",
    available: "Available",
    status: "Status",
    action: "Action",
    active: "ACTIVE",
    inactive: "INACTIVE",
    noListings: "No Listings Yet",
    noListingsDescription:
      "Create a listing from one of your harvested crops.",
    harvestedRequired:
      "At least one crop in My Crops must have HARVESTED status.",
    deleteConfirm: "Do you want to remove this listing?",
    listingCreated: "Marketplace listing created successfully.",
    listingDeleted: "Listing removed successfully.",
    salesTitle: "My Sales Records",
    salesDescription: "Record and manage your crop sales.",
    recordSale: "Record Sale",
    selectYourCrop: "Select Your Crop",
    sellingPrice: "Selling Price per Unit (৳)",
    saleDate: "Sale Date",
    buyerName: "Buyer Name",
    notes: "Notes",
    saveSale: "Save Sale",
    saleSaved: "Sale recorded successfully.",
    noSales: "No Sales Records Yet",
    noSalesDescription:
      "Add your sales information using Record Sale.",
    crop: "Crop",
    total: "Total",
    buyer: "Buyer",
    profitTitle: "Profit & Loss Summary",
    profitDescription:
      "Recorded sales revenue minus recorded farming expenses.",
    totalExpenses: "Total Farming Expenses",
    profit: "Profit",
    loss: "Loss",
    cropRevenue: "Revenue",
    cropExpense: "Expense",
    noHarvestedCrops: "No harvested crops available.",
    noCrops: "No crops available.",
    directSale: "DIRECT",
    error: "Something went wrong.",
    tokenError: "Login token not found. Please log in again.",
    listingError: "Unable to create listing.",
    deleteError: "Unable to delete listing.",
    saleError: "Unable to record sale.",
    unavailable: "N/A",
    remove: "Remove",
    salesNote:
      "Figures are calculated from your saved sale and farming expense records.",
    profitNote:
      "Profit/Loss = Total sales revenue - Total farming costs.",
    unitKg: "KG",
    unitTon: "Ton",
    unitBag: "Bag",
    unitPiece: "Piece",
  },

  bn: {
    eyebrow: "কৃষক ব্যবসা ব্যবস্থাপনা",
    title: "কৃষি বাজার ও বিক্রয়",
    description:
      "ফসলের তালিকা, বিক্রির হিসাব এবং লাভ-ক্ষতি পরিচালনা করুন।",
    lastUpdated: "সর্বশেষ আপডেট",
    autoRefresh: "প্রতি ৫ সেকেন্ডে স্বয়ংক্রিয় আপডেট",
    refresh: "রিফ্রেশ",
    loading: "বাজার ও বিক্রির তথ্য লোড হচ্ছে...",
    myListings: "আমার ফসলের তালিকা",
    mySales: "আমার বিক্রয়",
    profitLoss: "লাভ ও ক্ষতি",
    totalListings: "মোট তালিকা",
    totalSalesRecords: "মোট বিক্রির হিসাব",
    totalRevenue: "মোট বিক্রির আয়",
    listingsTitle: "আমার মার্কেটপ্লেস তালিকা",
    listingsDescription:
      "শুধু সংগ্রহ করা ফসল মার্কেটপ্লেসে তালিকাভুক্ত করা যাবে।",
    createListing: "নতুন তালিকা তৈরি",
    close: "বন্ধ করুন",
    selectHarvestedCrop: "সংগ্রহ করা ফসল নির্বাচন করুন",
    selectCrop: "ফসল নির্বাচন করুন",
    quantity: "পরিমাণ",
    unit: "একক",
    pricePerUnit: "প্রতি এককের মূল্য (৳)",
    location: "অবস্থান",
    locationPlaceholder: "জেলা / উপজেলা",
    descriptionLabel: "বিবরণ",
    publishListing: "তালিকা প্রকাশ করুন",
    saving: "সংরক্ষণ হচ্ছে...",
    available: "অবশিষ্ট পরিমাণ",
    status: "অবস্থা",
    action: "কার্যক্রম",
    active: "সক্রিয়",
    inactive: "নিষ্ক্রিয়",
    noListings: "এখনো কোনো তালিকা নেই",
    noListingsDescription:
      "সংগ্রহ করা ফসল থেকে নতুন তালিকা তৈরি করে শুরু করুন।",
    harvestedRequired:
      "তালিকা তৈরি করতে My Crops-এ অন্তত একটি ফসলের অবস্থা HARVESTED হতে হবে।",
    deleteConfirm: "আপনি কি এই তালিকাটি সরাতে চান?",
    listingCreated: "মার্কেটপ্লেসের তালিকা সফলভাবে তৈরি হয়েছে।",
    listingDeleted: "তালিকাটি সফলভাবে সরানো হয়েছে।",
    salesTitle: "আমার বিক্রির হিসাব",
    salesDescription: "নিজের ফসল বিক্রির তথ্য সংরক্ষণ ও পরিচালনা করুন।",
    recordSale: "বিক্রির তথ্য যোগ করুন",
    selectYourCrop: "আপনার ফসল নির্বাচন করুন",
    sellingPrice: "প্রতি এককের বিক্রয়মূল্য (৳)",
    saleDate: "বিক্রির তারিখ",
    buyerName: "ক্রেতার নাম",
    notes: "মন্তব্য",
    saveSale: "বিক্রির তথ্য সংরক্ষণ",
    saleSaved: "বিক্রির তথ্য সফলভাবে সংরক্ষণ হয়েছে।",
    noSales: "এখনো কোনো বিক্রির তথ্য নেই",
    noSalesDescription:
      "বিক্রির তথ্য যোগ করতে Record Sale ব্যবহার করুন।",
    crop: "ফসল",
    total: "মোট",
    buyer: "ক্রেতা",
    profitTitle: "লাভ ও ক্ষতির হিসাব",
    profitDescription:
      "সংরক্ষিত বিক্রির আয় থেকে কৃষিকাজের খরচ বাদ দিয়ে হিসাব করা হয়েছে।",
    totalExpenses: "মোট কৃষি খরচ",
    profit: "লাভ",
    loss: "ক্ষতি",
    cropRevenue: "আয়",
    cropExpense: "খরচ",
    noHarvestedCrops: "কোনো সংগ্রহ করা ফসল পাওয়া যায়নি।",
    noCrops: "কোনো ফসল পাওয়া যায়নি।",
    directSale: "সরাসরি বিক্রয়",
    error: "একটি সমস্যা হয়েছে।",
    tokenError: "লগইন টোকেন পাওয়া যায়নি। আবার লগইন করুন।",
    listingError: "তালিকা তৈরি করা যায়নি।",
    deleteError: "তালিকা সরানো যায়নি।",
    saleError: "বিক্রির তথ্য সংরক্ষণ করা যায়নি।",
    unavailable: "পাওয়া যায়নি",
    remove: "সরান",
    salesNote:
      "এই হিসাব সংরক্ষিত বিক্রয় এবং কৃষি খরচের তথ্যের ওপর নির্ভর করে।",
    profitNote:
      "লাভ/ক্ষতি = মোট বিক্রির আয় - মোট কৃষি খরচ।",
    unitKg: "কেজি",
    unitTon: "টন",
    unitBag: "বস্তা",
    unitPiece: "টি",
  },
};

// ======================================
// RESPONSE HELPERS
// ======================================

function getArray(response) {
  if (Array.isArray(response)) return response;

  const candidates = [
    response?.listings,
    response?.orders,
    response?.sales,
    response?.crops,
    response?.data?.listings,
    response?.data?.orders,
    response?.data?.sales,
    response?.data?.crops,
    response?.data,
  ];

  return candidates.find(Array.isArray) || [];
}
function getObject(response) {
  if (
    response?.data &&
    !Array.isArray(response.data) &&
    typeof response.data === "object"
  ) {
    return response.data;
  }

  return response || {};
}

function cropName(crop, isBn) {
  const name =
    crop?.crop_name ||
    crop?.name ||
    crop?.crop?.crop_name ||
    crop?.crop?.name ||
    "";

  if (!name) return isBn ? "ফসল" : "Crop";

  const normalized = String(name).trim().toLowerCase();

  return isBn
    ? cropTranslations[normalized] || name
    : name;
}

function cropId(crop) {
  return (
    crop?.farmer_crop_id ||
    crop?.crop_record_id ||
    crop?.id
  );
}

function isHarvested(crop) {
  return (
    String(
      crop?.farming_status ||
      crop?.status ||
      crop?.crop_status ||
      ""
    ).toUpperCase() === "HARVESTED"
  );
}

function getProfitRows(profitData) {
  return (
    profitData?.crops ||
    profitData?.profit_loss ||
    profitData?.results ||
    profitData?.rows ||
    []
  );
}

function getRowRevenue(row) {
  return Number(
    row?.total_sales ??
    row?.total_revenue ??
    row?.revenue ??
    row?.total_amount ??
    0
  );
}

function getRowExpense(row) {
  return Number(
    row?.total_cost ??
    row?.total_expenses ??
    row?.expense ??
    row?.total_expense ??
    row?.farming_expense ??
    0
  );
}

function getRowProfit(row) {
  return Number(
    row?.profit_loss ??
    row?.profit ??
    (getRowRevenue(row) - getRowExpense(row))
  );
}

function getId(item) {
  return item?.id || item?.listing_id;
}

// ======================================
// COMPONENT
// ======================================

function FarmerMarketplaceSales({ myCrops = [] }) {
  const { i18n } = useTranslation();

  const isBn = i18n.language?.startsWith("bn");
  const t = translations[isBn ? "bn" : "en"];

  const [activeSection, setActiveSection] = useState("listings");

  const [listings, setListings] = useState([]);
  const [sales, setSales] = useState([]);
  const [profitData, setProfitData] = useState({});
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const [listingForm, setListingForm] = useState(listingInitial);
  const [saleForm, setSaleForm] = useState(saleInitial);

  const [showListingForm, setShowListingForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const requestInProgress = useRef(false);

  const harvestedCrops = useMemo(
    () => myCrops.filter(isHarvested),
    [myCrops]
  );

  const formatMoney = useCallback(
    (value) => {
      return `৳${Number(value || 0).toLocaleString(
        isBn ? "bn-BD" : "en-BD",
        {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }
      )}`;
    },
    [isBn]
  );

  const formatNumber = useCallback(
    (value) => {
      return Number(value || 0).toLocaleString(
        isBn ? "bn-BD" : "en-BD",
        {
          maximumFractionDigits: 2,
        }
      );
    },
    [isBn]
  );

  const formatDate = useCallback(
    (value) => {
      if (!value) return t.unavailable;

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return String(value).slice(0, 10);
      }

      return date.toLocaleDateString(
        isBn ? "bn-BD" : "en-GB"
      );
    },
    [isBn, t.unavailable]
  );

  const getUnit = useCallback(
    (unit) => {
      if (!isBn) {
        const units = {
          KG: "KG",
          TON: "Ton",
          BAG: "Bag",
          PIECE: "Piece",
        };

        return units[unit] || unit || "KG";
      }

      const units = {
        KG: t.unitKg,
        TON: t.unitTon,
        BAG: t.unitBag,
        PIECE: t.unitPiece,
      };

      return units[unit] || unit || t.unitKg;
    },
    [isBn, t]
  );

  // ======================================
  // API REQUEST
  // ======================================

  const request = useCallback(async (path, options = {}) => {
    const token = localStorage.getItem("agrisense_token");

    if (!token) {
      const currentTranslations =
        translations[
          i18n.language?.startsWith("bn") ? "bn" : "en"
        ];

      throw new Error(currentTranslations.tokenError);
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        result.message ||
        result.error ||
        `Request failed (${response.status})`
      );
    }

    return result;
  }, [i18n.language]);

  // ======================================
  // LOAD DATA
  // ======================================

  const loadData = useCallback(async (showLoader = false) => {
    if (requestInProgress.current) return;

    requestInProgress.current = true;

    if (showLoader) {
      setLoading(true);
    }

    try {
      const results = await Promise.allSettled([
        request("/marketplace/my-listings"),
        request("/crop-sales"),
        request("/crop-sales/profit-loss"),
        request("/orders/farmer-orders"),
      ]);

      const errors = [];

      if (results[0].status === "fulfilled") {
        setListings(getArray(results[0].value));
      } else {
        errors.push(
          `Listings: ${results[0].reason?.message || "Failed"}`
        );
        console.error("Listings Error:", results[0].reason);
      }

      if (results[1].status === "fulfilled") {
        setSales(getArray(results[1].value));
      } else {
        errors.push(
          `Sales: ${results[1].reason?.message || "Failed"}`
        );
        console.error("Sales Error:", results[1].reason);
      }

      if (results[2].status === "fulfilled") {
        setProfitData(getObject(results[2].value));
      } else {
        errors.push(
          `Profit & Loss: ${results[2].reason?.message || "Failed"}`
        );
        console.error("Profit Loss Error:", results[2].reason);
      }

      if (results[3].status === "fulfilled") {
        setIncomingOrders(getArray(results[3].value));
      } else {
        errors.push(
          `Orders: ${results[3].reason?.message || "Failed"}`
        );
        console.error("Farmer Orders Error:", results[3].reason);
      }

      setError(errors.join(" | "));
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || t.error);
    } finally {
      requestInProgress.current = false;
      setLoading(false);
    }
  }, [request, t.error]);

  // ======================================
  // ======================================
  // UPDATE MARKETPLACE ORDER STATUS
  // ======================================

  const updateOrderStatus = async (orderId, status) => {
    if (!orderId || updatingOrderId !== null) return;

    setUpdatingOrderId(orderId);
    setError("");
    setSuccess("");

    try {
      await request(`/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setSuccess(
        isBn
          ? "অর্ডারের অবস্থা সফলভাবে আপডেট হয়েছে।"
          : "Order status updated successfully."
      );

      await loadData(true);
    } catch (err) {
      setError(
        err.message ||
        (isBn ? "অর্ডার আপডেট করা যায়নি।" : "Unable to update order.")
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // AUTO REFRESH
  // ======================================

  useEffect(() => {
    loadData(true);

    const intervalId = setInterval(() => {
      loadData(false);
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [loadData]);

  // ======================================
  // FORM HANDLERS
  // ======================================

  const handleListingChange = (event) => {
    const { name, value } = event.target;

    setListingForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSaleChange = (event) => {
    const { name, value } = event.target;

    setSaleForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ======================================
  // CREATE LISTING
  // ======================================

  const submitListing = async (event) => {
    event.preventDefault();

    if (!listingForm.farmer_crop_id) {
      setError(t.selectHarvestedCrop);
      return;
    }

    if (
      Number(listingForm.quantity) <= 0 ||
      Number(listingForm.price_per_unit) <= 0
    ) {
      setError(t.error);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await request("/marketplace", {
        method: "POST",
        body: JSON.stringify({
          ...listingForm,
          farmer_crop_id: Number(listingForm.farmer_crop_id),
          quantity: Number(listingForm.quantity),
          price_per_unit: Number(listingForm.price_per_unit),
        }),
      });

      setListingForm(listingInitial);
      setShowListingForm(false);
      setSuccess(t.listingCreated);

      await loadData();
    } catch (err) {
      setError(err.message || t.listingError);
    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // DELETE LISTING
  // ======================================

  const deleteListing = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;

    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      await request(`/marketplace/${id}`, {
        method: "DELETE",
      });

      setSuccess(t.listingDeleted);
      await loadData();
    } catch (err) {
      setError(err.message || t.deleteError);
    } finally {
      setDeletingId(null);
    }
  };

  // ======================================
  // RECORD DIRECT SALE
  // ======================================

  const submitSale = async (event) => {
    event.preventDefault();

    if (!saleForm.farmer_crop_id) {
      setError(t.selectYourCrop);
      return;
    }

    if (
      Number(saleForm.quantity) <= 0 ||
      Number(saleForm.unit_price) <= 0
    ) {
      setError(t.error);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await request("/crop-sales", {
        method: "POST",
        body: JSON.stringify({
          ...saleForm,
          farmer_crop_id: Number(saleForm.farmer_crop_id),
          quantity: Number(saleForm.quantity),
          unit_price: Number(saleForm.unit_price),
        }),
      });

      setSaleForm(saleInitial);
      setShowSaleForm(false);
      setSuccess(t.saleSaved);

      await loadData();
    } catch (err) {
      setError(err.message || t.saleError);
    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // PROFIT & LOSS
  // ======================================

  const profitRows = useMemo(
    () => getProfitRows(profitData),
    [profitData]
  );

  const apiSummary = profitData?.summary || {};

  const rowRevenueTotal = useMemo(
    () => profitRows.reduce(
      (sum, row) => sum + getRowRevenue(row),
      0
    ),
    [profitRows]
  );

  const rowExpenseTotal = useMemo(
    () => profitRows.reduce(
      (sum, row) => sum + getRowExpense(row),
      0
    ),
    [profitRows]
  );

  const totalRevenue = Number(
    apiSummary.totalSales ?? rowRevenueTotal
  );

  const totalExpense = Number(
    apiSummary.totalCost ?? rowExpenseTotal
  );

  const totalProfit = Number(
    apiSummary.netProfitLoss ??
    (totalRevenue - totalExpense)
  );

  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <div className="fms-loading">
        <LoaderCircle className="fms-spin" size={30} />
        <p>{t.loading}</p>
      </div>
    );
  }

  // ======================================
  // MAIN UI
  // ======================================

  return (
    <section className="fms-page">

      {/* HEADER */}

      <div className="fms-heading">
        <div>
          <span className="fms-eyebrow">
            {t.eyebrow}
          </span>

          <h2>{t.title}</h2>

          <p>{t.description}</p>

          {lastUpdated && (
            <small>
              {t.lastUpdated}:{" "}
              {lastUpdated.toLocaleTimeString(
                isBn ? "bn-BD" : "en-BD"
              )}
              {" · "}
              {t.autoRefresh}
            </small>
          )}
        </div>

        <button
          className="fms-refresh"
          type="button"
          onClick={() => loadData(true)}
        >
          <RefreshCw size={17} />
          {t.refresh}
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="fms-alert fms-error">
          <AlertCircle size={18} />
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Close error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="fms-alert fms-success">
          <CheckCircle size={18} />
          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Close success"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}

      <div className="fms-order-summary">

        <div className="fms-order-summary-card">
          <Store size={22} />
          <span>{t.totalListings}</span>
          <strong>{formatNumber(listings.length)}</strong>
        </div>

        <div className="fms-order-summary-card">
          <ShoppingBag size={22} />
          <span>{t.totalSalesRecords}</span>
          <strong>{formatNumber(sales.length)}</strong>
        </div>

        <div className="fms-order-summary-card">
          <Wallet size={22} />
          <span>{t.totalRevenue}</span>
          <strong>{formatMoney(totalRevenue)}</strong>
        </div>

      </div>

      {/* TABS */}

      <div className="fms-tabs">

        <button
          type="button"
          className={activeSection === "listings" ? "selected" : ""}
          onClick={() => setActiveSection("listings")}
        >
          <Store size={17} />
          {t.myListings}
        </button>

        <button
          type="button"
          className={activeSection === "sales" ? "selected" : ""}
          onClick={() => setActiveSection("sales")}
        >
          <ShoppingBag size={17} />
          {t.mySales}
        </button>

        <button
          type="button"
          className={activeSection === "profit" ? "selected" : ""}
          onClick={() => setActiveSection("profit")}
        >
          <Wallet size={17} />
          {t.profitLoss}
        </button>

      </div>

      {/* MY LISTINGS */}

      {activeSection === "listings" && (
        <div className="fms-panel">

          <div className="fms-panel-heading">
            <div>
              <h3>{t.listingsTitle}</h3>
              <p>{t.listingsDescription}</p>
            </div>

            <button
              type="button"
              className="fms-primary"
              onClick={() =>
                setShowListingForm((value) => !value)
              }
            >
              <Plus size={17} />
              {showListingForm ? t.close : t.createListing}
            </button>
          </div>

          {showListingForm && (
            <form
              className="fms-form"
              onSubmit={submitListing}
            >

              <label>
                {t.selectHarvestedCrop} *
                <select
                  name="farmer_crop_id"
                  value={listingForm.farmer_crop_id}
                  onChange={handleListingChange}
                  required
                >
                  <option value="">{t.selectCrop}</option>

                  {harvestedCrops.map((crop) => (
                    <option
                      key={cropId(crop)}
                      value={cropId(crop)}
                    >
                      {cropName(crop, isBn)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                {t.quantity} *
                <input
                  name="quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={listingForm.quantity}
                  onChange={handleListingChange}
                  required
                />
              </label>

              <label>
                {t.unit}
                <select
                  name="unit"
                  value={listingForm.unit}
                  onChange={handleListingChange}
                >
                  <option value="KG">{getUnit("KG")}</option>
                  <option value="TON">{getUnit("TON")}</option>
                  <option value="BAG">{getUnit("BAG")}</option>
                  <option value="PIECE">{getUnit("PIECE")}</option>
                </select>
              </label>

              <label>
                {t.pricePerUnit} *
                <input
                  name="price_per_unit"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={listingForm.price_per_unit}
                  onChange={handleListingChange}
                  required
                />
              </label>

              <label>
                {t.location}
                <input
                  name="location"
                  value={listingForm.location}
                  onChange={handleListingChange}
                  placeholder={t.locationPlaceholder}
                />
              </label>

              <label className="fms-full">
                {t.descriptionLabel}
                <textarea
                  name="description"
                  rows="3"
                  value={listingForm.description}
                  onChange={handleListingChange}
                />
              </label>

              <button
                className="fms-primary fms-full"
                type="submit"
                disabled={saving || harvestedCrops.length === 0}
              >
                {saving ? t.saving : t.publishListing}
              </button>

            </form>
          )}

          {harvestedCrops.length === 0 && (
            <p className="fms-note">
              {t.harvestedRequired}
            </p>
          )}

          {listings.length === 0 ? (
            <div className="fms-empty">
              <Store size={35} />
              <h3>{t.noListings}</h3>
              <p>{t.noListingsDescription}</p>
            </div>
          ) : (
            <div className="fms-table-wrap">
              <table className="fms-table">
                <thead>
                  <tr>
                    <th>{t.crop}</th>
                    <th>{t.quantity}</th>
                    <th>{t.available}</th>
                    <th>{t.pricePerUnit}</th>
                    <th>{t.status}</th>
                    <th>{t.action}</th>
                  </tr>
                </thead>

                <tbody>
                  {listings.map((item, index) => {
                    const id = getId(item);

                    return (
                      <tr key={id || index}>
                        <td>{cropName(item, isBn)}</td>

                        <td>
                          {formatNumber(item.quantity)}{" "}
                          {getUnit(item.unit)}
                        </td>

                        <td>
                          {formatNumber(
                            item.available_quantity ??
                            item.quantity
                          )}{" "}
                          {getUnit(item.unit)}
                        </td>

                        <td>
                          {formatMoney(item.price_per_unit)}
                        </td>

                        <td>
                          {item.status === "ACTIVE"
                            ? t.active
                            : item.status === "INACTIVE"
                              ? t.inactive
                              : item.status || t.unavailable}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="fms-delete"
                            title={t.remove}
                            disabled={
                              !id ||
                              deletingId === id ||
                              item.status === "INACTIVE"
                            }
                            onClick={() => deleteListing(id)}
                          >
                            {deletingId === id
                              ? <LoaderCircle size={16} className="fms-spin" />
                              : <Trash2 size={16} />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* MY SALES */}

      {activeSection === "sales" && (
        <div className="fms-panel">

          <div className="fms-panel-heading">
            <div>
              <h3>{t.salesTitle}</h3>
              <p>{t.salesDescription}</p>
            </div>

            <button
              type="button"
              className="fms-primary"
              onClick={() =>
                setShowSaleForm((value) => !value)
              }
            >
              <Plus size={17} />
              {showSaleForm ? t.close : t.recordSale}
            </button>
          </div>

          {/* INCOMING MARKETPLACE ORDERS */}

          <div className="fms-panel-heading" style={{ marginTop: "24px" }}>
            <div>
              <h3>
                {isBn ? "ক্রেতার অর্ডার" : "Incoming Marketplace Orders"}
              </h3>
              <p>
                {isBn
                  ? "আপনার তালিকাভুক্ত ফসলের জন্য ক্রেতাদের অর্ডার।"
                  : "Orders placed by buyers for your listed crops."}
              </p>
            </div>

            <strong>{formatNumber(incomingOrders.length)}</strong>
          </div>

          {incomingOrders.length === 0 ? (
            <div className="fms-empty">
              <ShoppingBag size={30} />
              <h3>
                {isBn ? "এখনো কোনো অর্ডার নেই" : "No Incoming Orders"}
              </h3>
              <p>
                {isBn
                  ? "ক্রেতারা অর্ডার করলে এখানে দেখা যাবে।"
                  : "New buyer orders will appear here."}
              </p>
            </div>
          ) : (
            <div className="fms-table-wrap">
              <table className="fms-table">
                <thead>
                  <tr>
                    <th>{isBn ? "অর্ডার" : "Order ID"}</th>
                    <th>{t.crop}</th>
                    <th>{t.buyer}</th>
                    <th>{isBn ? "ফোন" : "Phone"}</th>
                    <th>{t.quantity}</th>
                    <th>{t.total}</th>
                    <th>{isBn ? "ডেলিভারি ঠিকানা" : "Delivery Address"}</th>
                    <th>{isBn ? "মন্তব্য" : "Buyer Note"}</th>
                    <th>{t.orderDate}</th>
                    <th>{t.status}</th>
                    <th>{t.action}</th>
                  </tr>
                </thead>

                <tbody>
                  {incomingOrders.map((order) => {
                    const status = String(
                      order.status || "PENDING"
                    ).toUpperCase();

                    const busy = updatingOrderId === order.id;

                    return (
                      <tr key={order.id}>
                        <td>#{order.id}</td>

                        <td>
                          {order.crop_name ||
                            order.crop?.crop_name ||
                            "—"}
                        </td>

                        <td>{order.buyer_name || "—"}</td>

                        <td>{order.buyer_phone || "—"}</td>

                        <td>
                          {formatNumber(order.quantity)}{" "}
                          {getUnit(order.unit)}
                        </td>

                        <td>{formatMoney(order.total_amount)}</td>

                        <td>{order.delivery_address || "—"}</td>

                        <td>{order.buyer_note || "—"}</td>

                        <td>{formatDate(order.created_at)}</td>

                        <td>
                          {status === "PENDING"
                            ? (isBn ? "অপেক্ষমাণ" : "PENDING")
                            : status === "ACCEPTED"
                              ? (isBn ? "গৃহীত" : "ACCEPTED")
                              : status === "REJECTED"
                                ? (isBn ? "বাতিল" : "REJECTED")
                                : status === "COMPLETED"
                                  ? (isBn ? "সম্পন্ন" : "COMPLETED")
                                  : status}
                        </td>

                        <td>
                          {status === "PENDING" && (
                            <div
                              style={{
                                display: "flex",
                                gap: "6px",
                                flexWrap: "wrap",
                              }}
                            >
                              <button
                                type="button"
                                className="fms-primary"
                                disabled={updatingOrderId !== null}
                                onClick={() =>
                                  updateOrderStatus(order.id, "ACCEPTED")
                                }
                              >
                                {busy ? (
                                  <LoaderCircle
                                    size={15}
                                    className="fms-spin"
                                  />
                                ) : (
                                  isBn ? "গ্রহণ" : "Accept"
                                )}
                              </button>

                              <button
                                type="button"
                                className="fms-delete"
                                disabled={updatingOrderId !== null}
                                onClick={() =>
                                  updateOrderStatus(order.id, "REJECTED")
                                }
                              >
                                {isBn ? "বাতিল" : "Reject"}
                              </button>
                            </div>
                          )}

                          {status === "ACCEPTED" && (
                            <button
                              type="button"
                              className="fms-primary"
                              disabled={updatingOrderId !== null}
                              onClick={() =>
                                updateOrderStatus(order.id, "COMPLETED")
                              }
                            >
                              {busy ? (
                                <LoaderCircle
                                  size={15}
                                  className="fms-spin"
                                />
                              ) : (
                                isBn ? "সম্পন্ন করুন" : "Complete"
                              )}
                            </button>
                          )}

                          {(status === "REJECTED" ||
                            status === "COMPLETED") && "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {showSaleForm && (
            <form
              className="fms-form"
              onSubmit={submitSale}
            >

              <label>
                {t.selectYourCrop} *
                <select
                  name="farmer_crop_id"
                  value={saleForm.farmer_crop_id}
                  onChange={handleSaleChange}
                  required
                >
                  <option value="">{t.selectCrop}</option>

                  {myCrops.map((crop) => (
                    <option
                      key={cropId(crop)}
                      value={cropId(crop)}
                    >
                      {cropName(crop, isBn)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                {t.quantity} *
                <input
                  name="quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={saleForm.quantity}
                  onChange={handleSaleChange}
                  required
                />
              </label>

              <label>
                {t.unit}
                <select
                  name="unit"
                  value={saleForm.unit}
                  onChange={handleSaleChange}
                >
                  <option value="KG">{getUnit("KG")}</option>
                  <option value="TON">{getUnit("TON")}</option>
                  <option value="BAG">{getUnit("BAG")}</option>
                  <option value="PIECE">{getUnit("PIECE")}</option>
                </select>
              </label>

              <label>
                {t.sellingPrice} *
                <input
                  name="unit_price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={saleForm.unit_price}
                  onChange={handleSaleChange}
                  required
                />
              </label>

              <label>
                {t.saleDate} *
                <input
                  name="sale_date"
                  type="date"
                  value={saleForm.sale_date}
                  onChange={handleSaleChange}
                  required
                />
              </label>

              <label>
                {t.buyerName}
                <input
                  name="buyer_name"
                  value={saleForm.buyer_name}
                  onChange={handleSaleChange}
                />
              </label>

              <label className="fms-full">
                {t.notes}
                <textarea
                  name="notes"
                  rows="2"
                  value={saleForm.notes}
                  onChange={handleSaleChange}
                />
              </label>

              <button
                className="fms-primary fms-full"
                type="submit"
                disabled={saving || myCrops.length === 0}
              >
                {saving ? t.saving : t.saveSale}
              </button>

            </form>
          )}

          {sales.length === 0 ? (
            <div className="fms-empty">
              <ShoppingBag size={35} />
              <h3>{t.noSales}</h3>
              <p>{t.noSalesDescription}</p>
            </div>
          ) : (
            <div className="fms-table-wrap">
              <table className="fms-table">
                <thead>
                  <tr>
                    <th>{t.crop}</th>
                    <th>{t.quantity}</th>
                    <th>{t.pricePerUnit}</th>
                    <th>{t.total}</th>
                    <th>{t.saleDate}</th>
                    <th>{t.buyer}</th>
                  </tr>
                </thead>

                <tbody>
                  {sales.map((sale, index) => (
                    <tr key={sale.id || index}>
                      <td>{cropName(sale, isBn)}</td>

                      <td>
                        {formatNumber(sale.quantity)}{" "}
                        {getUnit(sale.unit)}
                      </td>

                      <td>
                        {formatMoney(sale.unit_price)}
                      </td>

                      <td>
                        {formatMoney(sale.total_amount)}
                      </td>

                      <td>
                        {formatDate(sale.sale_date)}
                      </td>

                      <td>
                        {sale.buyer_name || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* PROFIT & LOSS */}

      {activeSection === "profit" && (
        <div className="fms-panel">

          <div className="fms-panel-heading">
            <div>
              <h3>{t.profitTitle}</h3>
              <p>{t.profitDescription}</p>
            </div>
          </div>

          <div className="fms-summary">

            <div className="fms-summary-card">
              <ShoppingBag size={22} />
              <span>{t.totalRevenue}</span>
              <strong>{formatMoney(totalRevenue)}</strong>
            </div>

            <div className="fms-summary-card">
              <Wallet size={22} />
              <span>{t.totalExpenses}</span>
              <strong>{formatMoney(totalExpense)}</strong>
            </div>

            <div className="fms-summary-card">
              {totalProfit >= 0
                ? <TrendingUp size={22} />
                : <TrendingDown size={22} />}

              <span>
                {totalProfit >= 0 ? t.profit : t.loss}
              </span>

              <strong
                className={
                  totalProfit >= 0
                    ? "fms-positive"
                    : "fms-negative"
                }
              >
                {formatMoney(totalProfit)}
              </strong>
            </div>

          </div>

          {profitRows.length > 0 && (
            <div className="fms-table-wrap">
              <table className="fms-table">
                <thead>
                  <tr>
                    <th>{t.crop}</th>
                    <th>{t.cropRevenue}</th>
                    <th>{t.cropExpense}</th>
                    <th>{t.profitLoss}</th>
                  </tr>
                </thead>

                <tbody>
                  {profitRows.map((row, index) => {
                    const revenue = getRowRevenue(row);
                    const expense = getRowExpense(row);
                    const profit = getRowProfit(row);

                    return (
                      <tr
                        key={
                          row.farmer_crop_id ||
                          row.id ||
                          index
                        }
                      >
                        <td>{cropName(row, isBn)}</td>

                        <td>{formatMoney(revenue)}</td>

                        <td>{formatMoney(expense)}</td>

                        <td
                          className={
                            profit >= 0
                              ? "fms-positive"
                              : "fms-negative"
                          }
                        >
                          {formatMoney(profit)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <p className="fms-note">
            {t.salesNote} {t.profitNote}
          </p>

        </div>
      )}

    </section>
  );
}

export default FarmerMarketplaceSales;
