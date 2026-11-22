import { ShieldAlert, ShieldCheck } from "lucide-react";

// যাচাইয়ের অবস্থার ছোট ব্যাজ (ui.css-এর .ui-status ব্যবহার করে)
// verified = true  : "যাচাইকৃত" (সবুজ)
// verified = false : "যাচাই বাকি" (হলুদ)
function StatusBadge({ verified = false, label }) {
  if (verified) {
    return (
      <span className="ui-status ui-status--verified">
        <ShieldCheck size={14} />
        {label ?? "যাচাইকৃত"}
      </span>
    );
  }

  return (
    <span className="ui-status ui-status--pending">
      <ShieldAlert size={14} />
      {label ?? "যাচাই বাকি"}
    </span>
  );
}

export default StatusBadge;