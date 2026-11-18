import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

// ব্রাউজারের Web Speech API দিয়ে বাংলায় পড়ে শোনায়। কোনো বাইরের API লাগে না।
// জরুরি: সব ডিভাইসে বাংলা ভয়েস থাকে না। না থাকলে `canSpeak` false হবে।

const isSupported =
  typeof window !== "undefined" && "speechSynthesis" in window;

function subscribe(callback) {
  if (!isSupported) return () => {};

  window.speechSynthesis.addEventListener("voiceschanged", callback);

  return () => {
    window.speechSynthesis.removeEventListener("voiceschanged", callback);
  };
}

function findBengaliVoice() {
  if (!isSupported) return null;

  return (
    window.speechSynthesis
      .getVoices()
      .find((voice) => voice.lang.toLowerCase().startsWith("bn")) ?? null
  );
}

function getHasBengaliVoice() {
  return findBengaliVoice() !== null;
}

function useSpeech() {
  const hasBengaliVoice = useSyncExternalStore(
    subscribe,
    getHasBengaliVoice,
    () => false
  );

  const [speaking, setSpeaking] = useState(false);

  const stop = useCallback(() => {
    if (!isSupported) return;

    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback((text) => {
    const voice = findBengaliVoice();

    if (!isSupported || !voice || !text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, []);

  // পেজ ছেড়ে গেলে পড়া বন্ধ হবে
  useEffect(() => {
    return () => {
      if (isSupported) window.speechSynthesis.cancel();
    };
  }, []);

  return {
    supported: isSupported,
    canSpeak: isSupported && hasBengaliVoice,
    speaking,
    speak,
    stop,
  };
}

export default useSpeech;