import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./translations.en.json";
import cn from "./translations.cn.json";

const resources = {
  en: en,
  cn: cn
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
