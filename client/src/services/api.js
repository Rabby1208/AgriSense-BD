// =====================================================
// AGRISENSE BD — API SERVICE
// Backend এবং External API-এর সাথে যোগাযোগের জায়গা।
// কোনো পেজ সরাসরি fetch() ব্যবহার করবে না।
// =====================================================

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const REQUEST_TIMEOUT_MS = 10000;

const ERROR_MESSAGES = {
  network:
    "সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না। সার্ভার চালু আছে কিনা এবং ইন্টারনেট সংযোগ দেখুন।",
  timeout: "সার্ভার সময়মতো সাড়া দেয়নি। আবার চেষ্টা করুন।",
  not_found: "অনুরোধ করা তথ্য পাওয়া যায়নি।",
  server: "সার্ভারে সমস্যা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।",
  invalid_response: "সার্ভার থেকে প্রত্যাশিত তথ্য পাওয়া যায়নি।",
};

export class ApiError extends Error {
  constructor(kind, status = null) {
    super(ERROR_MESSAGES[kind] || ERROR_MESSAGES.server);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

async function request(path, { signal } = {}) {
  const controller = new AbortController();
  let timedOut = false;

  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", () => controller.abort(), {
        once: true,
      });
    }
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      if (timedOut) {
        throw new ApiError("timeout");
      }
      throw error;
    }

    throw new ApiError("network");
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 404) {
    throw new ApiError("not_found", 404);
  }

  if (!response.ok) {
    throw new ApiError("server", response.status);
  }

  let body;

  try {
    body = await response.json();
  } catch {
    throw new ApiError("invalid_response", response.status);
  }

  if (!body || body.success !== true || body.data === undefined) {
    throw new ApiError("invalid_response", response.status);
  }

  return body.data;
}

// ---------- Crops ----------

export async function fetchCrops(options) {
  const data = await request("/crops", options);

  if (!Array.isArray(data)) {
    throw new ApiError("invalid_response");
  }

  return data;
}

export async function fetchCropDetails(cropId, options) {
  if (!cropId) {
    throw new ApiError("not_found", 404);
  }

  return request(`/crops/${encodeURIComponent(cropId)}`, options);
}

// ---------- Locations ----------

export async function fetchLocations(options) {
  const data = await request("/locations", options);

  if (!data || !Array.isArray(data.locations)) {
    throw new ApiError("invalid_response");
  }

  return data.locations;
}

// ---------- Seasons ----------

export async function fetchSeasons(options) {
  const data = await request("/seasons", options);

  if (!data || !Array.isArray(data.seasons)) {
    throw new ApiError("invalid_response");
  }

  return data.seasons;
}

// ---------- Weather: Open-Meteo ----------

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

export async function fetchWeather(latitude, longitude, { signal } = {}) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "precipitation",
      "rain",
      "showers",
      "weather_code",
      "cloud_cover",
      "wind_speed_10m",
      "wind_direction_10m",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "precipitation_probability_max",
      "wind_speed_10m_max",
      "sunrise",
      "sunset",
    ].join(","),
    forecast_days: "7",
    timezone: "Asia/Dhaka",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
  });

  const controller = new AbortController();
  let timedOut = false;

  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 15000);

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", () => controller.abort(), {
        once: true,
      });
    }
  }

  let response;

  try {
    response = await fetch(`${OPEN_METEO_URL}?${params.toString()}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      if (timedOut) {
        throw new ApiError("timeout");
      }

      throw error;
    }

    throw new ApiError("network");
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new ApiError("server", response.status);
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new ApiError("invalid_response");
  }

  if (
    !data ||
    !data.current ||
    !data.daily ||
    !Array.isArray(data.daily.time)
  ) {
    throw new ApiError("invalid_response");
  }

  return {
    ...data,
    fetchedAt: new Date().toISOString(),
    dataType: "forecast",
  };
}