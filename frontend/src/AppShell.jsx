
import { useEffect, useState } from "react";

import App from "./App";
import AuthPage from "./components/AuthPage";
import FarmerDashboard from "./components/FarmerDashboard";
import AdminDashboard from "./components/AdminDashboard";
import ExpertDashboard from "./components/ExpertDashboard";
import WeatherWidget from "./components/WeatherWidget";

function getSavedUser() {
  try {
    const savedUser = localStorage.getItem("agrisense_user");
    const token = localStorage.getItem("agrisense_token");

    return savedUser && token ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

function getInitialPage() {
  const hash = window.location.hash;

  if (hash === "#login" || hash === "#register") {
    return "auth";
  }

  return getSavedUser() ? "dashboard" : "home";
}

function AppShell() {
  const [page, setPage] = useState(getInitialPage);

  const [authMode, setAuthMode] = useState(
    window.location.hash === "#register" ? "register" : "login"
  );

  const [user, setUser] = useState(getSavedUser);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;

      if (hash === "#login") {
        setAuthMode("login");
        setPage("auth");
      } else if (hash === "#register") {
        setAuthMode("register");
        setPage("auth");
      } else {
        setPage(user ? "dashboard" : "home");
      }
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [user]);

  const handleLogin = (loggedInUser, token) => {
    localStorage.setItem("agrisense_token", token);

    localStorage.setItem(
      "agrisense_user",
      JSON.stringify(loggedInUser)
    );

    setUser(loggedInUser);
    setPage("dashboard");

    window.history.replaceState(
      null,
      "",
      window.location.pathname
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("agrisense_token");
    localStorage.removeItem("agrisense_user");

    setUser(null);
    setPage("home");

    window.history.replaceState(
      null,
      "",
      window.location.pathname
    );
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setPage("auth");

    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}#${mode}`
    );
  };

  const handleBack = () => {
    setPage("home");

    window.history.replaceState(
      null,
      "",
      window.location.pathname
    );
  };

  if (page === "auth") {
    return (
      <AuthPage
        initialMode={authMode}
        onLogin={handleLogin}
        onBack={handleBack}
      />
    );
  }

  if (user && page === "dashboard") {
    switch (user.role) {
      case "FARMER":
        return (
          <FarmerDashboard
            user={user}
            onLogout={handleLogout}
          />
        );

      case "ADMIN":
        return (
          <AdminDashboard
            user={user}
            onLogout={handleLogout}
          />
        );

      case "AGRI_EXPERT":
        return (
          <ExpertDashboard
            user={user}
            onLogout={handleLogout}
          />
        );

      default:
        return (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <h2>Unknown account role</h2>
            <button onClick={handleLogout}>Logout</button>
          </div>
        );
    }
  }

  return (
    <>
      <App />

      <WeatherWidget />

      {!user && (
        <div className="agrisense-auth-actions">
          <button onClick={() => openAuth("login")}>
            Login
          </button>

          <button onClick={() => openAuth("register")}>
            Register
          </button>
        </div>
      )}
    </>
  );
}

export default AppShell;
