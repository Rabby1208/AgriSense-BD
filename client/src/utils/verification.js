// =====================================================
// AGRISENSE BD — তথ্য যাচাইয়ের নিয়ম
// একটি তথ্য তখনই "যাচাইকৃত" ধরা হবে যখন:
//   ১. status ঠিক "VERIFIED" লেখা থাকবে, এবং
//   ২. source-এ সংস্থা (organization) ও নথির নাম (document) থাকবে।
// "TODO_VERIFY", null বা ফাঁকা থাকলে তথ্যটি কখনো পরামর্শ হিসেবে দেখানো হবে না।
// =====================================================

export const VERIFIED_STATUS = "VERIFIED";
export const UNVERIFIED_TEXT = "তথ্য যাচাই করা হয়নি";

export function hasValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function hasSource(source) {
  return Boolean(
    source && hasValue(source.organization) && hasValue(source.document)
  );
}

export function isVerified(status, source) {
  return (
    String(status ?? "").toUpperCase() === VERIFIED_STATUS &&
    hasSource(source)
  );
}

// { value, status, source } আকারের ঘরের জন্য
export function isFieldVerified(field) {
  if (!field) return false;
  return hasValue(field.value) && isVerified(field.status, field.source);
}

// যাচাইকৃত হলে মান ফেরত দেয়, নইলে null
export function getVerifiedValue(field) {
  return isFieldVerified(field) ? field.value : null;
}

// শুধু http/https লিংক গ্রহণযোগ্য
export function isSafeUrl(url) {
  return typeof url === "string" && /^https?:\/\//i.test(url.trim());
}