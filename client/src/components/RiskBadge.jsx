import { Info } from "lucide-react";

// level: "none" | "possible" | "high" | "unknown"
// none     = উপলব্ধ যাচাইকৃত নিয়মে কোনো সতর্কতা মেলেনি (নিরাপদ নিশ্চিত করে না)
// possible = যাচাইকৃত নিয়ম অনুযায়ী সম্ভাব্য ঝুঁকি
// high     = যাচাইকৃত নিয়ম অনুযায়ী উচ্চ অগ্রাধিকারের সম্ভাব্য ঝুঁকি
// unknown  = যাচাইকৃত নিয়ম নেই, তাই ঝুঁকি নির্ধারণ করা যায়নি

const RISK_CONFIG = {
  none: {
    className: "ui-risk--none",
    label: "কোনো সতর্কতা নিয়ম মেলেনি",
  },
  possible: {
    className: "ui-risk--possible",
    label: "সম্ভাব্য ঝুঁকি",
  },
  high: {
    className: "ui-risk--high",
    label: "সম্ভাব্য ঝুঁকি — উচ্চ অগ্রাধিকার",
  },
  unknown: {
    className: "ui-risk--unknown",
    label: "ঝুঁকি নির্ধারণ করা যায়নি",
  },
};

export const RISK_DISCLAIMER =
  "এটি রোগ নির্ণয় নয়। নিশ্চিত হতে স্থানীয় কৃষি অফিসে যোগাযোগ করুন।";

export const RISK_UNKNOWN_MESSAGE =
  "এই ঝুঁকি নির্ধারণের জন্য পর্যাপ্ত যাচাইকৃত তথ্য নেই।";

function RiskBadge({ level = "unknown", showDisclaimer = true }) {
  const config = RISK_CONFIG[level] ?? RISK_CONFIG.unknown;
  const isUnknown = config === RISK_CONFIG.unknown;

  return (
    <div>
      <span className={`ui-risk ${config.className}`}>
        <span className="ui-risk-dot" aria-hidden="true"></span>
        {config.label}
      </span>

      {isUnknown && (
        <p className="ui-source-missing">{RISK_UNKNOWN_MESSAGE}</p>
      )}

      {showDisclaimer && (
        <p className="ui-disclaimer" role="note">
          <Info size={18} aria-hidden="true" />
          <span>{RISK_DISCLAIMER}</span>
        </p>
      )}
    </div>
  );
}

export default RiskBadge;