function LoadingState({ message = "তথ্য লোড হচ্ছে…", lines = 3 }) {
  const widths = ["100%", "85%", "70%", "92%", "60%"];

  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <p className="ui-freshness">{message}</p>

      <div style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
        {Array.from({ length: lines }, (_, index) => (
          <div
            className="ui-skeleton"
            key={index}
            style={{ width: widths[index % widths.length] }}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default LoadingState;