import type { Language, TextLanguage } from "@/contexts/LanguageContext";

/** Get the text in the current language,
 *  Used for type safety
 */
export const getText = (texts: TextLanguage, language: Language) => {
  return texts[language];
};
