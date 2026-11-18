import { RefreshCw, ShieldAlert } from "lucide-react";

function ErrorState({
  title = "তথ্য আনা যায়নি",
  error,
  message,
  onRetry,
}) {
  const text =
    message ||
    error?.message ||
    "কিছু একটা সমস্যা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";

  return (
    <div className="ui-unavailable" role="alert">
      <div className="ui-unavailable-icon">
        <ShieldAlert size={20} />
      </div>

      <div>
        <h3>{title}</h3>
        <p>{text}</p>

        {onRetry && (
          <button
            type="button"
            className="btn btn-outline"
            style={{ marginTop: "14px" }}
            onClick={onRetry}
          >
            <RefreshCw size={16} />
            আবার চেষ্টা করুন
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorState;