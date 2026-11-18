import { Link } from 'react-router-dom';
import { ArrowLeft, Sprout } from 'lucide-react';

function PlaceholderPage({ title, subtitle }) {
  return (
    <section className="placeholder-section">
      <div className="container">
        <div className="placeholder-card">
          <div className="placeholder-icon">
            <Sprout size={34} />
          </div>

          <span className="section-eyebrow">AgriSense BD</span>

          <h1>{title}</h1>

          <p>{subtitle}</p>

          <div className="development-label">
            এই অংশটি ধাপে ধাপে তৈরি করা হচ্ছে।
          </div>

          <Link to="/" className="button button-primary">
            <ArrowLeft size={17} />
            হোম পেজে ফিরে যান
          </Link>
        </div>
      </div>
    </section>
  );
}

export default PlaceholderPage;