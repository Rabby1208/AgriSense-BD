import { NavLink } from "react-router-dom";
import { CalendarCheck, CloudSun, Headset, House } from "lucide-react";
import TextSizeControl from "./TextSizeControl";
import "./BottomNav.css";

const items = [
  { to: "/", label: "হোম", Icon: House },
  { to: "/daily-actions", label: "আজকের করণীয়", Icon: CalendarCheck },
  { to: "/weather", label: "আবহাওয়া", Icon: CloudSun },
  { to: "/expert-help", label: "বিশেষজ্ঞ", Icon: Headset },
];

// শুধু মোবাইল ও ছোট স্ক্রিনে দেখায় (CSS দিয়ে)
function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="দ্রুত মেনু">
      {items.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            isActive ? "bottom-nav-link active" : "bottom-nav-link"
          }
        >
          <Icon size={22} />
          <span>{label}</span>
        </NavLink>
      ))}

      <TextSizeControl compact />
    </nav>
  );
}

export default BottomNav;