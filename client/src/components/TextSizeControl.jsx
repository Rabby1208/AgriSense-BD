import { Type } from "lucide-react";
import useTextSize from "../hooks/useTextSize";
import "./TextSizeControl.css";

// compact = true হলে নিচের মেনুর জন্য ছোট রূপ (আইকন ও "লেখা")
function TextSizeControl({ compact = false }) {
  const { size, cycle } = useTextSize();

  const percent = size.toLocaleString("bn-BD");

  return (
    <button
      type="button"
      className={compact ? "text-size text-size--compact" : "text-size"}
      onClick={cycle}
      aria-label={`লেখার সাইজ ${percent} শতাংশ। বদলাতে চাপুন`}
    >
      <Type size={compact ? 22 : 18} />
      <span>{compact ? "লেখা" : `লেখার সাইজ: ${percent}%`}</span>
    </button>
  );
}

export default TextSizeControl;