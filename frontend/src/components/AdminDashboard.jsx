import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  GraduationCap,
  Sprout,
  UserRound,
  RefreshCw,
  LogOut,
  Plus,
  X,
  Phone,
  Lock,
  CheckCircle,
  AlertCircle,
  LoaderCircle,
  UserPlus,
  Activity,
  Microscope,
  Search,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Bug,
  CalendarDays,
  ClipboardList,
} from "lucide-react";

import {
  getAdminProfile,
  getAdminDashboard,
  getAdminExperts,
  createAgriExpert,
  getAdminDiseaseDetectionStats,
  getAdminDiseaseDetectionHistory,
} from "../services/adminApi";

import "./AdminDashboard.css";

const initialExpertForm = {
  full_name: "",
  phone: "",
  password: "",
};

const PAGE_SIZE = 10;

function unwrapObject(result) {
  if (!result) return {};
  if (result.data && !Array.isArray(result.data)) return result.data;
  return result;
}

function unwrapArray(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  if (Array.isArray(result?.records)) return result.records;
  if (Array.isArray(result?.history)) return result.history;
  if (Array.isArray(result?.data?.records)) return result.data.records;
  if (Array.isArray(result?.data?.history)) return result.data.history;
  return [];
}

function getPayload(result) {
  let value = result || {};
  if (value.data && !Array.isArray(value.data)) value = value.data;
  if (value.data && !Array.isArray(value.data)) value = value.data;
  return value || {};
}

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

function formatPercent(value) {
  if (value === null || value === undefined || value === "") return "—";
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return `${(number <= 1 ? number * 100 : number).toFixed(1)}%`;
}

function getDetectionStatus(record) {
  const status = String(record?.detection_status || "").toLowerCase();
  if (status === "crop_mismatch") return "Crop Mismatch";
  if (status === "disease_detected" || record?.disease_detected === 1 || record?.disease_detected === true) {
    return "Disease Detected";
  }
  if (status === "no_disease" || record?.disease_detected === 0 || record?.disease_detected === false) {
    return "No Disease";
  }
  return status ? status.replaceAll("_", " ") : "Unknown";
}

function getStatusClass(record) {
  const status = String(record?.detection_status || "").toLowerCase();
  if (status === "crop_mismatch") return "mismatch";
  if (status === "disease_detected" || record?.disease_detected === 1 || record?.disease_detected === true) return "detected";
  if (status === "no_disease" || record?.disease_detected === 0 || record?.disease_detected === false) return "clear";
  return "unknown";
}

function getDiseaseName(record) {
  if (record?.disease_name) return record.disease_name;
  const result = record?.prediction_result;
  if (!result) return "—";
  if (typeof result === "string") {
    try {
      const parsed = JSON.parse(result);
      return parsed.disease_name || parsed.predicted_disease || parsed.predicted_class || parsed.class_name || parsed.label || "—";
    } catch {
      return "—";
    }
  }
  return result.disease_name || result.predicted_disease || result.predicted_class || result.class_name || result.label || result.prediction?.disease_name || "—";
}

function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState({});
  const [dashboard, setDashboard] = useState({});
  const [experts, setExperts] = useState([]);
  const [diseaseStats, setDiseaseStats] = useState({});
  const [diseaseHistory, setDiseaseHistory] = useState([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historySearch, setHistorySearch] = useState("");
  const [historyCrop, setHistoryCrop] = useState("");
  const [historyStatus, setHistoryStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialExpertForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [diseaseError, setDiseaseError] = useState("");

  const adminName =
    profile.full_name || profile.name || user?.full_name || "Administrator";

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError("");

    const results = await Promise.allSettled([
      getAdminProfile(),
      getAdminDashboard(),
      getAdminExperts(),
      getAdminDiseaseDetectionStats(),
    ]);

    const [profileResult, dashboardResult, expertsResult, diseaseResult] = results;

    if (profileResult.status === "fulfilled") setProfile(unwrapObject(profileResult.value));
    if (dashboardResult.status === "fulfilled") setDashboard(unwrapObject(dashboardResult.value));
    if (expertsResult.status === "fulfilled") setExperts(unwrapArray(expertsResult.value));

    if (diseaseResult.status === "fulfilled") {
      setDiseaseStats(getPayload(diseaseResult.value));
      setDiseaseError("");
    } else {
      setDiseaseError(
        diseaseResult.reason?.response?.data?.message ||
        "Disease detection statistics could not be loaded."
      );
    }

    const failed = results.slice(0, 3).find((result) => result.status === "rejected");
    if (failed) {
      const status = failed.reason?.response?.status;
      if (status === 401 || status === 403) {
        setError("Your admin session is invalid or expired. Please log in again.");
      } else {
        setError(failed.reason?.response?.data?.message || "Some admin information could not be loaded.");
      }
    }

    setLoading(false);
  }, []);

  const loadDiseaseHistory = useCallback(async () => {
    setHistoryLoading(true);
    setDiseaseError("");
    try {
      const params = {
        limit: PAGE_SIZE,
        offset: (historyPage - 1) * PAGE_SIZE,
      };
      if (historyCrop) params.cropName = historyCrop;
      if (historyStatus) params.status = historyStatus;

      const response = await getAdminDiseaseDetectionHistory(params);
      const payload = getPayload(response);
      const records = unwrapArray(response);
      setDiseaseHistory(records);
      setHistoryTotal(Number(payload.total ?? payload.total_records ?? payload.count ?? records.length));
    } catch (requestError) {
      setDiseaseError(
        requestError.response?.data?.message ||
        requestError.message ||
        "Disease detection history could not be loaded."
      );
      setDiseaseHistory([]);
      setHistoryTotal(0);
    } finally {
      setHistoryLoading(false);
    }
  }, [historyPage, historyCrop, historyStatus]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  useEffect(() => {
    if (activeTab === "disease") loadDiseaseHistory();
  }, [activeTab, loadDiseaseHistory]);

  const stats = dashboard.data || dashboard;
  const totalFarmers = Number(stats.total_farmers || 0);
  const activeExperts = Number(stats.total_active_experts || 0);
  const activeCrops = Number(stats.total_active_crops || 0);
  const inactiveAccounts = Number(stats.inactive_accounts || 0);

  const diseaseSummary = diseaseStats.summary || diseaseStats.statistics || diseaseStats;
  const totalDetections = Number(diseaseSummary.total_detections || diseaseSummary.total || 0);
  const mismatchCount = Number(diseaseSummary.crop_mismatch || diseaseSummary.total_crop_mismatch || 0);
  const detectedCount = Number(diseaseSummary.disease_detected || diseaseSummary.total_disease_detected || 0);
  const noDiseaseCount = Number(diseaseSummary.no_disease || diseaseSummary.total_no_disease || 0);
  const cropStatistics = diseaseStats.crop_statistics || diseaseStats.cropStatistics || [];
  const topDiseases = diseaseStats.top_diseases || diseaseStats.topDiseases || [];
  const recentDetections = diseaseStats.recent_detections || diseaseStats.recentDetections || [];

  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return diseaseHistory;
    const query = historySearch.toLowerCase();
    return diseaseHistory.filter((record) =>
      [record.farmer_name, record.farmer_phone, record.crop_name, getDiseaseName(record), getDetectionStatus(record)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [diseaseHistory, historySearch]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setError("");
  };

  const handleCreateExpert = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const cleanName = formData.full_name.trim();
    const cleanPhone = formData.phone.trim();
    if (!cleanName || !cleanPhone || !formData.password) {
      setError("All fields are required.");
      return;
    }
    if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
      setError("Please enter a valid phone number.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setSaving(true);
    try {
      const result = await createAgriExpert({
        full_name: cleanName,
        phone: cleanPhone,
        password: formData.password,
      });
      if (result.success === false) throw new Error(result.message || "Could not create expert.");
      setSuccess(result.message || "Agri Expert account created successfully.");
      setFormData(initialExpertForm);
      setShowForm(false);
      await loadAdminData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || "Failed to create Agri Expert account.");
    } finally {
      setSaving(false);
    }
  };

  const getExpertName = (expert) => expert.full_name || expert.name || "Agri Expert";
  const getExpertPhone = (expert) => expert.phone || "Not available";
  const isExpertActive = (expert) => expert.is_active === 1 || expert.is_active === true || expert.is_active === "1";
  const totalPages = Math.max(1, Math.ceil(historyTotal / PAGE_SIZE));

  const changeHistoryFilter = (setter, value) => {
    setter(value);
    setHistoryPage(1);
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon"><Sprout size={27} /></div>
          <div><h2>AgriSense BD</h2><span>Administration</span></div>
        </div>

        <div className="admin-menu-label">ADMIN MENU</div>
        <nav className="admin-navigation">
          <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}><LayoutDashboard size={19} />Overview</button>
          <button className={activeTab === "experts" ? "active" : ""} onClick={() => setActiveTab("experts")}><GraduationCap size={19} />Agri Experts</button>
          <button className={activeTab === "disease" ? "active" : ""} onClick={() => setActiveTab("disease")}><Microscope size={19} />Disease Monitoring</button>
          <button className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}><UserRound size={19} />Admin Profile</button>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <div className="admin-avatar">{adminName.charAt(0).toUpperCase()}</div>
            <div><strong>{adminName}</strong><span>Administrator</span></div>
          </div>
          <button className="admin-logout" onClick={onLogout}><LogOut size={18} />Logout</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-breadcrumb">AGRISENSE BD / ADMIN PANEL</span>
            <h1>{activeTab === "overview" ? "System Overview" : activeTab === "experts" ? "Agri Expert Management" : activeTab === "disease" ? "Disease Detection Monitoring" : "Admin Profile"}</h1>
          </div>
          <button className="admin-refresh" onClick={loadAdminData} disabled={loading}><RefreshCw size={17} />Refresh</button>
        </header>

        <div className="admin-content">
          {error && <div className="admin-alert error"><AlertCircle size={19} /><span>{error}</span><button onClick={() => setError("")}><X size={17} /></button></div>}
          {success && <div className="admin-alert success"><CheckCircle size={19} /><span>{success}</span><button onClick={() => setSuccess("")}><X size={17} /></button></div>}

          {loading ? (
            <div className="admin-loading"><LoaderCircle className="admin-spinner" size={34} /><p>Loading administration data...</p></div>
          ) : (
            <>
              {activeTab === "overview" && (
                <>
                  <section className="admin-welcome">
                    <div><span>ADMINISTRATION CENTER</span><h2>Welcome, {adminName}</h2><p>Manage the AgriSense BD platform and monitor its agricultural community.</p></div>
                    <div className="admin-welcome-icon"><ShieldCheck size={66} /></div>
                  </section>

                  <section className="admin-stat-grid">
                    <article className="admin-stat-card"><div className="admin-stat-icon blue"><Users size={23} /></div><span>Total Farmers</span><strong>{totalFarmers}</strong><small>Registered farmer accounts</small></article>
                    <article className="admin-stat-card"><div className="admin-stat-icon green"><GraduationCap size={23} /></div><span>Active Experts</span><strong>{activeExperts}</strong><small>Active expert accounts</small></article>
                    <article className="admin-stat-card"><div className="admin-stat-icon orange"><Sprout size={23} /></div><span>Active Crops</span><strong>{activeCrops}</strong><small>Farmer crop records</small></article>
                    <article className="admin-stat-card"><div className="admin-stat-icon red"><Activity size={23} /></div><span>Inactive Accounts</span><strong>{inactiveAccounts}</strong><small>Currently inactive accounts</small></article>
                  </section>

                  <section className="admin-panel">
                    <div className="admin-panel-heading"><div><h3>Agri Expert Directory</h3><p>Recently available expert accounts</p></div><button className="admin-outline-button" onClick={() => setActiveTab("experts")}>Manage Experts</button></div>
                    {experts.length === 0 ? <div className="admin-empty"><GraduationCap size={38} /><h4>No Agri Experts found</h4><p>Create an expert account to get started.</p></div> : (
                      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Expert Name</th><th>Phone Number</th><th>Account Status</th></tr></thead><tbody>{experts.slice(0, 5).map((expert, index) => <tr key={expert.id ?? index}><td><strong>{getExpertName(expert)}</strong></td><td>{getExpertPhone(expert)}</td><td><span className={`admin-status ${isExpertActive(expert) ? "active" : "inactive"}`}>{isExpertActive(expert) ? "Active" : "Inactive"}</span></td></tr>)}</tbody></table></div>
                    )}
                  </section>

                  <section className="admin-panel">
                    <div className="admin-panel-heading"><div><h3>Disease Detection Snapshot</h3><p>AI leaf analysis activity across the platform</p></div><button className="admin-outline-button" onClick={() => setActiveTab("disease")}>View Monitoring</button></div>
                    <div className="admin-disease-mini-grid">
                      <div><span>Total Detections</span><strong>{totalDetections}</strong></div>
                      <div><span>Disease Detected</span><strong>{detectedCount}</strong></div>
                      <div><span>Crop Mismatch</span><strong>{mismatchCount}</strong></div>
                    </div>
                    {diseaseError && <p className="admin-muted-message">{diseaseError}</p>}
                  </section>
                </>
              )}

              {activeTab === "experts" && (
                <section className="admin-panel">
                  <div className="admin-panel-heading"><div><h3>Agri Expert Management</h3><p>View expert accounts and create new experts.</p></div><button className="admin-primary-button" onClick={() => setShowForm((previous) => !previous)}>{showForm ? <X size={18} /> : <UserPlus size={18} />}{showForm ? "Close Form" : "Create Expert"}</button></div>
                  {showForm && (
                    <form className="admin-expert-form" onSubmit={handleCreateExpert}>
                      <h4>Create New Agri Expert</h4>
                      <div className="admin-form-grid">
                        <div className="admin-field"><label htmlFor="expert-name">Full Name *</label><div className="admin-input-wrap"><Users size={18} /><input id="expert-name" name="full_name" type="text" placeholder="Enter expert name" value={formData.full_name} onChange={handleFormChange} required /></div></div>
                        <div className="admin-field"><label htmlFor="expert-phone">Phone Number *</label><div className="admin-input-wrap"><Phone size={18} /><input id="expert-phone" name="phone" type="tel" inputMode="tel" placeholder="Enter phone number" value={formData.phone} onChange={handleFormChange} required /></div></div>
                        <div className="admin-field full"><label htmlFor="expert-password">Initial Password *</label><div className="admin-input-wrap"><Lock size={18} /><input id="expert-password" name="password" type="password" placeholder="At least 8 characters" value={formData.password} onChange={handleFormChange} autoComplete="new-password" required /></div></div>
                      </div>
                      <button type="submit" className="admin-primary-button" disabled={saving}>{saving ? <><LoaderCircle className="admin-spinner" size={18} />Creating...</> : <><Plus size={18} />Create Agri Expert</>}</button>
                    </form>
                  )}
                  {experts.length === 0 ? <div className="admin-empty"><GraduationCap size={38} /><h4>No Agri Experts found</h4><p>Use Create Expert to add an expert account.</p></div> : (
                    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Expert Name</th><th>Phone Number</th><th>Status</th></tr></thead><tbody>{experts.map((expert, index) => <tr key={expert.id ?? index}><td><strong>{getExpertName(expert)}</strong></td><td>{getExpertPhone(expert)}</td><td><span className={`admin-status ${isExpertActive(expert) ? "active" : "inactive"}`}>{isExpertActive(expert) ? "Active" : "Inactive"}</span></td></tr>)}</tbody></table></div>
                  )}
                </section>
              )}

              {activeTab === "disease" && (
                <>
                  <section className="admin-welcome admin-disease-welcome">
                    <div><span>AI HEALTH MONITORING</span><h2>Crop Disease Insights</h2><p>Monitor farmer leaf-image checks, crop mismatches, and detected disease results.</p></div>
                    <div className="admin-welcome-icon"><Microscope size={66} /></div>
                  </section>

                  {diseaseError && <div className="admin-alert error"><AlertCircle size={19} /><span>{diseaseError}</span><button onClick={() => setDiseaseError("")}><X size={17} /></button></div>}

                  <section className="admin-stat-grid admin-disease-stat-grid">
                    <article className="admin-stat-card"><div className="admin-stat-icon blue"><ClipboardList size={23} /></div><span>Total Detections</span><strong>{totalDetections}</strong><small>All saved image checks</small></article>
                    <article className="admin-stat-card"><div className="admin-stat-icon red"><Bug size={23} /></div><span>Disease Detected</span><strong>{detectedCount}</strong><small>Results classified with disease</small></article>
                    <article className="admin-stat-card"><div className="admin-stat-icon orange"><AlertCircle size={23} /></div><span>Crop Mismatch</span><strong>{mismatchCount}</strong><small>Selected crop did not match</small></article>
                    <article className="admin-stat-card"><div className="admin-stat-icon green"><Leaf size={23} /></div><span>No Disease</span><strong>{noDiseaseCount}</strong><small>No disease result returned</small></article>
                  </section>

                  <div className="admin-disease-two-column">
                    <section className="admin-panel">
                      <div className="admin-panel-heading"><div><h3>Crop-wise Detection</h3><p>Detection records grouped by crop</p></div></div>
                      {cropStatistics.length === 0 ? <div className="admin-empty compact"><Sprout size={30} /><p>No crop statistics available yet.</p></div> : <div className="admin-breakdown-list">{cropStatistics.map((item, index) => {
                        const cropName = item.crop_name || item.crop || item.name || "Unknown crop";
                        const count = Number(item.total_detections || item.detections || item.total || item.count || 0);
                        const percent = totalDetections > 0 ? Math.min(100, (count / totalDetections) * 100) : 0;
                        return <div className="admin-breakdown-item" key={`${cropName}-${index}`}><div className="admin-breakdown-label"><strong>{cropName}</strong><span>{count}</span></div><div className="admin-progress-track"><span style={{ width: `${percent}%` }} /></div></div>;
                      })}</div>}
                    </section>

                    <section className="admin-panel">
                      <div className="admin-panel-heading"><div><h3>Common Diseases</h3><p>Most frequently recorded disease labels</p></div></div>
                      {topDiseases.length === 0 ? <div className="admin-empty compact"><Bug size={30} /><p>No disease labels available yet.</p></div> : <div className="admin-top-disease-list">{topDiseases.slice(0, 6).map((item, index) => <div className="admin-top-disease-item" key={`${item.disease_name || item.disease || item.name}-${index}`}><span className="admin-rank-number">{index + 1}</span><div><strong>{item.disease_name || item.disease || item.name || "Unknown disease"}</strong><small>{item.total_detections || item.count || item.total || 0} records</small></div></div>)}</div>}
                    </section>
                  </div>

                  <section className="admin-panel">
                    <div className="admin-panel-heading"><div><h3>Recent Disease Detection</h3><p>Latest AI detection records</p></div><button className="admin-outline-button" onClick={loadDiseaseHistory}>Refresh History</button></div>
                    {recentDetections.length === 0 ? <div className="admin-empty compact"><ClipboardList size={30} /><p>No recent detection records available.</p></div> : (
                      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Farmer</th><th>Crop</th><th>Prediction</th><th>Status</th><th>Date</th></tr></thead><tbody>{recentDetections.slice(0, 8).map((record, index) => <tr key={record.id ?? index}><td><strong>{record.farmer_name || record.full_name || "Farmer"}</strong><small className="admin-table-subtext">{record.farmer_phone || ""}</small></td><td>{record.crop_name || "—"}</td><td>{getDiseaseName(record)}</td><td><span className={`admin-detection-status ${getStatusClass(record)}`}>{getDetectionStatus(record)}</span></td><td>{formatDate(record.created_at)}</td></tr>)}</tbody></table></div>
                    )}
                  </section>

                  <section className="admin-panel">
                    <div className="admin-panel-heading"><div><h3>Detection History</h3><p>Filter the records currently shown on this page.</p></div></div>
                    <div className="admin-history-filters">
                      <div className="admin-history-search"><Search size={17} /><input value={historySearch} onChange={(event) => changeHistoryFilter(setHistorySearch, event.target.value)} placeholder="Search this page by farmer, phone, crop or disease" /></div>
                      <select value={historyCrop} onChange={(event) => changeHistoryFilter(setHistoryCrop, event.target.value)}><option value="">All Crops</option><option value="Rice">Rice</option><option value="Potato">Potato</option><option value="Tomato">Tomato</option><option value="Maize">Maize</option></select>
                      <select value={historyStatus} onChange={(event) => changeHistoryFilter(setHistoryStatus, event.target.value)}><option value="">All Results</option><option value="disease_detected">Disease Detected</option><option value="no_disease">No Disease</option><option value="crop_mismatch">Crop Mismatch</option></select>
                    </div>
                    {historyLoading ? <div className="admin-loading small"><LoaderCircle className="admin-spinner" size={28} /><p>Loading detection history...</p></div> : filteredHistory.length === 0 ? <div className="admin-empty compact"><ClipboardList size={30} /><p>No matching detection history found.</p></div> : (
                      <div className="admin-table-wrap"><table className="admin-table admin-history-table"><thead><tr><th>Farmer</th><th>Phone</th><th>Crop</th><th>Disease / Prediction</th><th>Confidence</th><th>Result</th><th>Date</th></tr></thead><tbody>{filteredHistory.map((record, index) => <tr key={record.id ?? index}><td><strong>{record.farmer_name || "Farmer"}</strong></td><td>{record.farmer_phone || "—"}</td><td>{record.crop_name || "—"}</td><td>{getDiseaseName(record)}</td><td>{formatPercent(record.confidence)}</td><td><span className={`admin-detection-status ${getStatusClass(record)}`}>{getDetectionStatus(record)}</span></td><td>{formatDate(record.created_at)}</td></tr>)}</tbody></table></div>
                    )}
                    <div className="admin-pagination"><span>Page {historyPage} of {totalPages} · {historyTotal} records</span><div><button className="admin-outline-button" disabled={historyPage <= 1 || historyLoading} onClick={() => setHistoryPage((page) => Math.max(1, page - 1))}><ChevronLeft size={16} />Previous</button><button className="admin-outline-button" disabled={historyPage >= totalPages || historyLoading} onClick={() => setHistoryPage((page) => Math.min(totalPages, page + 1))}>Next<ChevronRight size={16} /></button></div></div>
                  </section>
                </>
              )}

              {activeTab === "profile" && (
                <section className="admin-panel">
                  <div className="admin-panel-heading"><div><h3>Administrator Profile</h3><p>Your system administrator information.</p></div></div>
                  <div className="admin-profile-header"><div className="admin-profile-avatar">{adminName.charAt(0).toUpperCase()}</div><div><h3>{adminName}</h3><span>SYSTEM ADMINISTRATOR</span></div></div>
                  <div className="admin-profile-grid">
                    <div><span>Full Name</span><strong>{profile.full_name || user?.full_name || "Not available"}</strong></div>
                    <div><span>Phone Number</span><strong>{profile.phone || user?.phone || "Not available"}</strong></div>
                    <div><span>Account Role</span><strong>{profile.role || user?.role || "ADMIN"}</strong></div>
                    <div><span>Account ID</span><strong>{profile.id || user?.id || "Not available"}</strong></div>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
