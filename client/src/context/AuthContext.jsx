import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "agrisense_user";

// ডেমো ইউজার (backend বানানোর আগ পর্যন্ত)
const DEMO_USERS = [
  { id: 1, name: "রহিম মিয়া", phone: "01700000001", password: "farmer123", role: "farmer" },
  { id: 2, name: "কৃষি উপদেষ্টা", phone: "01700000002", password: "adviser123", role: "adviser" },
  { id: 3, name: "অ্যাডমিন", phone: "01700000003", password: "admin123", role: "admin" },
];

function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  function login(phone, password) {
    const found = DEMO_USERS.find(
      (item) => item.phone === phone.trim() && item.password === password
    );

    if (!found) {
      return { ok: false };
    }

    const safeUser = { id: found.id, name: found.name, role: found.role };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
    setUser(safeUser);

    return { ok: true, user: safeUser };
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}