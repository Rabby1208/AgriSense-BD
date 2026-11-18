// =====================================================
// AGRISENSE BD — জমির একক রূপান্তর (একটি জায়গায় সব হিসাব)
// ১ শতাংশ (ডেসিমেল) = ১/১০০ একর = ৪০.৪৬৮৫৬৪২২৪ বর্গমিটার
// ১ বিঘা = ৩৩ শতাংশ ধরা হয়েছে। বিঘার মাপ অঞ্চলভেদে ভিন্ন হতে পারে,
// তাই এই ধারণাটি ব্যবহারকারীকে সবসময় দেখাতে হবে।
// =====================================================

export const DECIMALS_PER_BIGHA = 33;

const SQUARE_METERS_PER_DECIMAL = 40.468564224;
const SQUARE_METERS_PER_HECTARE = 10000;

// ইনপুট থেকে সংখ্যা বের করে। ভুল বা ০ বা ঋণাত্মক হলে null।
export function parseLandDecimal(input) {
  if (input === null || input === undefined || String(input).trim() === "") {
    return null;
  }

  const value = Number(input);

  return Number.isFinite(value) && value > 0 ? value : null;
}

export function decimalToBigha(decimal) {
  return decimal / DECIMALS_PER_BIGHA;
}

export function decimalToHectare(decimal) {
  return (decimal * SQUARE_METERS_PER_DECIMAL) / SQUARE_METERS_PER_HECTARE;
}

// বাংলা অঙ্কে সংখ্যা দেখানোর জন্য
export function formatNumber(value, maximumFractionDigits = 2) {
  return Number(value).toLocaleString("bn-BD", { maximumFractionDigits });
}