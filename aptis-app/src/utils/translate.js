// Utility to translate English text to Vietnamese with caching
const translationCache = {};

export async function translateToVietnamese(text) {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();
  if (!trimmed) return '';

  // Check in-memory cache
  if (translationCache[trimmed]) {
    return translationCache[trimmed];
  }

  // Check localStorage cache
  try {
    const saved = localStorage.getItem(`trans_${trimmed.slice(0, 40)}_${trimmed.length}`);
    if (saved) {
      translationCache[trimmed] = saved;
      return saved;
    }
  } catch (e) {}

  // 1. Try Google Translate Free API endpoint
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(trimmed)}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0].map(item => item[0]).join('');
        if (translated) {
          translationCache[trimmed] = translated;
          try {
            localStorage.setItem(`trans_${trimmed.slice(0, 40)}_${trimmed.length}`, translated);
          } catch (e) {}
          return translated;
        }
      }
    }
  } catch (err) {
    // Continue to fallback
  }

  // 2. Fallback to MyMemory API
  try {
    const fallbackUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed.slice(0, 500))}&langpair=en|vi`;
    const res = await fetch(fallbackUrl);
    if (res.ok) {
      const json = await res.json();
      if (json?.responseData?.translatedText) {
        const translated = json.responseData.translatedText;
        translationCache[trimmed] = translated;
        return translated;
      }
    }
  } catch (err) {}

  return 'Không thể tải bản dịch tự động. Vui lòng kiểm tra kết nối mạng.';
}
