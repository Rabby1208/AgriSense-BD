
import { useState } from "react";

import App from "./App";
import AuthPage from "./components/AuthPage";

import AdminDashboard from "./components/AdminDashboard";
import ExpertDashboard from "./components/ExpertDashboard";
import FarmerDashboard from "./components/FarmerDashboard";

import "./AppRouter.css";

const getSavedUser = () => {
  try {
    const savedUser = localStorage.getItem("agrisense_user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
};

function AppRouter() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(getSavedUser);

  const handleLogin = (loggedInUser, token) => {
    if (!loggedInUser || !token) {
      return;
    }

    localStorage.setItem("agrisense_token", token);
    localStorage.setItem(
      "agrisense_user",
      JSON.stringify(loggedInUser)
    );

    setUser(loggedInUser);
    setPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("agrisense_token");
    localStorage.removeItem("agrisense_user");

    setUser(null);
    setPage("home");
  };

  const role = String(user?.role || "").toUpperCase();

  if (page === "auth") {
    return (
      <AuthPage
        onLogin={handleLogin}
        onBack={() => setPage("home")}
      />
    );
  }

  if (user && page === "dashboard") {
    if (role === "ADMIN") {
      return (
        <AdminDashboard
          user={user}
          onLogout={handleLogout}
        />
      );
    }

    if (role === "EXPERT") {
      return (
        <ExpertDashboard
          user={user}
          onLogout={handleLogout}
        />
      );
    }

    if (role === "FARMER") {
      return (
        <FarmerDashboard
          user={user}
          onLogout={handleLogout}
        />
      );
    }

    return (
      <div className="auth-dashboard-placeholder">
        <div className="auth-dashboard-card">
          <h2>Account Role Not Recognized</h2>
          <p>Please contact the administrator.</p>
          <button
            type="button"
            className="auth-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <App />

      {!user && (
        <button
          type="button"
          className="auth-launch-button"
          onClick={() => setPage("auth")}
        >
          Login / Register
        </button>
      )}

      {user && (
        <button
          type="button"
          className="auth-launch-button"
          onClick={() => setPage("dashboard")}
        >
          My Account
        </button>
      )}
    </>
  );
}

export default AppRouter;
