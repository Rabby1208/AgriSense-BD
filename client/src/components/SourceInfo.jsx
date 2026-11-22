import { ShieldAlert, ShieldCheck } from "lucide-react";
import { hasValue, isSafeUrl, isVerified } from "../utils/verification";

function SourceRow({ label, children }) {
  return (
    <div className="ui-source-row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Missing() {
  return <span className="ui-source-missing">উল্লেখ নেই</span>;
}

function SourceInfo({ source, status, date, title = "তথ্যসূত্র" }) {
  const verified = isVerified(status, source);

  return (
    <section className="ui-source" aria-label={title}>
      <div className="ui-source-header">
        <h4 className="ui-source-title">{title}</h4>

        {verified ? (
          <span className="ui-status ui-status--verified">
            <ShieldCheck size={14} />
            যাচাইকৃত
          </span>
        ) : (
          <span className="ui-status ui-status--pending">
            <ShieldAlert size={14} />
            যাচাই হয়নি
          </span>
        )}
      </div>

      <dl className="ui-source-list">
        <SourceRow label="সংস্থা">
          {hasValue(source?.organization) ? source.organization : <Missing />}
        </SourceRow>

        <SourceRow label="নথি">
          {hasValue(source?.document) ? source.document : <Missing />}
        </SourceRow>

        {hasValue(source?.page) && (
          <SourceRow label="পৃষ্ঠা">{source.page}</SourceRow>
        )}

        {hasValue(date) && <SourceRow label="প্রকাশ / হালনাগাদ">{date}</SourceRow>}

        <SourceRow label="লিংক">
          {isSafeUrl(source?.url) ? (
            <a href={source.url} target="_blank" rel="noopener noreferrer">
              {source.url}
            </a>
          ) : (
            <Missing />
          )}
        </SourceRow>
      </dl>
    </section>
  );
}

export default SourceInfo;