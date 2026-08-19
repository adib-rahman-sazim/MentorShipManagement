const isLocal = process.env.NEXT_PUBLIC_STAGE_ENV === "local";

/** @type {import('next-i18next').UserConfig} */
const i18nConfig = {
  i18n: {
    defaultLocale: "en-US",
    locales: ["en-US", "ar-SA", "fr-FR"],
    localeDetection: false,
  },
  reloadOnPrerender: isLocal,
  pluralSeparator: "_",
};

export default i18nConfig;
