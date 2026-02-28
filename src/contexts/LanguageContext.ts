import React, { createContext } from "react";

export type Language = "en" | "fr";

export interface LanguageContextType {
  language: Language;
  setLanguage: React.Dispatch<React.SetStateAction<Language>>;
}

/** Object containing text in different languages */
export type TextLanguage = {
  [key in Language]: string;
};

export const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
});
