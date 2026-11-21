import { Link } from "react-router-dom";
import TextSizeControl from "./TextSizeControl";
import { Sprout, MapPin } from "lucide-react";

function Footer() {
  return (
    <footer className="footer">
      <div className="container">

        <div className="footer-grid">

          {/* Brand Information */}
          <div>
            <Link to="/" className="navbar-brand">
              <div className="brand-icon">
                <Sprout size={25} />
              </div>

              <span className="footer-brand">
                AgriSense BD
              </span>
            </Link>

            <p className="footer-description">
              বাংলাদেশের কৃষকদের জন্য তথ্যভিত্তিক কৃষি পরামর্শ
              ও আবহাওয়াজনিত সম্ভাব্য ঝুঁকি সম্পর্কে সচেতনতা
              তৈরির একটি ডিজিটাল উদ্যোগ।
            </p>

            <div className="footer-links">
              <span>
                <MapPin size={15} /> বাংলাদেশ
              </span>
            </div>
          </div>

          {/* Website Links */}
          <div>
            <h3 className="footer-heading">গুরুত্বপূর্ণ লিংক</h3>

            <div className="footer-links">
              <Link to="/">হোম</Link>
              <Link to="/advisory">কৃষি পরামর্শ</Link>
              <Link to="/weather">আবহাওয়া</Link>
              <Link to="/crops">ফসলের তথ্য</Link>
              <Link to="/about">আমাদের সম্পর্কে</Link>
            </div>
          </div>

          {/* Information Sources */}
          <div>
            <h3 className="footer-heading">তথ্যসূত্র</h3>

            <div className="footer-links">
              <a
                href="https://www.barc.gov.bd/"
                target="_blank"
                rel="noreferrer"
              >
                বাংলাদেশ কৃষি গবেষণা কাউন্সিল
              </a>

              <a
                href="https://www.brri.gov.bd/"
                target="_blank"
                rel="noreferrer"
              >
                বাংলাদেশ ধান গবেষণা ইনস্টিটিউট
              </a>

              <a
                href="https://www.bari.gov.bd/"
                target="_blank"
                rel="noreferrer"
              >
                বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট
              </a>

              <a
                href="https://www.dae.gov.bd/"
                target="_blank"
                rel="noreferrer"
              >
                কৃষি সম্প্রসারণ অধিদপ্তর
              </a>

              <a
                href="https://open-meteo.com/"
                target="_blank"
                rel="noreferrer"
              >
                Open-Meteo
              </a>
            </div>
          </div>

        </div>

        {/* Disclaimer */}
        <div className="disclaimer">
          <strong>সতর্কতা:</strong> AgriSense BD-এর তথ্য কৃষি
          সিদ্ধান্ত গ্রহণে সহায়ক। এটি বিশেষজ্ঞ কৃষি কর্মকর্তার
          পরামর্শের বিকল্প নয়। নিশ্চিত হতে স্থানীয় কৃষি অফিসে
          যোগাযোগ করুন।
        </div>
        {/* লেখার সাইজ */}
        <div className="footer-text-size">
          <TextSizeControl />
        </div>
        {/* Copyright */}
        <div className="footer-bottom">
          © {new Date().getFullYear()} AgriSense BD.
          সর্বস্বত্ব সংরক্ষিত।
        </div>

      </div>
    </footer>
  );
}

export default Footer;