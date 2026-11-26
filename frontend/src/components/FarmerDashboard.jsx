
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Sprout,
  LayoutDashboard,
  UserRound,
  Wheat,
  Plus,
  RefreshCw,
  LogOut,
  CalendarDays,
  LandPlot,
  TrendingUp,
  TrendingDown,
  Wallet,
  Trash2,
  AlertCircle,
  CheckCircle,
  LoaderCircle,
  X,
  ClipboardList,
  MessageSquareText,
  Pencil,
  Save,
} from "lucide-react";

import {
  getFarmerDashboard,
  getFarmerProfile,
  getAvailableCrops,
  getMyCrops,
  addFarmerCrop,
  deleteFarmerCrop,
  updateFarmerProfile,
} from "../services/farmerApi";

import FarmerDiseaseHistory from "./FarmerDiseaseHistory";
import FarmerExpertAdvice from "./FarmerExpertAdvice";

import "./FarmerDashboard.css";

const initialCropForm = {
  crop_id: "",
  land_area: "",
  land_unit: "ACRE",
  planting_date: "",
  notes: "",
};

const initialProfileForm = {
  full_name: "",
  phone: "",
  address: "",
  district: "",
  upazila: "",
};

function extractArray(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  if (Array.isArray(result?.crops)) return result.crops;
  return [];
}

function extractObject(result) {
  if (!result) return {};

  if (result.data && !Array.isArray(result.data)) {
    return result.data;
  }

  return result;
}

function formatMoney(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value) {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function FarmerDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");

  const [dashboard, setDashboard] = useState({});
  const [profile, setProfile] = useState({});
  const [availableCrops, setAvailableCrops] = useState([]);
  const [myCrops, setMyCrops] = useState([]);

  const [cropForm, setCropForm] = useState(initialCropForm);
  const [showCropForm, setShowCropForm] = useState(false);

  const [profileForm, setProfileForm] = useState(initialProfileForm);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savingCrop, setSavingCrop] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [deletingCropId, setDeletingCropId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const farmerName =
    profile.full_name ||
    profile.name ||
    user?.full_name ||
    "Farmer";

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const results = await Promise.allSettled([
        getFarmerDashboard(),
        getFarmerProfile(),
        getAvailableCrops(),
        getMyCrops(),
      ]);

      const [
        dashboardResult,
        profileResult,
        cropsResult,
        myCropsResult,
      ] = results;

      if (dashboardResult.status === "fulfilled") {
        setDashboard(extractObject(dashboardResult.value));
      }

      if (profileResult.status === "fulfilled") {
        const profileData = extractObject(profileResult.value);

        setProfile(profileData);

        setProfileForm({
          full_name: profileData.full_name || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          district: profileData.district || "",
          upazila: profileData.upazila || "",
        });
      }

      if (cropsResult.status === "fulfilled") {
        setAvailableCrops(extractArray(cropsResult.value));
      }

      if (myCropsResult.status === "fulfilled") {
        setMyCrops(extractArray(myCropsResult.value));
      }

      const rejected = results.find(
        (result) => result.status === "rejected"
      );

      if (rejected) {
        const status = rejected.reason?.response?.status;

        if (status === 401 || status === 403) {
          setError(
            "Your session may have expired. Please log in again."
          );
        } else {
          setError(
            rejected.reason?.response?.data?.message ||
              "Some dashboard information could not be loaded."
          );
        }
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load dashboard information."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const dashboardData = dashboard.data || dashboard;

  const cropCount =
    dashboardData.crop_count ??
    dashboardData.total_crops ??
    myCrops.length;

  const totalLand = useMemo(() => {
    if (dashboardData.total_land_area !== undefined) {
      return Number(dashboardData.total_land_area || 0);
    }

    return myCrops.reduce(
      (total, crop) => total + Number(crop.land_area || 0),
      0
    );
  }, [dashboardData.total_land_area, myCrops]);

  const totalCost = Number(
    dashboardData.total_farming_cost ??
      dashboardData.total_cost ??
      dashboardData.total_costs ??
      0
  );

  const totalRevenue = Number(
    dashboardData.total_farming_revenue ??
      dashboardData.total_revenue ??
      dashboardData.total_revenues ??
      0
  );

  const profitLoss = Number(
    dashboardData.profit_loss ?? totalRevenue - totalCost
  );

  const handleCropFormChange = (event) => {
    const { name, value } = event.target;

    setCropForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleProfileFormChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const startProfileEditing = () => {
    setProfileForm({
      full_name: profile.full_name || user?.full_name || "",
      phone: profile.phone || user?.phone || "",
      address: profile.address || "",
      district: profile.district || "",
      upazila: profile.upazila || "",
    });

    setError("");
    setSuccess("");
    setIsEditingProfile(true);
  };

  const cancelProfileEditing = () => {
    setProfileForm({
      full_name: profile.full_name || user?.full_name || "",
      phone: profile.phone || user?.phone || "",
      address: profile.address || "",
      district: profile.district || "",
      upazila: profile.upazila || "",
    });

    setIsEditingProfile(false);
    setError("");
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = profileForm.full_name.trim();
    const cleanPhone = profileForm.phone.trim();

    if (!cleanName || !cleanPhone) {
      setError("Full name and phone number are required.");
      return;
    }

    if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    const payload = {
      full_name: cleanName,
      phone: cleanPhone,
      address: profileForm.address.trim(),
      district: profileForm.district.trim(),
      upazila: profileForm.upazila.trim(),
    };

    setSavingProfile(true);

    try {
      const result = await updateFarmerProfile(payload);

      if (result?.success === false) {
        throw new Error(
          result.message || "Profile update failed."
        );
      }

      const updatedProfile = {
        ...profile,
        ...payload,
        role: profile.role || user?.role || "FARMER",
        id: profile.id || user?.id,
      };

      setProfile(updatedProfile);

      // Keep the saved login user information synchronized.
      try {
        const savedUser = JSON.parse(
          localStorage.getItem("agrisense_user") || "{}"
        );

        localStorage.setItem(
          "agrisense_user",
          JSON.stringify({
            ...savedUser,
            full_name: cleanName,
            phone: cleanPhone,
          })
        );
      } catch {
        // Profile update has already succeeded on the server.
      }

      setIsEditingProfile(false);
      setSuccess(
        result?.message || "Profile updated successfully."
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Failed to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddCrop = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!cropForm.crop_id || !cropForm.land_area) {
      setError("Please select a crop and enter the land area.");
      return;
    }

    if (Number(cropForm.land_area) <= 0) {
      setError("Land area must be greater than zero.");
      return;
    }

    setSavingCrop(true);

    try {
      const payload = {
        crop_id: Number(cropForm.crop_id),
        land_area: Number(cropForm.land_area),
        land_unit: cropForm.land_unit,
        planting_date: cropForm.planting_date || null,
        notes: cropForm.notes.trim() || null,
      };

      const result = await addFarmerCrop(payload);

      if (result.success === false) {
        throw new Error(result.message || "Could not add crop.");
      }

      setSuccess("Crop added successfully.");
      setCropForm(initialCropForm);
      setShowCropForm(false);

      await loadDashboard();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Failed to add crop."
      );
    } finally {
      setSavingCrop(false);
    }
  };

  const handleDeleteCrop = async (cropId) => {
    if (!window.confirm("Are you sure you want to delete this crop?")) {
      return;
    }

    setDeletingCropId(cropId);
    setError("");
    setSuccess("");

    try {
      const result = await deleteFarmerCrop(cropId);

      if (result.success === false) {
        throw new Error(result.message || "Could not delete crop.");
      }

      setSuccess("Crop deleted successfully.");
      await loadDashboard();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Failed to delete crop."
      );
    } finally {
      setDeletingCropId(null);
    }
  };

  const getCropName = (crop) =>
    crop.crop_name ||
    crop.name ||
    crop.crop ||
    crop.title ||
    "Crop";

  const getCropId = (crop) =>
    crop.id ?? crop.crop_id ?? crop.farmer_crop_id;

  const getCropStatus = (crop) =>
    crop.farming_status || crop.status || "PLANNED";

  const statusClass = (status) =>
    String(status).toLowerCase().replaceAll("_", "-");

  const pageTitle = {
    overview: "Dashboard Overview",
    crops: "My Crops",
    profile: "My Profile",
    "disease-history": "Disease Detection History",
    advice: "My Expert Advice",
  };

  return (
    <div className="farmer-dashboard">
      <aside className="farmer-sidebar">
        <div className="farmer-sidebar-brand">
          <div className="farmer-brand-icon">
            <Sprout size={27} />
          </div>

          <div>
            <h2>AgriSense BD</h2>
            <span>Farmer Portal</span>
          </div>
        </div>

        <div className="farmer-sidebar-label">
          MAIN MENU
        </div>

        <nav className="farmer-sidebar-nav">
          <button
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => setActiveTab("overview")}
          >
            <LayoutDashboard size={19} />
            Overview
          </button>

          <button
            className={activeTab === "crops" ? "active" : ""}
            onClick={() => setActiveTab("crops")}
          >
            <Wheat size={19} />
            My Crops
          </button>

          <button
            className={
              activeTab === "disease-history" ? "active" : ""
            }
            onClick={() => setActiveTab("disease-history")}
          >
            <ClipboardList size={19} />
            Disease History
          </button>

          <button
            className={activeTab === "advice" ? "active" : ""}
            onClick={() => setActiveTab("advice")}
          >
            <MessageSquareText size={19} />
            My Expert Advice
          </button>

          <button
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => {
              setActiveTab("profile");
              setIsEditingProfile(false);
            }}
          >
            <UserRound size={19} />
            My Profile
          </button>
        </nav>

        <div className="farmer-sidebar-bottom">
          <div className="farmer-sidebar-user">
            <div className="farmer-avatar">
              {farmerName.charAt(0).toUpperCase()}
            </div>

            <div className="farmer-user-details">
              <strong>{farmerName}</strong>
              <span>Farmer</span>
            </div>
          </div>

          <button
            className="farmer-logout-button"
            onClick={onLogout}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="farmer-main">
        <header className="farmer-topbar">
          <div>
            <span className="farmer-topbar-label">
              AGRISENSE BD / FARMER PORTAL
            </span>

            <h1>{pageTitle[activeTab]}</h1>
          </div>

          {activeTab !== "disease-history" &&
            activeTab !== "advice" && (
              <button
                className="farmer-refresh-button"
                onClick={loadDashboard}
                disabled={loading}
              >
                <RefreshCw size={17} />
                Refresh
              </button>
            )}
        </header>

        <div className="farmer-content">
          {error && (
            <div className="farmer-alert error">
              <AlertCircle size={19} />
              <span>{error}</span>

              <button
                onClick={() => setError("")}
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {success && (
            <div className="farmer-alert success">
              <CheckCircle size={19} />
              <span>{success}</span>

              <button
                onClick={() => setSuccess("")}
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {loading ? (
            <div className="farmer-loading">
              <LoaderCircle
                className="farmer-spinner"
                size={34}
              />
              <p>Loading your farming information...</p>
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <>
                  <section className="farmer-welcome-card">
                    <div>
                      <span>WELCOME TO YOUR FARM</span>
                      <h2>Hello, {farmerName}!</h2>
                      <p>
                        Manage your crops and keep track of your
                        farming activities from one place.
                      </p>
                    </div>

                    <div className="farmer-welcome-icon">
                      <Sprout size={70} />
                    </div>
                  </section>

                  <section className="farmer-stats-grid">
                    <article className="farmer-stat-card">
                      <div className="farmer-stat-icon green">
                        <Wheat size={23} />
                      </div>
                      <span>Total Crops</span>
                      <strong>{cropCount}</strong>
                      <small>Registered crops</small>
                    </article>

                    <article className="farmer-stat-card">
                      <div className="farmer-stat-icon blue">
                        <LandPlot size={23} />
                      </div>
                      <span>Total Land</span>
                      <strong>{totalLand.toFixed(2)}</strong>
                      <small>Combined land area</small>
                    </article>

                    <article className="farmer-stat-card">
                      <div className="farmer-stat-icon orange">
                        <Wallet size={23} />
                      </div>
                      <span>Total Farming Cost</span>
                      <strong>{formatMoney(totalCost)}</strong>
                      <small>Recorded expenses</small>
                    </article>

                    <article className="farmer-stat-card">
                      <div
                        className={`farmer-stat-icon ${
                          profitLoss >= 0 ? "green" : "red"
                        }`}
                      >
                        {profitLoss >= 0 ? (
                          <TrendingUp size={23} />
                        ) : (
                          <TrendingDown size={23} />
                        )}
                      </div>
                      <span>Profit / Loss</span>
                      <strong>{formatMoney(profitLoss)}</strong>
                      <small>
                        {profitLoss >= 0
                          ? "Current profit"
                          : "Current loss"}
                      </small>
                    </article>
                  </section>

                  <section className="farmer-section-card">
                    <div className="farmer-section-heading">
                      <div>
                        <h3>My Recent Crops</h3>
                        <p>Your registered farming activities</p>
                      </div>

                      <button
                        className="farmer-outline-button"
                        onClick={() => setActiveTab("crops")}
                      >
                        View All
                      </button>
                    </div>

                    {myCrops.length === 0 ? (
                      <div className="farmer-empty-state">
                        <Wheat size={38} />
                        <h4>No crops added yet</h4>
                        <p>
                          Add your first crop to start managing
                          your farming activities.
                        </p>

                        <button
                          className="farmer-primary-button"
                          onClick={() => {
                            setActiveTab("crops");
                            setShowCropForm(true);
                          }}
                        >
                          <Plus size={18} />
                          Add Your First Crop
                        </button>
                      </div>
                    ) : (
                      <div className="farmer-table-wrapper">
                        <table className="farmer-table">
                          <thead>
                            <tr>
                              <th>Crop</th>
                              <th>Land Area</th>
                              <th>Planting Date</th>
                              <th>Status</th>
                            </tr>
                          </thead>

                          <tbody>
                            {myCrops.slice(0, 5).map((crop, index) => {
                              const status = getCropStatus(crop);

                              return (
                                <tr key={getCropId(crop) ?? index}>
                                  <td>
                                    <strong>{getCropName(crop)}</strong>
                                  </td>

                                  <td>
                                    {crop.land_area ?? 0}{" "}
                                    {crop.land_unit || "ACRE"}
                                  </td>

                                  <td>
                                    {formatDate(crop.planting_date)}
                                  </td>

                                  <td>
                                    <span
                                      className={`farmer-status ${statusClass(
                                        status
                                      )}`}
                                    >
                                      {status.replaceAll("_", " ")}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
                </>
              )}

              {activeTab === "crops" && (
                <section className="farmer-section-card">
                  <div className="farmer-section-heading">
                    <div>
                      <h3>Manage My Crops</h3>
                      <p>Add and manage your selected crops.</p>
                    </div>

                    <button
                      className="farmer-primary-button"
                      onClick={() =>
                        setShowCropForm((previous) => !previous)
                      }
                    >
                      {showCropForm ? (
                        <X size={18} />
                      ) : (
                        <Plus size={18} />
                      )}
                      {showCropForm ? "Close Form" : "Add New Crop"}
                    </button>
                  </div>

                  {showCropForm && (
                    <form
                      className="farmer-crop-form"
                      onSubmit={handleAddCrop}
                    >
                      <h4>Add a Crop to Your Farm</h4>

                      <div className="farmer-form-grid">
                        <div className="farmer-field">
                          <label htmlFor="crop_id">
                            Select Crop *
                          </label>

                          <select
                            id="crop_id"
                            name="crop_id"
                            value={cropForm.crop_id}
                            onChange={handleCropFormChange}
                            required
                          >
                            <option value="">Choose a crop</option>

                            {availableCrops.map((crop, index) => (
                              <option
                                key={crop.id ?? crop.crop_id ?? index}
                                value={crop.id ?? crop.crop_id}
                              >
                                {getCropName(crop)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="farmer-field">
                          <label htmlFor="land_area">
                            Land Area *
                          </label>

                          <input
                            id="land_area"
                            name="land_area"
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="Enter land area"
                            value={cropForm.land_area}
                            onChange={handleCropFormChange}
                            required
                          />
                        </div>

                        <div className="farmer-field">
                          <label htmlFor="land_unit">
                            Land Unit
                          </label>

                          <select
                            id="land_unit"
                            name="land_unit"
                            value={cropForm.land_unit}
                            onChange={handleCropFormChange}
                          >
                            <option value="ACRE">Acre</option>
                            <option value="DECIMAL">Decimal</option>
                          </select>
                        </div>

                        <div className="farmer-field">
                          <label htmlFor="planting_date">
                            Planting Date
                          </label>

                          <input
                            id="planting_date"
                            name="planting_date"
                            type="date"
                            value={cropForm.planting_date}
                            onChange={handleCropFormChange}
                          />
                        </div>

                        <div className="farmer-field full">
                          <label htmlFor="notes">
                            Notes (Optional)
                          </label>

                          <textarea
                            id="notes"
                            name="notes"
                            rows="3"
                            placeholder="Write any farming notes..."
                            value={cropForm.notes}
                            onChange={handleCropFormChange}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="farmer-primary-button"
                        disabled={savingCrop}
                      >
                        {savingCrop ? (
                          <>
                            <LoaderCircle
                              className="farmer-spinner"
                              size={18}
                            />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Plus size={18} />
                            Save Crop
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {myCrops.length === 0 ? (
                    <div className="farmer-empty-state">
                      <Wheat size={38} />
                      <h4>No crops available</h4>
                      <p>Add a crop to see it listed here.</p>
                    </div>
                  ) : (
                    <div className="farmer-crop-list">
                      {myCrops.map((crop, index) => {
                        const cropId = getCropId(crop);
                        const status = getCropStatus(crop);

                        return (
                          <article
                            className="farmer-crop-item"
                            key={cropId ?? index}
                          >
                            <div className="farmer-crop-symbol">
                              <Sprout size={25} />
                            </div>

                            <div className="farmer-crop-info">
                              <h4>{getCropName(crop)}</h4>

                              <p>
                                <LandPlot size={15} />
                                {crop.land_area ?? 0}{" "}
                                {crop.land_unit || "ACRE"}
                              </p>

                              <p>
                                <CalendarDays size={15} />
                                {formatDate(crop.planting_date)}
                              </p>
                            </div>

                            <div className="farmer-crop-actions">
                              <span
                                className={`farmer-status ${statusClass(
                                  status
                                )}`}
                              >
                                {status.replaceAll("_", " ")}
                              </span>

                              <button
                                className="farmer-delete-button"
                                title="Delete crop"
                                disabled={
                                  deletingCropId === cropId ||
                                  cropId === undefined
                                }
                                onClick={() =>
                                  handleDeleteCrop(cropId)
                                }
                              >
                                {deletingCropId === cropId ? (
                                  <LoaderCircle
                                    className="farmer-spinner"
                                    size={18}
                                  />
                                ) : (
                                  <Trash2 size={18} />
                                )}
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {activeTab === "disease-history" && (
                <FarmerDiseaseHistory />
              )}

              {activeTab === "advice" && (
                <FarmerExpertAdvice />
              )}

              {activeTab === "profile" && (
                <section className="farmer-section-card">
                  <div className="farmer-section-heading">
                    <div>
                      <h3>My Profile</h3>
                      <p>
                        View and manage your farmer account information.
                      </p>
                    </div>

                    {!isEditingProfile && (
                      <button
                        type="button"
                        className="farmer-primary-button"
                        onClick={startProfileEditing}
                      >
                        <Pencil size={17} />
                        Edit Profile
                      </button>
                    )}
                  </div>

                  <div className="farmer-profile-card">
                    <div className="farmer-profile-avatar">
                      {farmerName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h3>{farmerName}</h3>
                      <span>FARMER ACCOUNT</span>
                    </div>
                  </div>

                  {isEditingProfile ? (
                    <form
                      className="farmer-crop-form farmer-profile-edit-form"
                      onSubmit={handleUpdateProfile}
                    >
                      <h4>Edit Your Personal Information</h4>

                      <div className="farmer-form-grid">
                        <div className="farmer-field">
                          <label htmlFor="profile_full_name">
                            Full Name *
                          </label>

                          <input
                            id="profile_full_name"
                            name="full_name"
                            type="text"
                            placeholder="Enter your full name"
                            value={profileForm.full_name}
                            onChange={handleProfileFormChange}
                            maxLength={100}
                            required
                          />
                        </div>

                        <div className="farmer-field">
                          <label htmlFor="profile_phone">
                            Phone Number *
                          </label>

                          <input
                            id="profile_phone"
                            name="phone"
                            type="tel"
                            placeholder="Enter your phone number"
                            value={profileForm.phone}
                            onChange={handleProfileFormChange}
                            maxLength={16}
                            required
                          />
                        </div>

                        <div className="farmer-field full">
                          <label htmlFor="profile_address">
                            Address
                          </label>

                          <textarea
                            id="profile_address"
                            name="address"
                            rows="3"
                            placeholder="Enter your full address"
                            value={profileForm.address}
                            onChange={handleProfileFormChange}
                            maxLength={500}
                          />
                        </div>

                        <div className="farmer-field">
                          <label htmlFor="profile_district">
                            District
                          </label>

                          <input
                            id="profile_district"
                            name="district"
                            type="text"
                            placeholder="Enter your district"
                            value={profileForm.district}
                            onChange={handleProfileFormChange}
                            maxLength={100}
                          />
                        </div>

                        <div className="farmer-field">
                          <label htmlFor="profile_upazila">
                            Upazila
                          </label>

                          <input
                            id="profile_upazila"
                            name="upazila"
                            type="text"
                            placeholder="Enter your upazila"
                            value={profileForm.upazila}
                            onChange={handleProfileFormChange}
                            maxLength={100}
                          />
                        </div>
                      </div>

                      <div className="farmer-profile-form-actions">
                        <button
                          type="submit"
                          className="farmer-primary-button"
                          disabled={savingProfile}
                        >
                          {savingProfile ? (
                            <>
                              <LoaderCircle
                                className="farmer-spinner"
                                size={18}
                              />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save size={18} />
                              Save Changes
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          className="farmer-outline-button"
                          onClick={cancelProfileEditing}
                          disabled={savingProfile}
                        >
                          <X size={17} />
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="farmer-profile-grid">
                        <div>
                          <span>Full Name</span>
                          <strong>
                            {profile.full_name ||
                              user?.full_name ||
                              "Not available"}
                          </strong>
                        </div>

                        <div>
                          <span>Phone Number</span>
                          <strong>
                            {profile.phone ||
                              user?.phone ||
                              "Not available"}
                          </strong>
                        </div>

                        <div>
                          <span>Address</span>
                          <strong>
                            {profile.address || "Not provided"}
                          </strong>
                        </div>

                        <div>
                          <span>District</span>
                          <strong>
                            {profile.district || "Not provided"}
                          </strong>
                        </div>

                        <div>
                          <span>Upazila</span>
                          <strong>
                            {profile.upazila || "Not provided"}
                          </strong>
                        </div>

                        <div>
                          <span>Account Role</span>
                          <strong>
                            {profile.role || user?.role || "FARMER"}
                          </strong>
                        </div>
                      </div>

                      <p className="farmer-profile-note">
                        Your profile information is managed securely
                        through your AgriSense BD account.
                      </p>
                    </>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default FarmerDashboard;
