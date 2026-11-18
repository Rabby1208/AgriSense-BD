import { useCallback, useState } from "react";

// কৃষকের জমির মূল তথ্য ব্রাউজারে (localStorage) রাখে। Login বা সার্ভার লাগে না।
// তথ্য শুধু এই ডিভাইসেই থাকে।

const STORAGE_KEY = "agrisense-bd-farmer-profile-v1";

const EMPTY_PROFILE = {
  upazilaId: "",
  cropId: "",
  plantingDate: "",
};

function readProfile() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_PROFILE;

    const parsed = JSON.parse(raw);

    return {
      upazilaId: typeof parsed.upazilaId === "string" ? parsed.upazilaId : "",
      cropId: typeof parsed.cropId === "string" ? parsed.cropId : "",
      plantingDate:
        typeof parsed.plantingDate === "string" ? parsed.plantingDate : "",
    };
  } catch {
    return EMPTY_PROFILE;
  }
}

function writeProfile(profile) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // ব্রাউজার সংরক্ষণ বন্ধ থাকলে কিছু করার নেই; পেজ স্বাভাবিক চলবে।
  }
}

function useFarmerProfile() {
  const [profile, setProfile] = useState(readProfile);

  const updateProfile = useCallback((changes) => {
    setProfile((current) => {
      const next = { ...current, ...changes };
      writeProfile(next);
      return next;
    });
  }, []);

  const clearProfile = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // উপেক্ষা
    }
    setProfile(EMPTY_PROFILE);
  }, []);

  return { profile, updateProfile, clearProfile };
}

export default useFarmerProfile;