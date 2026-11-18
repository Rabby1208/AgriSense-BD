import { Info } from "lucide-react";

function UnavailableNotice({
  title = "তথ্য যাচাই করা হয়নি",
  message = "এই তথ্যের জন্য পর্যাপ্ত যাচাইকৃত উৎস এখনো যুক্ত হয়নি, তাই কোনো পরামর্শ দেখানো হচ্ছে না।",
}) {
  return (
    <div className="ui-unavailable" role="status">
      <div className="ui-unavailable-icon">
        <Info size={20} />
      </div>

      <div>
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default UnavailableNotice;