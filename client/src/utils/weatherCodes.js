import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
} from "lucide-react";

// WMO Weather Code অনুযায়ী আবহাওয়ার বর্ণনা (Open-Meteo-র weather_code)
export function getWeatherInfo(code) {
  if (code === 0) return { label: "পরিষ্কার আকাশ", Icon: Sun };
  if ([1, 2].includes(code)) return { label: "আংশিক মেঘলা", Icon: CloudSun };
  if (code === 3) return { label: "মেঘাচ্ছন্ন", Icon: Cloud };
  if ([45, 48].includes(code)) return { label: "কুয়াশা", Icon: CloudFog };

  if ([51, 53, 55, 56, 57].includes(code)) {
    return { label: "গুঁড়ি গুঁড়ি বৃষ্টি", Icon: CloudDrizzle };
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { label: "বৃষ্টি", Icon: CloudRain };
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { label: "তুষারপাত", Icon: CloudSnow };
  }

  if ([95, 96, 99].includes(code)) {
    return { label: "বজ্রঝড়", Icon: CloudLightning };
  }

  return { label: "আবহাওয়ার তথ্য", Icon: Cloud };
}