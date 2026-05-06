export type Lang = "en" | "hi" | "ta" | "kn";

export const translations = {
  en: {
    nav: { detect: "Detect", dashboard: "Dashboard", tips: "Tips", assistant: "Assistant", weather: "Weather", alerts: "Alerts", admin: "Admin", login: "Sign in", logout: "Sign out" },
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
    assistant: {
      title: "AI Farm Assistant",
      sub: "Ask anything about your crops, diseases, treatments, or weather.",
      placeholder: "e.g. Why are my tomato leaves turning yellow?",
      send: "Send",
      voice: "Speak",
      stop: "Stop",
      empty: "Hi! I'm your AgroAI assistant. Ask me anything about your crops.",
      clear: "Clear chat",
      thinking: "Thinking…",
    },
    weather: {
      title: "Weather & disease risk",
      sub: "5-day forecast with crop disease alerts based on temperature, humidity, and rainfall.",
      city: "City or village",
      gps: "Use my location",
      check: "Check forecast",
      forecast: "5-day forecast",
      risks: "Disease risk alerts",
      noRisk: "No major risks detected",
    },
    alerts: {
      title: "Alerts",
      empty: "No alerts yet — we'll notify you about disease and weather risks here.",
      markAll: "Mark all read",
      clear: "Clear all",
    },
    admin: { title: "Admin dashboard", forbidden: "Admin access required.", users: "Users", scans: "Total scans", topIssues: "Top diseases (all users)", recent: "Recent scans" },
  },
  hi: {
    nav: { detect: "जाँच", dashboard: "डैशबोर्ड", tips: "सुझाव", assistant: "सहायक", weather: "मौसम", alerts: "अलर्ट", admin: "एडमिन", login: "साइन इन", logout: "साइन आउट" },
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
    assistant: { title: "AI कृषि सहायक", sub: "फसल, रोग, उपचार के बारे में पूछें।", placeholder: "उदा. मेरी पत्तियाँ पीली क्यों हो रही हैं?", send: "भेजें", voice: "बोलें", stop: "रोकें", empty: "नमस्ते! मैं आपका AgroAI सहायक हूँ।", clear: "चैट साफ़", thinking: "सोच रहा हूँ…" },
    weather: { title: "मौसम और रोग जोखिम", sub: "5-दिन का पूर्वानुमान।", city: "शहर/गाँव", gps: "मेरा स्थान", check: "जाँचें", forecast: "5-दिन पूर्वानुमान", risks: "रोग चेतावनी", noRisk: "कोई जोखिम नहीं" },
    alerts: { title: "अलर्ट", empty: "अभी कोई अलर्ट नहीं।", markAll: "सब पढ़ा हुआ", clear: "सब साफ़" },
    admin: { title: "एडमिन डैशबोर्ड", forbidden: "एडमिन एक्सेस आवश्यक।", users: "उपयोगकर्ता", scans: "कुल जाँच", topIssues: "मुख्य रोग", recent: "हाल की जाँच" },
  },
  ta: {
    nav: { detect: "சோதி", dashboard: "டாஷ்போர்டு", tips: "ஆலோசனை", assistant: "உதவியாளர்", weather: "வானிலை", alerts: "எச்சரிக்கை", admin: "நிர்வாகி", login: "உள்நுழை", logout: "வெளியேறு" },
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
    assistant: { title: "AI விவசாய உதவியாளர்", sub: "பயிர், நோய் பற்றி கேளுங்கள்.", placeholder: "உதா. ஏன் இலைகள் மஞ்சளாகின்றன?", send: "அனுப்பு", voice: "பேசு", stop: "நிறுத்து", empty: "வணக்கம்! நான் உங்கள் AgroAI உதவியாளர்.", clear: "அரட்டையை அழி", thinking: "சிந்திக்கிறேன்…" },
    weather: { title: "வானிலை மற்றும் நோய் ஆபத்து", sub: "5-நாள் முன்னறிவிப்பு.", city: "நகரம்/கிராமம்", gps: "என் இடம்", check: "சோதி", forecast: "5-நாள் முன்னறிவிப்பு", risks: "நோய் எச்சரிக்கை", noRisk: "ஆபத்து இல்லை" },
    alerts: { title: "எச்சரிக்கைகள்", empty: "எச்சரிக்கை இல்லை.", markAll: "எல்லாம் படித்தது", clear: "அழி" },
    admin: { title: "நிர்வாக டாஷ்போர்டு", forbidden: "நிர்வாகி அணுகல் தேவை.", users: "பயனர்கள்", scans: "மொத்த சோதனைகள்", topIssues: "முக்கிய நோய்கள்", recent: "சமீபத்திய" },
  },
  kn: {
    nav: { detect: "ಪರಿಶೀಲಿಸಿ", dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", tips: "ಸಲಹೆಗಳು", assistant: "ಸಹಾಯಕ", weather: "ಹವಾಮಾನ", alerts: "ಎಚ್ಚರಿಕೆಗಳು", admin: "ನಿರ್ವಾಹಕ", login: "ಸೈನ್ ಇನ್", logout: "ಸೈನ್ ಔಟ್" },
    hero: {
      tag: "ರೈತರಿಗಾಗಿ AI",
      title: "ರೋಗ ಹರಡುವ ಮೊದಲು ಗುರುತಿಸಿ.",
      sub: "ಎಲೆಯ ಫೋಟೋ ತೆಗೆಯಿರಿ. AgroAI ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಸಮಸ್ಯೆ ಮತ್ತು ಚಿಕಿತ್ಸೆ ತಿಳಿಸುತ್ತದೆ.",
      cta: "ಎಲೆ ಪರಿಶೀಲಿಸಿ",
      cta2: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ನೋಡಿ",
    },
    features: {
      title: "ಹೊಲಕ್ಕಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ",
      a: { t: "ತಕ್ಷಣದ ರೋಗನಿರ್ಣಯ", d: "AI 38+ ಬೆಳೆ ರೋಗಗಳನ್ನು ಗುರುತಿಸುತ್ತದೆ." },
      b: { t: "ಚಿಕಿತ್ಸಾ ಸಲಹೆ", d: "ಸಾವಯವ ಮತ್ತು ರಾಸಾಯನಿಕ ಪರಿಹಾರಗಳು." },
      c: { t: "ಪ್ರತಿ ಪರಿಶೀಲನೆ ದಾಖಲೆ", d: "ಇತಿಹಾಸ ಮತ್ತು ಚಾರ್ಟ್‌ಗಳ ಮೂಲಕ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ." },
      d: { t: "ನಿಮ್ಮ ಭಾಷೆ", d: "English, हिन्दी, தமிழ், ಕನ್ನಡ." },
    },
    detect: {
      title: "ಎಲೆ ಪರಿಶೀಲಿಸಿ",
      sub: "ಸ್ಪಷ್ಟ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ಕ್ಯಾಮೆರಾ ಬಳಸಿ.",
      drop: "ಇಲ್ಲಿ ಚಿತ್ರ ಬಿಡಿ ಅಥವಾ ಕ್ಲಿಕ್ ಮಾಡಿ",
      camera: "ಕ್ಯಾಮೆರಾ",
      capture: "ಸೆರೆಹಿಡಿಯಿರಿ",
      stop: "ನಿಲ್ಲಿಸಿ",
      analyze: "ವಿಶ್ಲೇಷಿಸಿ",
      analyzing: "ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ…",
      reset: "ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ",
    },
    result: {
      healthy: "ಆರೋಗ್ಯಕರ",
      diseased: "ರೋಗ ಪತ್ತೆಯಾಗಿದೆ",
      confidence: "ವಿಶ್ವಾಸ",
      severity: "ತೀವ್ರತೆ",
      about: "ವಿವರ",
      treatment: "ಚಿಕಿತ್ಸೆ",
      prevention: "ತಡೆಗಟ್ಟುವಿಕೆ",
      save: "ಇತಿಹಾಸಕ್ಕೆ ಉಳಿಸಿ",
      saved: "ಉಳಿಸಲಾಗಿದೆ",
    },
    dash: {
      title: "ಬೆಳೆ ಆರೋಗ್ಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      total: "ಒಟ್ಟು ಪರಿಶೀಲನೆ", diseased: "ರೋಗಗ್ರಸ್ತ", healthy: "ಆರೋಗ್ಯಕರ", topDisease: "ಮುಖ್ಯ ಸಮಸ್ಯೆ",
      recent: "ಇತ್ತೀಚಿನ ಪರಿಶೀಲನೆಗಳು", trend: "ಕಾಲಾನುಕ್ರಮ", breakdown: "ರೋಗ ವಿಭಜನೆ", empty: "ಇನ್ನೂ ಪರಿಶೀಲನೆ ಇಲ್ಲ.",
    },
    tips: { title: "ರೈತ ಉತ್ತಮ ಅಭ್ಯಾಸಗಳು" },
    assistant: { title: "AI ಕೃಷಿ ಸಹಾಯಕ", sub: "ಬೆಳೆ, ರೋಗ, ಚಿಕಿತ್ಸೆ ಬಗ್ಗೆ ಕೇಳಿ.", placeholder: "ಉದಾ. ನನ್ನ ಎಲೆಗಳು ಏಕೆ ಹಳದಿಯಾಗುತ್ತಿವೆ?", send: "ಕಳುಹಿಸಿ", voice: "ಮಾತನಾಡಿ", stop: "ನಿಲ್ಲಿಸಿ", empty: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AgroAI ಸಹಾಯಕ.", clear: "ಚಾಟ್ ಅಳಿಸಿ", thinking: "ಯೋಚಿಸುತ್ತಿದ್ದೇನೆ…" },
    weather: { title: "ಹವಾಮಾನ ಮತ್ತು ರೋಗ ಅಪಾಯ", sub: "5-ದಿನಗಳ ಮುನ್ಸೂಚನೆ.", city: "ನಗರ/ಗ್ರಾಮ", gps: "ನನ್ನ ಸ್ಥಳ", check: "ಪರಿಶೀಲಿಸಿ", forecast: "5-ದಿನಗಳ ಮುನ್ಸೂಚನೆ", risks: "ರೋಗ ಎಚ್ಚರಿಕೆ", noRisk: "ಯಾವುದೇ ಅಪಾಯವಿಲ್ಲ" },
    alerts: { title: "ಎಚ್ಚರಿಕೆಗಳು", empty: "ಇನ್ನೂ ಎಚ್ಚರಿಕೆ ಇಲ್ಲ.", markAll: "ಎಲ್ಲವನ್ನೂ ಓದಿದಂತೆ", clear: "ಎಲ್ಲ ಅಳಿಸಿ" },
    admin: { title: "ನಿರ್ವಾಹಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", forbidden: "ನಿರ್ವಾಹಕ ಪ್ರವೇಶ ಅಗತ್ಯ.", users: "ಬಳಕೆದಾರರು", scans: "ಒಟ್ಟು ಪರಿಶೀಲನೆ", topIssues: "ಮುಖ್ಯ ರೋಗಗಳು", recent: "ಇತ್ತೀಚಿನ" },
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