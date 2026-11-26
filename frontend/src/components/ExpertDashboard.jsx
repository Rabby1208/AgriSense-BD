
import { useCallback, useEffect, useState } from "react";

import {
  Sprout,
  LayoutDashboard,
  UserRound,
  Users,
  RefreshCw,
  LogOut,
  Phone,
  GraduationCap,
  BriefcaseBusiness,
  BookOpen,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  X,
  LoaderCircle,
  Award,
  ClipboardList,
  MessageSquareText,
} from "lucide-react";

import {
  getExpertProfile,
  getExpertsDirectory,
} from "../services/expertApi";

import FarmerManagement from "./FarmerManagement";
import DiseaseDetectionHistory from "./DiseaseDetectionHistory";
import ExpertAdviceManagement from "./ExpertAdviceManagement";

import "./ExpertDashboard.css";

function getObject(result) {
  if (!result) return {};

  if (result.data && !Array.isArray(result.data)) {
    return result.data;
  }

  return result;
}

function getArray(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  return [];
}

function ExpertDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");

  const [profile, setProfile] = useState({});
  const [experts, setExperts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const expertName =
    profile.full_name ||
    user?.full_name ||
    "Agri Expert";

  const loadExpertData = useCallback(async () => {
    setLoading(true);
    setError("");

    const results = await Promise.allSettled([
      getExpertProfile(),
      getExpertsDirectory(),
    ]);

    const [profileResult, directoryResult] = results;

    if (profileResult.status === "fulfilled") {
      setProfile(getObject(profileResult.value));
    }

    if (directoryResult.status === "fulfilled") {
      setExperts(getArray(directoryResult.value));
    }

    const failed = results.find(
      (result) => result.status === "rejected"
    );

    if (failed) {
      const status = failed.reason?.response?.status;

      if (status === 401 || status === 403) {
        setError(
          "Your session is invalid or expired. Please log in again."
        );
      } else {
        setError(
          failed.reason?.response?.data?.message ||
          "Some expert information could not be loaded."
        );
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadExpertData();
  }, [loadExpertData]);

  const expertPhone =
    profile.phone || user?.phone || "Not available";

  const expertise =
    profile.expertise || "Not provided";

  const qualification =
    profile.qualification || "Not provided";

  const experience =
    profile.experience_years !== undefined &&
    profile.experience_years !== null
      ? `${profile.experience_years} years`
      : "Not provided";

  const bio =
    profile.bio || "No professional biography has been added yet.";

  const contactInformation =
    profile.contact_information || "Not provided";

  const pageTitle = {
    overview: "Expert Overview",
    profile: "My Professional Profile",
    directory: "Expert Directory",
    farmers: "Farmer Management",
    "disease-history": "Disease Detection History",
    advice: "Advice Management",
  };

  return (
    <div className="expert-dashboard">
      <aside className="expert-sidebar">
        <div className="expert-brand">
          <div className="expert-brand-icon">
            <Sprout size={27} />
          </div>

          <div>
            <h2>AgriSense BD</h2>
            <span>Expert Portal</span>
          </div>
        </div>

        <div className="expert-menu-label">
          EXPERT MENU
        </div>

        <nav className="expert-navigation">
          <button
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => setActiveTab("overview")}
          >
            <LayoutDashboard size={19} />
            Overview
          </button>

          <button
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
          >
            <UserRound size={19} />
            My Profile
          </button>

          <button
            className={activeTab === "directory" ? "active" : ""}
            onClick={() => setActiveTab("directory")}
          >
            <Users size={19} />
            Expert Directory
          </button>

          <button
            className={activeTab === "farmers" ? "active" : ""}
            onClick={() => setActiveTab("farmers")}
          >
            <Sprout size={19} />
            Farmer Management
          </button>

          <button
            className={activeTab === "advice" ? "active" : ""}
            onClick={() => setActiveTab("advice")}
          >
            <MessageSquareText size={19} />
            Advice Management
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
        </nav>

        <div className="expert-sidebar-footer">
          <div className="expert-sidebar-user">
            <div className="expert-avatar">
              {expertName.charAt(0).toUpperCase()}
            </div>

            <div className="expert-user-details">
              <strong>{expertName}</strong>
              <span>Agri Expert</span>
            </div>
          </div>

          <button
            className="expert-logout"
            onClick={onLogout}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="expert-main">
        <header className="expert-topbar">
          <div>
            <span className="expert-breadcrumb">
              AGRISENSE BD / EXPERT PORTAL
            </span>

            <h1>{pageTitle[activeTab]}</h1>
          </div>

          {activeTab !== "farmers" &&
            activeTab !== "disease-history" &&
            activeTab !== "advice" && (
              <button
                className="expert-refresh"
                onClick={loadExpertData}
                disabled={loading}
              >
                <RefreshCw size={17} />
                Refresh
              </button>
            )}
        </header>

        <div className="expert-content">
          {error && (
            <div className="expert-alert error">
              <AlertCircle size={19} />
              <span>{error}</span>

              <button onClick={() => setError("")}>
                <X size={17} />
              </button>
            </div>
          )}

          {success && (
            <div className="expert-alert success">
              <CheckCircle size={19} />
              <span>{success}</span>

              <button onClick={() => setSuccess("")}>
                <X size={17} />
              </button>
            </div>
          )}

          {activeTab === "farmers" ? (
            <FarmerManagement />
          ) : activeTab === "disease-history" ? (
            <DiseaseDetectionHistory />
          ) : activeTab === "advice" ? (
            <ExpertAdviceManagement />
          ) : loading ? (
            <div className="expert-loading">
              <LoaderCircle
                size={34}
                className="expert-spinner"
              />
              <p>Loading expert information...</p>
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <>
                  <section className="expert-welcome">
                    <div>
                      <span>AGRICULTURE EXPERT PORTAL</span>

                      <h2>Welcome, {expertName}</h2>

                      <p>
                        Access your professional profile and
                        connect with the AgriSense BD expert community.
                      </p>
                    </div>

                    <div className="expert-welcome-icon">
                      <GraduationCap size={70} />
                    </div>
                  </section>

                  <section className="expert-stat-grid">
                    <article className="expert-stat-card">
                      <div className="expert-stat-icon green">
                        <UserRound size={23} />
                      </div>

                      <span>Account Role</span>
                      <strong>Agri Expert</strong>
                      <small>Professional account</small>
                    </article>

                    <article className="expert-stat-card">
                      <div className="expert-stat-icon blue">
                        <Users size={23} />
                      </div>

                      <span>Expert Community</span>
                      <strong>{experts.length}</strong>
                      <small>Active experts in directory</small>
                    </article>

                    <article className="expert-stat-card">
                      <div className="expert-stat-icon orange">
                        <BriefcaseBusiness size={23} />
                      </div>

                      <span>Experience</span>
                      <strong>{experience}</strong>
                      <small>Professional experience</small>
                    </article>
                  </section>

                  <section className="expert-panel">
                    <div className="expert-panel-heading">
                      <div>
                        <h3>Professional Information</h3>
                        <p>Your current expert profile details</p>
                      </div>

                      <button
                        className="expert-outline-button"
                        onClick={() => setActiveTab("profile")}
                      >
                        View Profile
                      </button>
                    </div>

                    <div className="expert-info-grid">
                      <div>
                        <GraduationCap size={19} />
                        <span>Expertise</span>
                        <strong>{expertise}</strong>
                      </div>

                      <div>
                        <Award size={19} />
                        <span>Qualification</span>
                        <strong>{qualification}</strong>
                      </div>

                      <div>
                        <Phone size={19} />
                        <span>Phone Number</span>
                        <strong>{expertPhone}</strong>
                      </div>

                      <div>
                        <Users size={19} />
                        <span>Expert Directory</span>
                        <strong>{experts.length} Experts</strong>
                      </div>
                    </div>
                  </section>

                  <section className="expert-notice">
                    <ShieldCheck size={22} />

                    <div>
                      <h4>Professional Workspace</h4>
                      <p>
                        Manage farmer profiles, review their crop
                        information, provide farming advice, and
                        review AI disease detection records.
                      </p>

                      <button
                        className="expert-outline-button"
                        onClick={() => setActiveTab("farmers")}
                      >
                        <Users size={16} />
                        Open Farmer Management
                      </button>

                      <button
                        className="expert-outline-button"
                        onClick={() => setActiveTab("advice")}
                      >
                        <MessageSquareText size={16} />
                        Manage Farmer Advice
                      </button>

                      <button
                        className="expert-outline-button"
                        onClick={() => setActiveTab("disease-history")}
                      >
                        <ClipboardList size={16} />
                        View Disease History
                      </button>
                    </div>
                  </section>
                </>
              )}

              {activeTab === "profile" && (
                <section className="expert-panel">
                  <div className="expert-panel-heading">
                    <div>
                      <h3>My Professional Profile</h3>
                      <p>Information associated with your account</p>
                    </div>
                  </div>

                  <div className="expert-profile-header">
                    <div className="expert-profile-avatar">
                      {expertName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h2>{expertName}</h2>
                      <span>AGRICULTURE EXPERT</span>
                    </div>
                  </div>

                  <div className="expert-profile-grid">
                    <div>
                      <span>Full Name</span>
                      <strong>{expertName}</strong>
                    </div>

                    <div>
                      <span>Phone Number</span>
                      <strong>{expertPhone}</strong>
                    </div>

                    <div>
                      <span>Expertise</span>
                      <strong>{expertise}</strong>
                    </div>

                    <div>
                      <span>Qualification</span>
                      <strong>{qualification}</strong>
                    </div>

                    <div>
                      <span>Experience</span>
                      <strong>{experience}</strong>
                    </div>

                    <div>
                      <span>Contact Information</span>
                      <strong>{contactInformation}</strong>
                    </div>
                  </div>

                  <div className="expert-bio">
                    <h4>
                      <BookOpen size={18} />
                      Professional Biography
                    </h4>

                    <p>{bio}</p>
                  </div>

                  <p className="expert-profile-note">
                    Profile editing will be enabled after the
                    backend update endpoint is implemented.
                  </p>
                </section>
              )}

              {activeTab === "directory" && (
                <section className="expert-panel">
                  <div className="expert-panel-heading">
                    <div>
                      <h3>Agri Expert Directory</h3>
                      <p>
                        Active experts registered on AgriSense BD
                      </p>
                    </div>
                  </div>

                  {experts.length === 0 ? (
                    <div className="expert-empty">
                      <Users size={40} />
                      <h4>No experts available</h4>
                      <p>
                        There are currently no active expert
                        accounts in the directory.
                      </p>
                    </div>
                  ) : (
                    <div className="expert-directory-grid">
                      {experts.map((item, index) => (
                        <article
                          className="expert-directory-card"
                          key={item.id ?? index}
                        >
                          <div className="expert-directory-card-top">
                            <div className="expert-directory-avatar">
                              {(item.full_name || item.name || "E")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <span className="expert-directory-status">
                              Active
                            </span>
                          </div>

                          <h3>
                            {item.full_name ||
                              item.name ||
                              "Agri Expert"}
                          </h3>

                          <p className="expert-directory-specialty">
                            {item.expertise || "Agriculture Expert"}
                          </p>

                          <div className="expert-directory-detail">
                            <GraduationCap size={16} />
                            <span>
                              {item.qualification ||
                                "Qualification not provided"}
                            </span>
                          </div>

                          <div className="expert-directory-detail">
                            <BriefcaseBusiness size={16} />
                            <span>
                              {item.experience_years !== undefined &&
                              item.experience_years !== null
                                ? `${item.experience_years} years experience`
                                : "Experience not provided"}
                            </span>
                          </div>

                          <div className="expert-directory-detail">
                            <Phone size={16} />
                            <span>
                              {item.phone || "Phone not provided"}
                            </span>
                          </div>

                          {item.bio && (
                            <p className="expert-directory-bio">
                              {item.bio}
                            </p>
                          )}
                        </article>
                      ))}
                    </div>
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

export default ExpertDashboard;
