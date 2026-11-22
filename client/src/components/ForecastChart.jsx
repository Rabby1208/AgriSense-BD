import "./ForecastChart.css";

// কোনো বাইরের লাইব্রেরি ছাড়া SVG চার্ট: দিনভিত্তিক সর্বোচ্চ/সর্বনিম্ন তাপমাত্রা ও বৃষ্টি।
// days: [{ date: "YYYY-MM-DD", maxTemp, minTemp, rain }]
// এটি Open-Meteo-র পূর্বাভাসের মান দেখায়; কোনো মান বানানো বা অনুমান করা হয় না।

const WIDTH = 600;
const HEIGHT = 270;
const PAD_LEFT = 24;
const PAD_RIGHT = 24;
const TEMP_TOP = 40;
const TEMP_BOTTOM = 140;
const RAIN_BASE = 234;
const RAIN_MAX_HEIGHT = 46;

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

function formatNumber(value, digits = 1) {
  return value.toLocaleString("bn-BD", { maximumFractionDigits: digits });
}

function formatDay(dateString) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "short",
  });
}

function ForecastChart({ days = [], title = "তাপমাত্রা ও বৃষ্টির পূর্বাভাস" }) {
  if (days.length === 0) return null;

  const temps = days
    .flatMap((day) => [day.maxTemp, day.minTemp])
    .filter(isNumber);

  const hasTemps = temps.length > 0;
  const tempMin = hasTemps ? Math.min(...temps) - 2 : 0;
  const tempMax = hasTemps ? Math.max(...temps) + 2 : 1;
  const rainMax = Math.max(1, ...days.map((day) => (isNumber(day.rain) ? day.rain : 0)));

  const slot = (WIDTH - PAD_LEFT - PAD_RIGHT) / days.length;
  const xAt = (index) => PAD_LEFT + slot * (index + 0.5);
  const yTemp = (value) =>
    TEMP_TOP +
    ((tempMax - value) / (tempMax - tempMin)) * (TEMP_BOTTOM - TEMP_TOP);

  const linePoints = (key) =>
    days
      .map((day, index) =>
        isNumber(day[key]) ? `${xAt(index)},${yTemp(day[key])}` : null
      )
      .filter(Boolean)
      .join(" ");

  return (
    <figure className="fc-figure">
      <figcaption className="fc-title">{title}</figcaption>

      <svg
        className="fc-chart"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={title}
      >
        {/* তাপমাত্রার লাইন */}
        <polyline className="fc-line fc-line--max" points={linePoints("maxTemp")} />
        <polyline className="fc-line fc-line--min" points={linePoints("minTemp")} />

        {days.map((day, index) => (
          <g key={day.date}>
            {isNumber(day.maxTemp) && (
              <>
                <circle
                  className="fc-dot fc-dot--max"
                  cx={xAt(index)}
                  cy={yTemp(day.maxTemp)}
                  r="5"
                />
                <text
                  className="fc-label"
                  x={xAt(index)}
                  y={yTemp(day.maxTemp) - 12}
                  textAnchor="middle"
                >
                  {formatNumber(day.maxTemp)}°
                </text>
              </>
            )}

            {isNumber(day.minTemp) && (
              <>
                <circle
                  className="fc-dot fc-dot--min"
                  cx={xAt(index)}
                  cy={yTemp(day.minTemp)}
                  r="5"
                />
                <text
                  className="fc-label"
                  x={xAt(index)}
                  y={yTemp(day.minTemp) + 22}
                  textAnchor="middle"
                >
                  {formatNumber(day.minTemp)}°
                </text>
              </>
            )}

            {/* বৃষ্টির বার */}
            {isNumber(day.rain) && (
              <>
                <rect
                  className="fc-bar"
                  x={xAt(index) - 18}
                  y={RAIN_BASE - (day.rain / rainMax) * RAIN_MAX_HEIGHT}
                  width="36"
                  height={Math.max((day.rain / rainMax) * RAIN_MAX_HEIGHT, 2)}
                  rx="4"
                />
                <text
                  className="fc-label fc-label--small"
                  x={xAt(index)}
                  y={RAIN_BASE - (day.rain / rainMax) * RAIN_MAX_HEIGHT - 8}
                  textAnchor="middle"
                >
                  {formatNumber(day.rain)} মিমি
                </text>
              </>
            )}

            <text
              className="fc-label fc-label--day"
              x={xAt(index)}
              y={HEIGHT - 8}
              textAnchor="middle"
            >
              {formatDay(day.date)}
            </text>
          </g>
        ))}
      </svg>

      <div className="fc-legend">
        <span>
          <i className="fc-swatch fc-swatch--max" />
          সর্বোচ্চ তাপমাত্রা (°C)
        </span>
        <span>
          <i className="fc-swatch fc-swatch--min" />
          সর্বনিম্ন তাপমাত্রা (°C)
        </span>
        <span>
          <i className="fc-swatch fc-swatch--rain" />
          বৃষ্টি (মিমি)
        </span>
      </div>

      {/* স্ক্রিন রিডারের জন্য টেবিল */}
      <table className="fc-sr">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th>তারিখ</th>
            <th>সর্বোচ্চ</th>
            <th>সর্বনিম্ন</th>
            <th>বৃষ্টি</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.date}>
              <td>{formatDay(day.date)}</td>
              <td>{isNumber(day.maxTemp) ? formatNumber(day.maxTemp) : "তথ্য নেই"}</td>
              <td>{isNumber(day.minTemp) ? formatNumber(day.minTemp) : "তথ্য নেই"}</td>
              <td>{isNumber(day.rain) ? formatNumber(day.rain) : "তথ্য নেই"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export default ForecastChart;