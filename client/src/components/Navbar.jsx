import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sprout,
  Menu,
  X,
  ChevronDown,
  LogIn,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const mainLinks = [
  { label: "হোম", path: "/" },
  { label: "কৃষি পরামর্শ", path: "/advisory" },
  { label: "আজকের করণীয়", path: "/daily-actions" },
  { label: "আবহাওয়া", path: "/weather" },
];

const moreLinks = [
    { label: "বিশেষজ্ঞের সাহায্য", path: "/expert-help" },
  { label: "ফসলের বৃদ্ধি ও ঝুঁকি", path: "/crop-stages" },
  { label: "সার ক্যালকুলেটর", path: "/fertilizer" },
  { label: "সেচ পরামর্শ", path: "/irrigation" },
  { label: "রোগ ও পোকামাকড়", path: "/pest-disease" },
  { label: "কৃষি আবহাওয়া বুলেটিন", path: "/bulletins" },
  { label: "ঐতিহাসিক আবহাওয়া", path: "/history" },
  { label: "ফসলের তথ্য", path: "/crops" },
  { label: "ফসল পরিকল্পনা", path: "/crop-plan" },
  { label: "তথ্যসূত্র", path: "/data-sources" },
  { label: "আমাদের সম্পর্কে", path: "/about" },
];

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const location = useLocation();
    const { user, logout } = useAuth();

  // পেজ বদলালে মেনু বন্ধ হবে
  const [lastPath, setLastPath] = useState(location.pathname);

  if (lastPath !== location.pathname) {
    setLastPath(location.pathname);
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
  }

  return (
    <header className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo">
            <Sprout size={25} />
          </span>

          <span className="navbar-brand-text">
            <strong>AgriSense BD</strong>
            <small>স্মার্ট কৃষি সিদ্ধান্ত সহায়তা</small>
          </span>
        </Link>

        <nav
          className={`navbar-links ${
            mobileMenuOpen ? "active" : ""
          }`}
        >
          {mainLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={
                location.pathname === item.path
                  ? "nav-link active"
                  : "nav-link"
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <div className="navbar-more">
            <button
              type="button"
              className={`nav-link nav-more-button ${
                moreMenuOpen ? "active" : ""
              }`}
              onClick={() => setMoreMenuOpen((previous) => !previous)}
              aria-expanded={moreMenuOpen}
              aria-label="আরও পেজ দেখুন"
            >
              আরও
              <ChevronDown size={16} />
            </button>

            {moreMenuOpen && (
              <div className="navbar-dropdown">
                {moreLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={
                      location.pathname === item.path
                        ? "dropdown-link active"
                        : "dropdown-link"
                    }
                    onClick={() => {
                      setMoreMenuOpen(false);
                      setMobileMenuOpen(false);
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
                    {user ? (
            <button
              type="button"
              className="nav-link"
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
            >
              <LogOut size={16} />
              লগআউট ({user.name})
            </button>
          ) : (
            <Link
              to="/login"
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <LogIn size={16} />
              লগইন
            </Link>
          )}
        </nav>

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen((previous) => !previous)}
          aria-label={mobileMenuOpen ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>
    </header>
  );
}

export default Navbar;