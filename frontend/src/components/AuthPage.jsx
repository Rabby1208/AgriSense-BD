
import { useState } from "react";
import {
  User,
  Phone,
  Lock,
  MapPin,
  ArrowLeft,
  Sprout,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import { registerFarmer, loginUser } from "../services/authApi";
import "./AuthPage.css";

function AuthPage({
  onLogin,
  onBack,
  initialMode = "login",
}) {
  const [mode, setMode] = useState(initialMode);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    district: "",
    upazila: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  };

  const showFeedback = (type, text) => {
    setMessageType(type);
    setMessage(text);
  };

  const validateRegistration = () => {
    if (
      !formData.full_name.trim() ||
      !formData.phone.trim() ||
      !formData.password
    ) {
      showFeedback(
        "error",
        "Name, phone number and password are required."
      );
      return false;
    }

    const cleanPhone = formData.phone.trim();

    if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
      showFeedback("error", "Please enter a valid phone number.");
      return false;
    }

    if (formData.password.length < 8) {
      showFeedback(
        "error",
        "Password must contain at least 8 characters."
      );
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      showFeedback("error", "Passwords do not match.");
      return false;
    }

    return true;
  };

  const validateLogin = () => {
    if (!formData.phone.trim() || !formData.password) {
      showFeedback(
        "error",
        "Phone number and password are required."
      );
      return false;
    }

    if (!/^\+?[0-9]{10,15}$/.test(formData.phone.trim())) {
      showFeedback("error", "Please enter a valid phone number.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    if (mode === "register" && !validateRegistration()) {
      return;
    }

    if (mode === "login" && !validateLogin()) {
      return;
    }

    setLoading(true);

    try {
      if (mode === "register") {
        const registrationData = {
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
          address: formData.address.trim(),
          district: formData.district.trim(),
          upazila: formData.upazila.trim(),
        };

        const result = await registerFarmer(registrationData);

        if (!result.success) {
          throw new Error(
            result.message || "Registration failed."
          );
        }

        showFeedback(
          "success",
          "Registration successful! Please login with your phone number."
        );

        setFormData((previous) => ({
          ...previous,
          password: "",
          confirmPassword: "",
        }));

        setMode("login");
      } else {
        const credentials = {
          phone: formData.phone.trim(),
          password: formData.password,
        };

        const result = await loginUser(credentials);

        if (!result.success || !result.token || !result.user) {
          throw new Error(result.message || "Login failed.");
        }

        localStorage.setItem("agrisense_token", result.token);

        localStorage.setItem(
          "agrisense_user",
          JSON.stringify(result.user)
        );

        showFeedback("success", "Login successful!");

        if (onLogin) {
          onLogin(result.user, result.token);
        }
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong. Please try again.";

      showFeedback("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setMessage("");
    setFormData((previous) => ({
      ...previous,
      password: "",
      confirmPassword: "",
    }));
  };

  return (
    <div className="auth-page">
      <div className="auth-background-shape auth-shape-one"></div>
      <div className="auth-background-shape auth-shape-two"></div>

      <div className="auth-container">
        <section className="auth-brand-panel">
          <button className="auth-back-button" onClick={onBack}>
            <ArrowLeft size={18} />
            Back to Home
          </button>

          <div className="auth-brand-content">
            <div className="auth-logo">
              <Sprout size={36} />
            </div>

            <h1>AgriSense BD</h1>

            <h2>
              Smart Farming,
              <br />
              Better Future.
            </h2>

            <p>
              Empowering farmers with smart technology,
              AI-powered crop disease detection and
              agricultural insights.
            </p>

            <div className="auth-benefit-list">
              <div>
                <CheckCircle size={19} />
                <span>AI Crop Disease Detection</span>
              </div>

              <div>
                <CheckCircle size={19} />
                <span>Smart Farming Information</span>
              </div>

              <div>
                <CheckCircle size={19} />
                <span>Weather and Crop Management</span>
              </div>
            </div>
          </div>

          <div className="auth-brand-footer">
            © 2026 AgriSense BD. All rights reserved.
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-wrapper">
            <div className="auth-mobile-logo">
              <Sprout size={28} />
              <span>AgriSense BD</span>
            </div>

            <div className="auth-heading">
              <span className="auth-small-label">
                {mode === "login"
                  ? "WELCOME BACK"
                  : "JOIN AGRISENSE BD"}
              </span>

              <h2>
                {mode === "login"
                  ? "Login to your account"
                  : "Create your account"}
              </h2>

              <p>
                {mode === "login"
                  ? "Enter your phone number and password to continue."
                  : "Register as a farmer and start your smart farming journey."}
              </p>
            </div>

            <div className="auth-mode-switch">
              <button
                type="button"
                className={mode === "login" ? "active" : ""}
                onClick={() => switchMode("login")}
              >
                Login
              </button>

              <button
                type="button"
                className={mode === "register" ? "active" : ""}
                onClick={() => switchMode("register")}
              >
                Register
              </button>
            </div>

            {message && (
              <div
                className={`auth-message ${messageType}`}
                role="alert"
              >
                {messageType === "success" ? (
                  <CheckCircle size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}

                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {mode === "register" && (
                <>
                  <div className="auth-input-group">
                    <label htmlFor="full_name">Full Name</label>

                    <div className="auth-input-wrapper">
                      <User size={19} />

                      <input
                        id="full_name"
                        type="text"
                        name="full_name"
                        placeholder="Enter your full name"
                        value={formData.full_name}
                        onChange={handleChange}
                        autoComplete="name"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="auth-input-group">
                <label htmlFor="phone">Phone Number</label>

                <div className="auth-input-wrapper">
                  <Phone size={19} />

                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    inputMode="tel"
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label htmlFor="password">Password</label>

                <div className="auth-input-wrapper">
                  <Lock size={19} />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete={
                      mode === "login"
                        ? "current-password"
                        : "new-password"
                    }
                    required
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {mode === "register" && (
                <>
                  <div className="auth-input-group">
                    <label htmlFor="confirmPassword">
                      Confirm Password
                    </label>

                    <div className="auth-input-wrapper">
                      <Lock size={19} />

                      <input
                        id="confirmPassword"
                        type={
                          showConfirmPassword ? "text" : "password"
                        }
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        required
                      />

                      <button
                        type="button"
                        className="auth-password-toggle"
                        onClick={() =>
                          setShowConfirmPassword(
                            (previous) => !previous
                          )
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={19} />
                        ) : (
                          <Eye size={19} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label htmlFor="address">
                      Address (Optional)
                    </label>

                    <div className="auth-input-wrapper">
                      <MapPin size={19} />

                      <input
                        id="address"
                        type="text"
                        name="address"
                        placeholder="Village, road or area"
                        value={formData.address}
                        onChange={handleChange}
                        autoComplete="street-address"
                      />
                    </div>
                  </div>

                  <div className="auth-two-column">
                    <div className="auth-input-group">
                      <label htmlFor="district">
                        District (Optional)
                      </label>

                      <input
                        className="auth-simple-input"
                        id="district"
                        type="text"
                        name="district"
                        placeholder="District"
                        value={formData.district}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="auth-input-group">
                      <label htmlFor="upazila">
                        Upazila (Optional)
                      </label>

                      <input
                        className="auth-simple-input"
                        id="upazila"
                        type="text"
                        name="upazila"
                        placeholder="Upazila"
                        value={formData.upazila}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoaderCircle className="auth-spinner" size={20} />
                    Please wait...
                  </>
                ) : mode === "login" ? (
                  "Login to Account"
                ) : (
                  "Create Farmer Account"
                )}
              </button>
            </form>

            <div className="auth-bottom-text">
              {mode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                  >
                    Register now
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                  >
                    Login here
                  </button>
                </>
              )}
            </div>

            <p className="auth-security-note">
              Your account information is protected.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AuthPage;
