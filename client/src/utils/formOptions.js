// কৃষকের ফর্মে বাছাইয়ের তালিকা। এগুলো ইনপুটের বিভাগ, কৃষি-পরামর্শ নয়।
// ভবিষ্যতে JSON-এর soil_types ও irrigation_availability-তে হুবহু এই value লিখতে হবে।

export const SOIL_OPTIONS = [
  { value: "clay", label: "এঁটেল মাটি" },
  { value: "loamy", label: "দোআঁশ মাটি" },
  { value: "sandy", label: "বেলে মাটি" },
  { value: "silty", label: "পলি মাটি" },
  { value: "unknown", label: "জানি না" },
];

export const IRRIGATION_OPTIONS = [
  { value: "available", label: "হ্যাঁ, সেচের ব্যবস্থা আছে" },
  { value: "unavailable", label: "না, সেচের ব্যবস্থা নেই" },
  { value: "limited", label: "সীমিত সেচের ব্যবস্থা আছে" },
  { value: "unknown", label: "নিশ্চিত নই" },
];

export function getOptionLabel(options, value) {
  return options.find((option) => option.value === value)?.label ?? "";
}