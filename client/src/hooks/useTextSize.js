import { useCallback, useEffect, useSyncExternalStore } from "react";

// লেখা বড়-ছোট করার সুবিধা। পছন্দ ব্রাউজারে (localStorage) থাকে।
// সব স্টাইল px-এ লেখা, তাই #root-এ CSS `zoom` ব্যবহার করা হয়েছে।
// জরুরি: পুরোনো কিছু ব্রাউজারে (যেমন Firefox ১২৬-এর আগের সংস্করণ) এটি কাজ করবে না।

const STORAGE_KEY = "agrisense-bd-text-size-v1";
const LEVELS = [100, 115, 130];

function readStoredSize() {
  try {
    const stored = Number(window.localStorage.getItem(STORAGE_KEY));
    return LEVELS.includes(stored) ? stored : 100;
  } catch {
    return 100;
  }
}

let currentSize = typeof window === "undefined" ? 100 : readStoredSize();
const listeners = new Set();

function subscribe(callback) {
  listeners.add(callback);

  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot() {
  return currentSize;
}

function setSize(next) {
  currentSize = next;

  try {
    window.localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    // সংরক্ষণ বন্ধ থাকলে কিছু করার নেই; এই সেশনে কাজ করবে।
  }

  listeners.forEach((listener) => listener());
}

function useTextSize() {
  const size = useSyncExternalStore(subscribe, getSnapshot, () => 100);

  // ডিসপ্লেতে প্রয়োগ
  useEffect(() => {
    const root = document.getElementById("root");

    if (root) root.style.zoom = size === 100 ? "" : `${size}%`;
  }, [size]);

  // ১০০% -> ১১৫% -> ১৩০% -> আবার ১০০%
  const cycle = useCallback(() => {
    const index = LEVELS.indexOf(currentSize);
    setSize(LEVELS[(index + 1) % LEVELS.length]);
  }, []);

  return { size, cycle };
}

export default useTextSize;