
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  CloudSun,
  CloudRain,
  Sun,
  Cloud,
  Wind,
  Droplets,
  Thermometer,
  MapPin,
  RefreshCw,
  LoaderCircle,
  AlertCircle,
  Sprout,
  CalendarDays,
  Leaf,
  CheckCircle,
  Clock,
  LandPlot,
  Wheat,
  Info,
  CalendarCheck,
} from "lucide-react";

import "./FarmerWeatherAdvisory.css";

// --------------------------------------------------
// Translation helpers
// --------------------------------------------------

const t = (english, bangla, isBangla) =>
  isBangla ? bangla : english;

const CROP_NAMES = {
  rice: "ধান",
  paddy: "ধান",
  potato: "আলু",
  tomato: "টমেটো",
  maize: "ভুট্টা",
  corn: "ভুট্টা",
  wheat: "গম",
  onion: "পেঁয়াজ",
  garlic: "রসুন",
  mustard: "সরিষা",
  brinjal: "বেগুন",
  eggplant: "বেগুন",
  chili: "মরিচ",
  chilli: "মরিচ",
  cabbage: "বাঁধাকপি",
  cauliflower: "ফুলকপি",
  cucumber: "শসা",
  pumpkin: "মিষ্টি কুমড়া",
  carrot: "গাজর",
  lentil: "মসুর ডাল",
  jute: "পাট",
};

const translateCropName = (name, isBangla) => {
  if (!name) return t("Unknown Crop", "অজানা ফসল", isBangla);
  if (!isBangla) return name;

  const key = String(name).trim().toLowerCase();
  return CROP_NAMES[key] || name;
};

const formatNumber = (value, isBangla, maximumFractionDigits = 1) => {
  if (value === null || value === undefined || value === "") {
    return "--";
  }

  return Number(value).toLocaleString(
    isBangla ? "bn-BD" : "en-US",
    { maximumFractionDigits }
  );
};

// --------------------------------------------------
// Date helpers
// --------------------------------------------------

const parseDate = (date) => {
  if (!date) return null;

  const value = String(date).slice(0, 10);
  const parts = value.split("-");

  if (parts.length !== 3) return null;

  const [year, month, day] = parts.map(Number);

  if (!year || !month || !day) return null;

  const parsed = new Date(year, month - 1, day);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
};

const formatDate = (date, isBangla) => {
  const parsed = parseDate(date);

  if (!parsed) {
    return t("Information unavailable", "তথ্য নেই", isBangla);
  }

  return parsed.toLocaleDateString(
    isBangla ? "bn-BD" : "en-US",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
};

// --------------------------------------------------
// Crop helpers
// --------------------------------------------------

const getCropName = (crop) =>
  crop.crop_name ||
  crop.name ||
  crop.crop?.name ||
  crop.crop?.crop_name ||
  "Unknown Crop";

const getCropId = (crop, index) =>
  String(
    crop.id ||
      crop.farmer_crop_id ||
      crop.crop_record_id ||
      index
  );

const getCropAge = (plantingDate) => {
  const planted = parseDate(plantingDate);

  if (!planted) return null;

  const today = new Date();

  const current = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const days = Math.floor(
    (current - planted) / (1000 * 60 * 60 * 24)
  );

  return days >= 0 ? days : null;
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// --------------------------------------------------
// Estimated crop duration
// --------------------------------------------------

const CROP_DURATION = {
  potato: { min: 90, max: 120 },
  আলু: { min: 90, max: 120 },

  tomato: { min: 90, max: 120 },
  টমেটো: { min: 90, max: 120 },

  maize: { min: 90, max: 120 },
  corn: { min: 90, max: 120 },
  ভুট্টা: { min: 90, max: 120 },

  rice: { min: 100, max: 150 },
  paddy: { min: 100, max: 150 },
  ধান: { min: 100, max: 150 },

  wheat: { min: 110, max: 130 },
  গম: { min: 110, max: 130 },

  onion: { min: 100, max: 130 },
  পেঁয়াজ: { min: 100, max: 130 },

  garlic: { min: 120, max: 150 },
  রসুন: { min: 120, max: 150 },

  mustard: { min: 80, max: 100 },
  সরিষা: { min: 80, max: 100 },

  brinjal: { min: 100, max: 150 },
  eggplant: { min: 100, max: 150 },
  বেগুন: { min: 100, max: 150 },

  chili: { min: 90, max: 150 },
  chilli: { min: 90, max: 150 },
  মরিচ: { min: 90, max: 150 },

  cabbage: { min: 75, max: 100 },
  বাঁধাকপি: { min: 75, max: 100 },

  cauliflower: { min: 80, max: 110 },
  ফুলকপি: { min: 80, max: 110 },
};

const getHarvestDuration = (crop) => {
  const databaseMin = Number(
    crop.harvest_min_days ||
      crop.duration_min_days ||
      crop.crop?.harvest_min_days ||
      0
  );

  const databaseMax = Number(
    crop.harvest_max_days ||
      crop.duration_max_days ||
      crop.crop?.harvest_max_days ||
      0
  );

  const databaseDuration = Number(
    crop.harvest_duration_days ||
      crop.crop_duration_days ||
      crop.duration_days ||
      crop.growth_duration_days ||
      crop.harvesting_days ||
      crop.maturity_days ||
      crop.crop?.duration_days ||
      crop.crop?.harvesting_days ||
      crop.crop?.maturity_days ||
      0
  );

  if (databaseMin > 0 && databaseMax >= databaseMin) {
    return {
      min: databaseMin,
      max: databaseMax,
      source: "database",
    };
  }

  if (databaseDuration > 0) {
    return {
      min: databaseDuration,
      max: databaseDuration,
      source: "database",
    };
  }

  const name = getCropName(crop).trim().toLowerCase();

  const matchedKey = Object.keys(CROP_DURATION).find(
    (key) => name === key || name.includes(key)
  );

  if (matchedKey) {
    return {
      ...CROP_DURATION[matchedKey],
      source: "estimate",
    };
  }

  return null;
};

const getHarvestTimeline = (crop, isBangla) => {
  if (!crop?.planting_date) return null;

  const plantingDate = parseDate(crop.planting_date);
  const age = getCropAge(crop.planting_date);
  const duration = getHarvestDuration(crop);

  if (!plantingDate || age === null || !duration) {
    return null;
  }

  const startDate = addDays(plantingDate, duration.min);
  const endDate = addDays(plantingDate, duration.max);

  const daysUntilStart = duration.min - age;
  const daysUntilEnd = duration.max - age;

  let status = "growing";
  let statusText;
  let description;

  if (age < duration.min) {
    status = "growing";

    statusText = t(
      "The crop is not ready for harvest yet",
      "ফসল কাটার সময় এখনো হয়নি",
      isBangla
    );

    description = t(
      `The estimated harvest period may begin in about ${daysUntilStart} days.`,
      `আনুমানিক ${formatNumber(daysUntilStart, isBangla, 0)} দিন পর থেকে ফসল কাটার সময় শুরু হতে পারে।`,
      isBangla
    );
  } else if (age <= duration.max) {
    status = "ready";

    statusText = t(
      "Estimated harvest period has started",
      "সম্ভাব্য ফসল কাটার সময় চলছে",
      isBangla
    );

    description = t(
      "Check crop maturity, color, size and field conditions before preparing for harvest.",
      "ফসলের পরিপক্বতা, রং, আকার ও জমির অবস্থা যাচাই করে কাটার প্রস্তুতি নাও।",
      isBangla
    );
  } else {
    status = "check";

    statusText = t(
      "The estimated harvest period has passed",
      "সম্ভাব্য সময় পার হয়েছে",
      isBangla
    );

    description = t(
      "If the crop is still in the field, check its maturity promptly. Consult a local agricultural officer if needed.",
      "ফসল এখনো জমিতে থাকলে দ্রুত পরিপক্বতা পরীক্ষা করো। প্রয়োজন হলে স্থানীয় কৃষি কর্মকর্তার পরামর্শ নাও।",
      isBangla
    );
  }

  return {
    age,
    minDays: duration.min,
    maxDays: duration.max,
    startDate,
    endDate,
    daysUntilStart,
    daysUntilEnd,
    status,
    statusText,
    description,
    source: duration.source,
  };
};

// --------------------------------------------------
// Weather helpers
// --------------------------------------------------

const getWeatherDescription = (code, isBangla) => {
  const descriptions = {
    0: ["Clear sky", "পরিষ্কার আকাশ"],
    1: ["Mainly clear", "প্রধানত পরিষ্কার"],
    2: ["Partly cloudy", "আংশিক মেঘলা"],
    3: ["Overcast", "মেঘাচ্ছন্ন"],
    45: ["Fog", "কুয়াশা"],
    48: ["Depositing rime fog", "ঘন কুয়াশা"],
    51: ["Light drizzle", "হালকা গুঁড়ি গুঁড়ি বৃষ্টি"],
    53: ["Moderate drizzle", "মাঝারি গুঁড়ি গুঁড়ি বৃষ্টি"],
    55: ["Dense drizzle", "ঘন গুঁড়ি গুঁড়ি বৃষ্টি"],
    61: ["Light rain", "হালকা বৃষ্টি"],
    63: ["Moderate rain", "মাঝারি বৃষ্টি"],
    65: ["Heavy rain", "ভারী বৃষ্টি"],
    80: ["Rain showers", "বৃষ্টির ঝরনা"],
    81: ["Moderate rain showers", "মাঝারি বৃষ্টির ঝরনা"],
    82: ["Violent rain showers", "প্রবল বৃষ্টির ঝরনা"],
    95: ["Thunderstorm", "বজ্রঝড়"],
    96: ["Thunderstorm with hail", "শিলাবৃষ্টিসহ বজ্রঝড়"],
    99: ["Thunderstorm with heavy hail", "ভারী শিলাবৃষ্টিসহ বজ্রঝড়"],
  };

  const description = descriptions[code];

  if (!description) {
    return t("Weather information", "আবহাওয়ার তথ্য", isBangla);
  }

  return isBangla ? description[1] : description[0];
};

// --------------------------------------------------
// Weather-based advice
// --------------------------------------------------

function buildAdvice(weather, selectedCrop, isBangla) {
  if (!weather || !selectedCrop) return null;

  const rain = weather.totalRainfall;
  const probability = weather.maxRainProbability;
  const cropName = selectedCrop.displayName;

  let irrigation;
  let fertilizer;

  if (rain >= 5 || probability >= 80) {
    irrigation = {
      title: t(
        `Wait before irrigating ${cropName}`,
        `${cropName} জমিতে সেচ দেওয়ার আগে অপেক্ষা করো`,
        isBangla
      ),
      description: t(
        "Rain is likely in the next 24 hours. If the soil already has enough moisture, additional irrigation may not be necessary.",
        "আগামী ২৪ ঘণ্টায় বৃষ্টির সম্ভাবনা বেশি। জমিতে পানি বা পর্যাপ্ত আর্দ্রতা থাকলে অতিরিক্ত সেচের প্রয়োজন নাও হতে পারে।",
        isBangla
      ),
      type: "warning",
      actions: [
        t("Check the soil first.", "প্রথমে জমির মাটি পরীক্ষা করো।", isBangla),
        t("Do not irrigate if the soil is wet.", "মাটি ভেজা থাকলে এখন সেচ দিও না।", isBangla),
        t("Check for waterlogging after rainfall.", "বৃষ্টির পর জমিতে পানি জমেছে কি না দেখো।", isBangla),
        t("Decide on irrigation based on crop needs if the soil dries.", "জমি শুকিয়ে গেলে ফসলের প্রয়োজন অনুযায়ী সেচের সিদ্ধান্ত নাও।", isBangla),
      ],
    };
  } else if (rain >= 2 || probability >= 50) {
    irrigation = {
      title: t(
        `Check soil moisture in your ${cropName} field`,
        `${cropName} জমির আর্দ্রতা পরীক্ষা করো`,
        isBangla
      ),
      description: t(
        "Some rainfall is possible in the next 24 hours. Check the field before irrigating.",
        "আগামী ২৪ ঘণ্টায় কিছু বৃষ্টির সম্ভাবনা রয়েছে। সেচ দেওয়ার আগে জমির বর্তমান অবস্থা দেখে নাও।",
        isBangla
      ),
      type: "info",
      actions: [
        t("Check the soil.", "জমির মাটি পরীক্ষা করো।", isBangla),
        t("Delay irrigation if the soil is wet.", "মাটি ভেজা থাকলে সেচ কিছুক্ষণ পিছিয়ে দাও।", isBangla),
        t("Irrigate according to crop needs if the soil is dry.", "মাটি শুকনো হলে ফসলের প্রয়োজন অনুযায়ী সেচ দাও।", isBangla),
        t("Avoid waterlogging in the field.", "জমিতে পানি জমতে দিও না।", isBangla),
      ],
    };
  } else {
    irrigation = {
      title: t(
        `Irrigate your ${cropName} field when needed`,
        `${cropName} জমিতে প্রয়োজন অনুযায়ী সেচ দাও`,
        isBangla
      ),
      description: t(
        "No significant rainfall is forecast in the next 24 hours. Check soil moisture before deciding on irrigation.",
        "আগামী ২৪ ঘণ্টায় উল্লেখযোগ্য বৃষ্টির পূর্বাভাস নেই। মাটির আর্দ্রতা পরীক্ষা করে সেচের সিদ্ধান্ত নাও।",
        isBangla
      ),
      type: "success",
      actions: [
        t("Check the soil first.", "প্রথমে জমির মাটি পরীক্ষা করো।", isBangla),
        t("Irrigate if the soil is dry.", "মাটি শুকনো হলে প্রয়োজন অনুযায়ী সেচ দাও।", isBangla),
        t("Skip irrigation if the soil is sufficiently moist.", "মাটি যথেষ্ট ভেজা থাকলে সেচের প্রয়োজন নেই।", isBangla),
        t("Check for excess water after irrigation.", "সেচের পর জমিতে অতিরিক্ত পানি জমছে কি না দেখো।", isBangla),
      ],
    };
  }

  if (rain >= 10 || probability >= 85) {
    fertilizer = {
      title: t(
        `Wait before applying fertilizer to ${cropName}`,
        `${cropName} জমিতে সার প্রয়োগের আগে অপেক্ষা করো`,
        isBangla
      ),
      description: t(
        "Heavy rainfall is possible, and fertilizer may wash away. Consider the forecast and field conditions.",
        "ভারী বৃষ্টির সম্ভাবনা থাকলে সার ধুয়ে যেতে পারে। আবহাওয়া ও জমির অবস্থা বিবেচনা করো।",
        isBangla
      ),
      type: "warning",
      actions: [
        t("Consider the heavy-rain forecast.", "ভারী বৃষ্টির পূর্বাভাস বিবেচনা করো।", isBangla),
        t("Avoid applying fertilizer just before heavy rain.", "বৃষ্টির ঠিক আগে সার প্রয়োগ এড়িয়ে চলো।", isBangla),
        t("Do not apply fertilizer in waterlogged fields.", "জমিতে পানি জমে থাকলে সার প্রয়োগ করো না।", isBangla),
        t("Apply fertilizer according to recommendations when conditions improve.", "আবহাওয়া অনুকূল হলে সুপারিশ অনুযায়ী সার প্রয়োগ করো।", isBangla),
      ],
    };
  } else if (rain >= 3 || probability >= 60) {
    fertilizer = {
      title: t(
        `Check the timing of fertilizer application for ${cropName}`,
        `${cropName} ফসলে সার প্রয়োগের সময় যাচাই করো`,
        isBangla
      ),
      description: t(
        "Rain is possible. Consider crop growth, soil moisture and rainfall timing.",
        "বৃষ্টির সম্ভাবনা রয়েছে। ফসলের বৃদ্ধি, জমির আর্দ্রতা ও বৃষ্টির সময় বিবেচনা করো।",
        isBangla
      ),
      type: "info",
      actions: [
        t("Check the current crop growth stage.", "ফসলের বর্তমান বৃদ্ধির পর্যায় যাচাই করো।", isBangla),
        t("Delay fertilizer application if the soil is too wet.", "মাটি অতিরিক্ত ভেজা থাকলে সার প্রয়োগ পিছিয়ে দাও।", isBangla),
        t("Avoid applying fertilizer just before rain.", "বৃষ্টির ঠিক আগে সার প্রয়োগ কোরো না।", isBangla),
        t("Use recommended fertilizer only when needed.", "প্রয়োজন অনুযায়ী সুপারিশকৃত সার ব্যবহার করো।", isBangla),
      ],
    };
  } else {
    fertilizer = {
      title: t(
        `Plan fertilizer application for ${cropName}`,
        `${cropName} ফসলের সার প্রয়োগের পরিকল্পনা করো`,
        isBangla
      ),
      description: t(
        "Rainfall is relatively unlikely. The right fertilizer timing depends on crop age, soil and nutrient requirements.",
        "বৃষ্টির সম্ভাবনা তুলনামূলক কম। সার দেওয়ার সঠিক সময় নির্ভর করে ফসলের বয়স, মাটি ও পুষ্টির চাহিদার ওপর।",
        isBangla
      ),
      type: "success",
      actions: [
        t("Observe current crop growth.", "ফসলের বর্তমান বৃদ্ধি পর্যবেক্ষণ করো।", isBangla),
        t("Consider soil nutrient conditions.", "মাটির পুষ্টির অবস্থা বিবেচনা করো।", isBangla),
        t("Test the soil if necessary.", "প্রয়োজন হলে মাটি পরীক্ষা করাও।", isBangla),
        t("Apply fertilizer according to local agricultural recommendations.", "স্থানীয় কৃষি সুপারিশ অনুযায়ী সার প্রয়োগ করো।", isBangla),
      ],
    };
  }

  return { irrigation, fertilizer };
}

// --------------------------------------------------
// Main component
// --------------------------------------------------

function FarmerWeatherAdvisory({
  myCrops = [],
  profile = {},
}) {
  const { i18n } = useTranslation();
  const isBangla = i18n.language?.startsWith("bn");

  const initialLocation =
    profile.upazila ||
    profile.district ||
    "Dhaka";

  const [location, setLocation] = useState(initialLocation);
  const [weather, setWeather] = useState(null);
  const [selectedCropId, setSelectedCropId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const cropOptions = useMemo(() => {
    return myCrops.map((crop, index) => ({
      ...crop,
      displayName: translateCropName(getCropName(crop), isBangla),
      selectionId: getCropId(crop, index),
      cropAge: getCropAge(crop.planting_date),
    }));
  }, [myCrops, isBangla]);

  const selectedCrop = cropOptions.find(
    (crop) => crop.selectionId === selectedCropId
  );

  const harvestTimeline = useMemo(
    () => getHarvestTimeline(selectedCrop, isBangla),
    [selectedCrop, isBangla]
  );

  useEffect(() => {
    if (cropOptions.length === 0) {
      setSelectedCropId("");
      return;
    }

    const stillExists = cropOptions.some(
      (crop) => crop.selectionId === selectedCropId
    );

    if (!stillExists) {
      setSelectedCropId(cropOptions[0].selectionId);
    }
  }, [cropOptions, selectedCropId]);

  const loadWeather = async (searchLocation = location) => {
    const query = searchLocation.trim();

    if (!query) {
      setError(
        t("Please enter your area name.", "তোমার এলাকার নাম লিখো।", isBangla)
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const normalizePlaceName = (value) =>
        String(value || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/bangladesh/g, "")
          .replace(/\bsadar\b/g, "")
          .replace(/district/g, "")
          .replace(/[^a-z0-9]+/g, " ")
          .trim();

      const baseQuery = query
        .replace(/,?\s*bangladesh\s*$/i, "")
        .replace(/\s+sadar\s*$/i, "")
        .trim();

      const searchTerms = [...new Set([query, baseQuery])]
        .filter((term) => term.length >= 2);

      let place = null;

      for (const searchTerm of searchTerms) {
        const geoUrl = new URL(
          "https://geocoding-api.open-meteo.com/v1/search"
        );

        geoUrl.searchParams.set("name", searchTerm);
        geoUrl.searchParams.set("count", "10");
        geoUrl.searchParams.set("countryCode", "BD");
        geoUrl.searchParams.set("language", "en");
        geoUrl.searchParams.set("format", "json");

        const geoResponse = await fetch(geoUrl);

        if (!geoResponse.ok) {
          continue;
        }

        const geoData = await geoResponse.json();

        const bangladeshResults = (geoData.results || []).filter(
          (result) => result.country_code === "BD"
        );

        if (bangladeshResults.length === 0) {
          continue;
        }

        const normalizedSearch = normalizePlaceName(searchTerm);

        bangladeshResults.sort((a, b) => {
          const aName = normalizePlaceName(a.name);
          const bName = normalizePlaceName(b.name);

          const aExact = aName === normalizedSearch ? 1 : 0;
          const bExact = bName === normalizedSearch ? 1 : 0;

          if (aExact !== bExact) return bExact - aExact;

          const aMatch = aName.startsWith(normalizedSearch) ? 1 : 0;
          const bMatch = bName.startsWith(normalizedSearch) ? 1 : 0;

          if (aMatch !== bMatch) return bMatch - aMatch;

          return (b.population || 0) - (a.population || 0);
        });

        place = bangladeshResults[0];

        if (place) break;
      }

      if (!place) {
        throw new Error(
          t(
            "No Bangladesh location was found. Try entering the district name in English.",
            "?????????? ?? ?????? ???? ????? ?????? ????? ??? ???????? ???? ?????? ????",
            isBangla
          )
        );
      }

      const forecastUrl = new URL(
        "https://api.open-meteo.com/v1/forecast"
      );

      forecastUrl.searchParams.set("latitude", place.latitude);
      forecastUrl.searchParams.set("longitude", place.longitude);

      forecastUrl.searchParams.set(
        "current",
        [
          "temperature_2m",
          "relative_humidity_2m",
          "apparent_temperature",
          "precipitation",
          "weather_code",
          "wind_speed_10m",
        ].join(",")
      );

      forecastUrl.searchParams.set(
        "hourly",
        "precipitation,precipitation_probability,temperature_2m"
      );

      forecastUrl.searchParams.set("forecast_days", "2");
      forecastUrl.searchParams.set("timezone", "auto");

      const forecastResponse = await fetch(forecastUrl);

      if (!forecastResponse.ok) {
        throw new Error(
          t(
            "Weather information could not be loaded.",
            "আবহাওয়ার তথ্য লোড করা যায়নি।",
            isBangla
          )
        );
      }

      const forecast = await forecastResponse.json();
      const hourly = forecast.hourly;
      const currentTime = forecast.current.time;

      const next24Hours = hourly.time
        .map((time, index) => ({
          time,
          precipitation: Number(
            hourly.precipitation[index] || 0
          ),
          probability: Number(
            hourly.precipitation_probability[index] || 0
          ),
          temperature: hourly.temperature_2m[index],
        }))
        .filter((item) => item.time >= currentTime)
        .slice(0, 24);

      const totalRainfall = next24Hours.reduce(
        (total, item) => total + item.precipitation,
        0
      );

      const maxRainProbability = Math.max(
        0,
        ...next24Hours.map((item) => item.probability)
      );

      setWeather({
        location: place.name,
        district: place.admin1 || "",
        country: place.country || "",
        current: forecast.current,
        next24Hours,
        totalRainfall,
        maxRainProbability,
        description: getWeatherDescription(
          forecast.current.weather_code,
          isBangla
        ),
      });

      setLastUpdated(new Date());
      setLocation(query);
    } catch (err) {
      setError(
        err.message ||
          t(
            "Weather information is unavailable.",
            "আবহাওয়ার তথ্য পাওয়া যায়নি।",
            isBangla
          )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(initialLocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadWeather();
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const advice = useMemo(
    () => buildAdvice(weather, selectedCrop, isBangla),
    [weather, selectedCrop, isBangla]
  );

  const WeatherIcon = weather
    ? weather.current.weather_code === 0
      ? Sun
      : [1, 2, 3].includes(weather.current.weather_code)
        ? CloudSun
        : [95, 96, 99].includes(weather.current.weather_code)
          ? CloudRain
          : Cloud
    : CloudSun;

  const harvestProgress = harvestTimeline
    ? Math.min(
        100,
        Math.round(
          (harvestTimeline.age / harvestTimeline.maxDays) * 100
        )
      )
    : 0;

  return (
    <div className="farmer-weather">
      <div className="farmer-weather-heading">
        <div>
          <span className="weather-eyebrow">
            FARMER WEATHER CENTER
          </span>

          <h2>
            {t("Weather & Farming Advisory", "আবহাওয়া ও কৃষি পরামর্শ", isBangla)}
          </h2>

          <p>
            {t(
              "Weather conditions, crop care and estimated harvest time for your area.",
              "তোমার এলাকার আবহাওয়া, ফসলের পরিচর্যা এবং সম্ভাব্য ফসল কাটার সময়।",
              isBangla
            )}
          </p>
        </div>

        <button
          type="button"
          className="weather-refresh-button"
          onClick={() => loadWeather()}
          disabled={loading}
        >
          {loading ? (
            <LoaderCircle size={17} className="weather-spin" />
          ) : (
            <RefreshCw size={17} />
          )}

          {t("Refresh", "রিফ্রেশ", isBangla)}
        </button>
      </div>

      <div className="weather-search">
        <MapPin size={19} />

        <input
          type="text"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") loadWeather();
          }}
          placeholder={t("Enter your area name", "তোমার এলাকার নাম লিখো", isBangla)}
          aria-label={t("Weather location", "আবহাওয়ার অবস্থান", isBangla)}
        />

        <button
          type="button"
          onClick={() => loadWeather()}
          disabled={loading}
        >
          {t("Search", "খুঁজুন", isBangla)}
        </button>
      </div>

      {error && (
        <div className="farmer-weather-error">
          <AlertCircle size={19} />
          {error}
        </div>
      )}

      {loading && !weather && (
        <div className="farmer-weather-loading">
          <LoaderCircle size={35} className="weather-spin" />
          <p>
            {t(
              "Loading weather information...",
              "আবহাওয়ার তথ্য লোড হচ্ছে...",
              isBangla
            )}
          </p>
        </div>
      )}

      {weather && (
        <>
          {/* Current weather */}
          <div className="weather-current-card">
            <div className="weather-current-top">
              <div>
                <span className="weather-location">
                  <MapPin size={15} />
                  {weather.location}, {weather.country}
                </span>

                <h3>{weather.description}</h3>

                <p>
                  {t("Current weather", "বর্তমান আবহাওয়া", isBangla)}
                </p>
              </div>

              <div className="weather-temperature">
                <WeatherIcon size={48} />
                <strong>
                  {formatNumber(
                    Math.round(weather.current.temperature_2m),
                    isBangla,
                    0
                  )}°C
                </strong>
              </div>
            </div>

            <div className="weather-metrics">
              <div>
                <Thermometer size={20} />
                <span>
                  {t("Feels like", "অনুভূত তাপমাত্রা", isBangla)}
                </span>
                <strong>
                  {formatNumber(weather.current.apparent_temperature, isBangla)}°C
                </strong>
              </div>

              <div>
                <Droplets size={20} />
                <span>{t("Humidity", "আর্দ্রতা", isBangla)}</span>
                <strong>
                  {formatNumber(weather.current.relative_humidity_2m, isBangla, 0)}%
                </strong>
              </div>

              <div>
                <Wind size={20} />
                <span>{t("Wind speed", "বাতাসের গতি", isBangla)}</span>
                <strong>
                  {formatNumber(weather.current.wind_speed_10m, isBangla)} km/h
                </strong>
              </div>

              <div>
                <CloudRain size={20} />
                <span>
                  {t("Next 24-hour rainfall", "আগামী ২৪ ঘণ্টার বৃষ্টি", isBangla)}
                </span>
                <strong>
                  {formatNumber(weather.totalRainfall, isBangla)} mm
                </strong>
              </div>
            </div>
          </div>

          {/* Rain forecast */}
          <div className="weather-forecast-panel">
            <div className="weather-panel-heading">
              <h3>
                <CloudRain size={20} />
                {t(
                  "Next 24-hour Rain Forecast",
                  "আগামী ২৪ ঘণ্টার বৃষ্টির পূর্বাভাস",
                  isBangla
                )}
              </h3>

              <span>
                {t("Maximum probability", "সর্বোচ্চ সম্ভাবনা", isBangla)}:{" "}
                {formatNumber(weather.maxRainProbability, isBangla, 0)}%
              </span>
            </div>

            <div className="weather-hourly-list">
              {weather.next24Hours
                .filter((_, index) => index % 3 === 0)
                .slice(0, 8)
                .map((hour) => (
                  <div key={hour.time} className="weather-hour">
                    <span>
                      {new Date(hour.time).toLocaleTimeString(
                        isBangla ? "bn-BD" : "en-US",
                        {
                          hour: "numeric",
                          hour12: true,
                        }
                      )}
                    </span>

                    <CloudRain size={21} />

                    <strong>
                      {formatNumber(hour.precipitation, isBangla)} mm
                    </strong>

                    <small>
                      {formatNumber(hour.probability, isBangla, 0)}%
                    </small>
                  </div>
                ))}
            </div>
          </div>

          {/* Farmer crop advisory */}
          <div className="weather-crop-panel">
            <div className="weather-panel-heading">
              <h3>
                <Sprout size={21} />
                {t("Advice for Your Crops", "তোমার ফসল অনুযায়ী পরামর্শ", isBangla)}
              </h3>
            </div>

            {cropOptions.length === 0 ? (
              <div className="weather-no-crops">
                <Sprout size={35} />

                <h4>
                  {t("No crops added yet", "এখনো কোনো ফসল যোগ করা হয়নি", isBangla)}
                </h4>

                <p>
                  {t(
                    "Add crops from My Crops to see weather-based advice and harvest timelines here.",
                    "My Crops থেকে তোমার ফসল যোগ করলে এখানে আবহাওয়াভিত্তিক পরামর্শ ও ফসল কাটার সম্ভাব্য সময় দেখতে পারবে।",
                    isBangla
                  )}
                </p>
              </div>
            ) : (
              <>
                <div className="weather-crop-select">
                  <label htmlFor="weather-crop-select">
                    {t("Select a crop from My Crops", "My Crops থেকে ফসল নির্বাচন করো", isBangla)}
                  </label>

                  <select
                    id="weather-crop-select"
                    value={selectedCropId}
                    onChange={(event) =>
                      setSelectedCropId(event.target.value)
                    }
                  >
                    {cropOptions.map((crop) => (
                      <option
                        key={crop.selectionId}
                        value={crop.selectionId}
                      >
                        {crop.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCrop && (
                  <>
                    {/* Selected crop information */}
                    <div className="selected-weather-crop">
                      <div className="selected-crop-icon">
                        <Leaf size={23} />
                      </div>

                      <div>
                        <strong>{selectedCrop.displayName}</strong>

                        <span>
                          <LandPlot size={14} />
                          {t("Land area", "জমির পরিমাণ", isBangla)}:{" "}
                          {selectedCrop.land_area || "N/A"}{" "}
                          {selectedCrop.land_unit || "ACRE"}
                        </span>

                        <span>
                          <CalendarDays size={14} />
                          {t("Planting date", "রোপণের তারিখ", isBangla)}:{" "}
                          {formatDate(selectedCrop.planting_date, isBangla)}
                        </span>

                        <span>
                          <Clock size={14} />
                          {t("Crop age", "ফসলের বয়স", isBangla)}:{" "}
                          {selectedCrop.cropAge === null
                            ? t("Not available", "তথ্য নেই", isBangla)
                            : `${formatNumber(selectedCrop.cropAge, isBangla, 0)} ${t("days", "দিন", isBangla)}`}
                        </span>
                      </div>
                    </div>

                    {/* Harvest timeline */}
                    <div className="harvest-timeline-panel">
                      <div className="harvest-timeline-heading">
                        <div>
                          <span>HARVEST PLANNER</span>
                          <h3>
                            <Wheat size={22} />
                            {t("Estimated Harvest Period", "ফসল কাটার সম্ভাব্য সময়", isBangla)}
                          </h3>
                        </div>

                        <CalendarCheck size={29} />
                      </div>

                      {harvestTimeline ? (
                        <>
                          <div
                            className={`harvest-status ${harvestTimeline.status}`}
                          >
                            <CheckCircle size={19} />
                            <strong>{harvestTimeline.statusText}</strong>
                          </div>

                          <p className="harvest-description">
                            {harvestTimeline.description}
                          </p>

                          <div className="harvest-stats">
                            <div>
                              <span>{t("Crop age", "ফসলের বয়স", isBangla)}</span>
                              <strong>
                                {formatNumber(harvestTimeline.age, isBangla, 0)}{" "}
                                {t("days", "দিন", isBangla)}
                              </strong>
                            </div>

                            <div>
                              <span>{t("Estimated duration", "আনুমানিক সময়", isBangla)}</span>
                              <strong>
                                {harvestTimeline.minDays === harvestTimeline.maxDays
                                  ? `${formatNumber(harvestTimeline.minDays, isBangla, 0)} ${t("days", "দিন", isBangla)}`
                                  : `${formatNumber(harvestTimeline.minDays, isBangla, 0)}–${formatNumber(harvestTimeline.maxDays, isBangla, 0)} ${t("days", "দিন", isBangla)}`}
                              </strong>
                            </div>

                            <div>
                              <span>
                                {harvestTimeline.status === "growing"
                                  ? t("Time remaining", "আরও অপেক্ষা", isBangla)
                                  : harvestTimeline.status === "ready"
                                    ? t("Current status", "বর্তমান অবস্থা", isBangla)
                                    : t("Past estimated period", "সম্ভাব্য সময় পার", isBangla)}
                              </span>

                              <strong>
                                {harvestTimeline.status === "growing"
                                  ? `${formatNumber(harvestTimeline.daysUntilStart, isBangla, 0)} ${t("days", "দিন", isBangla)}`
                                  : harvestTimeline.status === "ready"
                                    ? t("Check crop maturity", "এখন পরিপক্বতা যাচাই করো", isBangla)
                                    : `${formatNumber(Math.abs(harvestTimeline.daysUntilEnd), isBangla, 0)} ${t("days", "দিন", isBangla)}`}
                              </strong>
                            </div>
                          </div>

                          <div className="harvest-date-range">
                            <div>
                              <CalendarDays size={19} />
                              <span>
                                {t("Estimated start", "সম্ভাব্য শুরু", isBangla)}
                                <strong>
                                  {formatDate(harvestTimeline.startDate, isBangla)}
                                </strong>
                              </span>
                            </div>

                            <div>
                              <CalendarCheck size={19} />
                              <span>
                                {t("Estimated end", "সম্ভাব্য শেষ", isBangla)}
                                <strong>
                                  {formatDate(harvestTimeline.endDate, isBangla)}
                                </strong>
                              </span>
                            </div>
                          </div>

                          <div className="harvest-progress">
                            <div className="harvest-progress-label">
                              <span>
                                {t("Crop timeline progress", "ফসলের সময়কাল", isBangla)}
                              </span>
                              <strong>
                                {formatNumber(harvestProgress, isBangla, 0)}%
                              </strong>
                            </div>

                            <div className="harvest-progress-track">
                              <div
                                className="harvest-progress-fill"
                                style={{ width: `${harvestProgress}%` }}
                              />
                            </div>
                          </div>

                          <div className="harvest-tips">
                            <strong>
                              <Info size={17} />
                              {t("What to check before harvesting", "ফসল কাটার আগে যা যাচাই করবে", isBangla)}
                            </strong>

                            <ul>
                              <li>
                                {t(
                                  "Check crop maturity and natural color.",
                                  "ফসলের পরিপক্বতা ও স্বাভাবিক রং পরীক্ষা করো।",
                                  isBangla
                                )}
                              </li>
                              <li>
                                {t(
                                  "Consider field conditions and the weather forecast.",
                                  "জমির অবস্থা ও আবহাওয়ার পূর্বাভাস বিবেচনা করো।",
                                  isBangla
                                )}
                              </li>
                              <li>
                                {t(
                                  "Follow local agricultural advice for your crop variety.",
                                  "ফসলের জাত অনুযায়ী স্থানীয় কৃষি পরামর্শ নাও।",
                                  isBangla
                                )}
                              </li>
                              <li>
                                {t(
                                  "Do not harvest based only on counting days.",
                                  "শুধু দিন গণনা করে ফসল কেটো না।",
                                  isBangla
                                )}
                              </li>
                            </ul>
                          </div>

                          <p className="harvest-source-note">
                            {harvestTimeline.source === "database"
                              ? t(
                                  "This duration is based on the saved crop duration information.",
                                  "এই সময় তোমার Crop-এর সংরক্ষিত duration তথ্য থেকে নেওয়া হয়েছে।",
                                  isBangla
                                )
                              : t(
                                  "This is a general estimate and may vary by crop variety and season.",
                                  "এটি সাধারণ আনুমানিক সময়; ফসলের জাত ও মৌসুম অনুযায়ী পরিবর্তিত হতে পারে।",
                                  isBangla
                                )}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="harvest-unavailable">
                            <Info size={22} />

                            <div>
                              <strong>
                                {t(
                                  "Harvest timeline unavailable",
                                  "ফসল কাটার সময় নির্ধারণ করা যায়নি",
                                  isBangla
                                )}
                              </strong>

                              <p>
                                {t(
                                  "The planting date or crop duration is unavailable. Add accurate duration information to see an estimated harvest date.",
                                  "এই ফসলের রোপণের তারিখ অথবা ফসল কাটার সময়কাল পাওয়া যায়নি। Crop-এর সঠিক duration তথ্য যোগ করলে এখানে সম্ভাব্য ফসল কাটার তারিখ দেখানো যাবে।",
                                  isBangla
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="harvest-date-range">
                            <div>
                              <CalendarDays size={19} />

                              <span>
                                {t("Estimated start", "সম্ভাব্য শুরু", isBangla)}

                                <strong>
                                  {t("Information unavailable", "তথ্য নেই", isBangla)}
                                </strong>
                              </span>
                            </div>

                            <div>
                              <CalendarCheck size={19} />

                              <span>
                                {t("Estimated end", "সম্ভাব্য শেষ", isBangla)}

                                <strong>
                                  {t("Information unavailable", "তথ্য নেই", isBangla)}
                                </strong>
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Irrigation and fertilizer advice */}
                    {advice && (
                      <div className="weather-advice-grid">
                        <div
                          className={`weather-advice-card ${advice.irrigation.type}`}
                        >
                          <Droplets size={25} />

                          <span>
                            {t("Irrigation Advice", "সেচের পরামর্শ", isBangla)}
                          </span>

                          <h4>{advice.irrigation.title}</h4>
                          <p>{advice.irrigation.description}</p>

                          <div className="weather-action-box">
                            <strong>
                              <CheckCircle size={17} />
                              {t("What to do today", "আজ তোমার করণীয়", isBangla)}
                            </strong>

                            <ul>
                              {advice.irrigation.actions.map((action, index) => (
                                <li key={index}>{action}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div
                          className={`weather-advice-card ${advice.fertilizer.type}`}
                        >
                          <Sprout size={25} />

                          <span>
                            {t("Fertilizer Advice", "সার প্রয়োগের পরামর্শ", isBangla)}
                          </span>

                          <h4>{advice.fertilizer.title}</h4>
                          <p>{advice.fertilizer.description}</p>

                          <div className="weather-action-box">
                            <strong>
                              <CheckCircle size={17} />
                              {t("What to do today", "আজ তোমার করণীয়", isBangla)}
                            </strong>

                            <ul>
                              {advice.fertilizer.actions.map((action, index) => (
                                <li key={index}>{action}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* Disclaimer */}
          <div className="weather-disclaimer">
            <AlertCircle size={19} />

            <p>
              {t(
                "Weather-based advice is for general guidance only. The harvest timeline is also an estimate. Consider crop variety, season, soil conditions and advice from a local agricultural officer before making decisions. Do not harvest based only on the estimated number of days.",
                "আবহাওয়াভিত্তিক পরামর্শ প্রাথমিক নির্দেশনা মাত্র। ফসল কাটার সময়ও আনুমানিক। ফসলের জাত, মৌসুম, মাটির অবস্থা ও স্থানীয় কৃষি কর্মকর্তার পরামর্শ বিবেচনা করে চূড়ান্ত সিদ্ধান্ত নাও। শুধু দিন গণনা করে ফসল কেটো না।",
                isBangla
              )}
            </p>
          </div>

          {lastUpdated && (
            <p className="weather-updated">
              {t("Last updated", "সর্বশেষ আপডেট", isBangla)}:{" "}
              {lastUpdated.toLocaleString(isBangla ? "bn-BD" : "en-US")}
              {" · "}
              {t(
                "Automatic refresh every 15 minutes",
                "প্রতি ১৫ মিনিটে স্বয়ংক্রিয়ভাবে আপডেট হয়",
                isBangla
              )}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default FarmerWeatherAdvisory;
