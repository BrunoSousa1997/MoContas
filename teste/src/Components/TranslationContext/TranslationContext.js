// TranslationContext.js
import { createContext } from "react";
import { translations } from "../../translations";

export const TranslationContext = createContext({
  lang: "pt",
  t: translations["pt"],
  setLang: () => {}
});
