export type Lang = "en" | "hi" | "ta";

export const translations = {
  en: {
    nav: { detect: "Detect", dashboard: "Dashboard", tips: "Tips", login: "Sign in", logout: "Sign out" },
    hero: {
      tag: "AI for farmers",
      title: "Spot crop disease before it spreads.",
      sub: "Snap a leaf. AgroAI tells you what's wrong, how serious it is, and exactly how to treat it — in seconds.",
      cta: "Analyze a leaf",
      cta2: "View dashboard",
    },
    features: {
      title: "Built for the field",
      a: { t: "Instant diagnosis", d: "Vision AI identifies 38+ plant conditions across major crops." },
      b: { t: "Actionable treatment", d: "Step-by-step organic and chemical options tailored to the disease." },
      c: { t: "Track every scan", d: "History and trend charts to monitor crop health over time." },
      d: { t: "Speak your language", d: "English, हिन्दी, தமிழ் — switch with one tap." },
    },
    detect: {
      title: "Analyze a leaf",
      sub: "Upload a clear photo of an affected leaf, or use your camera.",
      drop: "Drop image here, or click to upload",
      camera: "Use camera",
      capture: "Capture",
      stop: "Stop camera",
      analyze: "Analyze",
      analyzing: "Analyzing leaf…",
      reset: "Try another",
    },
    result: {
      healthy: "Healthy",
      diseased: "Disease detected",
      confidence: "Confidence",
      severity: "Severity",
      about: "About",
      treatment: "Treatment",
      prevention: "Prevention",
      save: "Save to history",
      saved: "Saved to your history",
    },
    dash: {
      title: "Your crop health dashboard",
      total: "Total scans", diseased: "Diseased", healthy: "Healthy", topDisease: "Top issue",
      recent: "Recent scans", trend: "Scans over time", breakdown: "Disease breakdown", empty: "No scans yet — analyze a leaf to begin.",
    },
    tips: { title: "Farmer best practices" },
  },
  hi: {
    nav: { detect: "जाँच", dashboard: "डैशबोर्ड", tips: "सुझाव", login: "साइन इन", logout: "साइन आउट" },
    hero: {
      tag: "किसानों के लिए AI",
      title: "फैलने से पहले रोग पहचानें।",
      sub: "पत्ती की तस्वीर लें। AgroAI सेकंड में बताएगा क्या समस्या है और कैसे ठीक करें।",
      cta: "पत्ती जाँचें",
      cta2: "डैशबोर्ड देखें",
    },
    features: {
      title: "खेत के लिए बना",
      a: { t: "तुरंत निदान", d: "AI 38+ फसल रोगों की पहचान करता है।" },
      b: { t: "उपचार सलाह", d: "जैविक और रासायनिक उपाय कदम-दर-कदम।" },
      c: { t: "हर जाँच रिकॉर्ड", d: "इतिहास और चार्ट से फसल स्वास्थ्य ट्रैक करें।" },
      d: { t: "अपनी भाषा", d: "English, हिन्दी, தமிழ் — एक टैप में बदलें।" },
    },
    detect: {
      title: "पत्ती की जाँच करें",
      sub: "स्पष्ट फोटो अपलोड करें या कैमरा उपयोग करें।",
      drop: "यहाँ छवि डालें, या क्लिक करें",
      camera: "कैमरा खोलें",
      capture: "खींचें",
      stop: "बंद करें",
      analyze: "विश्लेषण करें",
      analyzing: "विश्लेषण हो रहा है…",
      reset: "नई जाँच",
    },
    result: {
      healthy: "स्वस्थ",
      diseased: "रोग मिला",
      confidence: "विश्वास",
      severity: "गंभीरता",
      about: "विवरण",
      treatment: "उपचार",
      prevention: "रोकथाम",
      save: "इतिहास में सहेजें",
      saved: "सहेजा गया",
    },
    dash: {
      title: "फसल स्वास्थ्य डैशबोर्ड",
      total: "कुल जाँच", diseased: "रोगग्रस्त", healthy: "स्वस्थ", topDisease: "मुख्य समस्या",
      recent: "हाल की जाँच", trend: "समय के साथ", breakdown: "रोग वितरण", empty: "अभी कोई जाँच नहीं।",
    },
    tips: { title: "किसान सर्वोत्तम अभ्यास" },
  },
  ta: {
    nav: { detect: "சோதி", dashboard: "டாஷ்போர்டு", tips: "ஆலோசனை", login: "உள்நுழை", logout: "வெளியேறு" },
    hero: {
      tag: "விவசாயிகளுக்கான AI",
      title: "நோய் பரவுவதற்கு முன் கண்டறி.",
      sub: "இலையை படமெடு. AgroAI உடனே நோய் மற்றும் சிகிச்சை சொல்கிறது.",
      cta: "இலையை சோதி",
      cta2: "டாஷ்போர்டு பார்",
    },
    features: {
      title: "வயலுக்காக உருவாக்கப்பட்டது",
      a: { t: "உடனடி கண்டறிதல்", d: "38+ பயிர் நோய்களை AI அடையாளம் காட்டுகிறது." },
      b: { t: "சிகிச்சை வழிகாட்டி", d: "இயற்கை மற்றும் இரசாயன தீர்வுகள்." },
      c: { t: "எல்லா சோதனையும் பதிவு", d: "வரலாறு மற்றும் வரைபடங்கள்." },
      d: { t: "உங்கள் மொழி", d: "English, हिन्दी, தமிழ்." },
    },
    detect: {
      title: "இலையை சோதி",
      sub: "தெளிவான இலை படத்தை பதிவேற்றவும் அல்லது கேமராவை பயன்படுத்தவும்.",
      drop: "இங்கே படத்தை இடவும், அல்லது கிளிக் செய்யவும்",
      camera: "கேமரா",
      capture: "எடு",
      stop: "நிறுத்து",
      analyze: "பகுப்பாய்வு",
      analyzing: "பகுப்பாய்வு செய்கிறது…",
      reset: "மீண்டும் சோதி",
    },
    result: {
      healthy: "ஆரோக்கியம்",
      diseased: "நோய் கண்டறியப்பட்டது",
      confidence: "நம்பிக்கை",
      severity: "கடுமை",
      about: "விவரம்",
      treatment: "சிகிச்சை",
      prevention: "தடுப்பு",
      save: "வரலாற்றில் சேமி",
      saved: "சேமிக்கப்பட்டது",
    },
    dash: {
      title: "பயிர் சுகாதார டாஷ்போர்டு",
      total: "மொத்த சோதனை", diseased: "நோயுற்ற", healthy: "ஆரோக்கியம்", topDisease: "முக்கிய பிரச்சினை",
      recent: "சமீபத்திய சோதனைகள்", trend: "காலப்போக்கில்", breakdown: "நோய் பகுப்பு", empty: "இன்னும் சோதனை இல்லை.",
    },
    tips: { title: "விவசாய சிறந்த நடைமுறைகள்" },
  },
} as const;

const KEY = "agroai_lang";
export function getLang(): Lang {
  if (typeof window === "undefined") return "en";
  return ((localStorage.getItem(KEY) as Lang) || "en");
}
export function setLang(l: Lang) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, l);
}

import { useEffect, useState } from "react";
export function useT() {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => { setLangState(getLang()); }, []);
  const change = (l: Lang) => { setLang(l); setLangState(l); };
  return { t: translations[lang], lang, setLang: change };
}