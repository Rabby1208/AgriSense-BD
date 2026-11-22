import { Volume2, VolumeX, Info } from "lucide-react";
import useSpeech from "../hooks/useSpeech";
import "./ListenButton.css";

function ListenButton({ text, label = "বাংলায় শুনুন" }) {
  const { supported, canSpeak, speaking, speak, stop } = useSpeech();

  if (!supported) {
    return (
      <p className="listen-note">
        <Info size={15} />
        এই ব্রাউজারে শোনার সুবিধা নেই।
      </p>
    );
  }

  if (!canSpeak) {
    return (
      <p className="listen-note">
        <Info size={15} />
        এই ডিভাইসে বাংলা ভয়েস পাওয়া যায়নি, তাই শোনার সুবিধা চালু করা যাচ্ছে
        না। মোবাইলের সেটিংস থেকে বাংলা ভয়েস যোগ করলে চালু হতে পারে।
      </p>
    );
  }

  return (
    <button
      type="button"
      className="btn btn-outline listen-button"
      onClick={() => (speaking ? stop() : speak(text))}
      aria-pressed={speaking}
    >
      {speaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
      {speaking ? "থামান" : label}
    </button>
  );
}

export default ListenButton;