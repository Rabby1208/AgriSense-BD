// সমর্থিত এলাকার তালিকা ও স্থানাঙ্ক (এক জায়গায়)।
// নতুন এলাকা যোগ করতে হলে প্রকল্প-অনুমোদন নিয়ে এখানে যোগ করুন।

export const LOCATION_OPTIONS = [
  {
    districtId: "gazipur",
    district: "গাজীপুর",
    upazilaId: "gazipur_sadar",
    upazila: "গাজীপুর সদর",
    latitude: 24.0023,
    longitude: 90.4264,
  },
  {
    districtId: "dhaka",
    district: "ঢাকা",
    upazilaId: "savar",
    upazila: "সাভার",
    latitude: 23.8583,
    longitude: 90.2667,
  },
  {
    districtId: "bogura",
    district: "বগুড়া",
    upazilaId: "bogura_sadar",
    upazila: "বগুড়া সদর",
    latitude: 24.8465,
    longitude: 89.3773,
  },
];

export function findLocation(upazilaId) {
  return LOCATION_OPTIONS.find((item) => item.upazilaId === upazilaId) ?? null;
}