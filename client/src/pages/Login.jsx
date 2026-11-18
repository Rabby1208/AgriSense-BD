import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

import PageHero from "../components/PageHero";
import { useAuth } from "../context/AuthContext";

import "./Login.css";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const result = login(phone, password);

    if (!result.ok) {
      setError("মোবাইল নম্বর বা পাসওয়ার্ড ঠিক নয়।");
      return;
    }

    navigate("/");
  }

  return (
    <main>
      <PageHero
        eyebrow="লগইন"
        title="আপনার অ্যাকাউন্টে প্রবেশ করুন"
        description="কৃষক, কৃষি উপদেষ্টা ও অ্যাডমিন নিজ নিজ অ্যাকাউন্টে প্রবেশ করতে পারবেন।"
        icon={LogIn}
      />

      <div className="container login-wrap">
        <form className="login-card" onSubmit={handleSubmit}>
          <label htmlFor="phone">মোবাইল নম্বর</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="01XXXXXXXXX"
            required
          />

          <label htmlFor="password">পাসওয়ার্ড</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-button">
            প্রবেশ করুন
          </button>
        </form>

        <div className="login-demo">
          <strong>ডেমো অ্যাকাউন্ট (শুধু পরীক্ষার জন্য)</strong>
          <p>কৃষক: 01700000001 / farmer123</p>
          <p>উপদেষ্টা: 01700000002 / adviser123</p>
          <p>অ্যাডমিন: 01700000003 / admin123</p>
        </div>
      </div>
    </main>
  );
}

export default Login;