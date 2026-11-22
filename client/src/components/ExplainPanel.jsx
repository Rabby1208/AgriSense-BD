import { hasValue, UNVERIFIED_TEXT } from "../utils/verification";

// rows: [{ label: "ফসল", value: "আলু" }, ...]
// যাচাই না হওয়া বা ফাঁকা মান স্বয়ংক্রিয়ভাবে "তথ্য যাচাই করা হয়নি" দেখাবে।
// এখানে অভ্যন্তরীণ হিসাবের ধাপ যাচাইকৃত কৃষি-তথ্যের মতো করে দেখানো যাবে না।

function ExplainPanel({ rows = [], children, title = "কেন এই পরামর্শ?" }) {
  return (
    <details className="ui-explain">
      <summary>{title}</summary>

      <div className="ui-explain-body">
        {rows.length > 0 && (
          <dl className="ui-source-list">
            {rows.map((row) => (
              <div className="ui-explain-row" key={row.label}>
                <dt>{row.label}</dt>
                <dd>
                  {hasValue(row.value) ? (
                    row.value
                  ) : (
                    <span className="ui-source-missing">{UNVERIFIED_TEXT}</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {children}
      </div>
    </details>
  );
}

export default ExplainPanel;