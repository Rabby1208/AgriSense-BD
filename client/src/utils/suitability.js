import { hasValue, isFieldVerified } from "./verification";

// ফসলের JSON-এর season_suitability থেকে যাচাইকৃত ও মিলে যাওয়া তথ্য বের করে।
//
// নিয়ম (কোনো তথ্য ধরে নেওয়া হয় না):
//  - suitability যাচাইকৃত (status "VERIFIED" + উৎস সহ) হতে হবে
//  - districts-এ নির্বাচিত জেলার district_id থাকতে হবে (locations.json-এর মান)
//  - soil_types-এ নির্বাচিত মাটির value থাকতে হবে; "জানি না" হলে কিছু মেলে না
//  - সেচের তথ্য entry-তে থাকলে নির্বাচিত সেচের সঙ্গে মিলতে হবে
//  - মাটির ধরন থেকে উর্বরতা অনুমান করা হয় না

export function getVerifiedSuitability(
  crop,
  { districtId, soilType, irrigation }
) {
  const entries = Array.isArray(crop?.season_suitability)
    ? crop.season_suitability
    : [];

  if (!districtId || !soilType || soilType === "unknown") {
    return [];
  }

  return entries.filter((entry) => {
    if (!isFieldVerified(entry.suitability)) return false;

    if (!hasValue(entry.districts) || !entry.districts.includes(districtId)) {
      return false;
    }

    if (!hasValue(entry.soil_types) || !entry.soil_types.includes(soilType)) {
      return false;
    }

    if (
      hasValue(entry.irrigation_availability) &&
      irrigation &&
      irrigation !== "unknown" &&
      entry.irrigation_availability !== irrigation
    ) {
      return false;
    }

    return true;
  });
}