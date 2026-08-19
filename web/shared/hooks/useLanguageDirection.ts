import { useEffect } from "react";

import { useTranslation } from "next-i18next";

export const useLanguageDirection = () => {
  const { i18n } = useTranslation();

  const dir = i18n.dir(i18n.language);

  useEffect(() => {
    document.body.dir = dir;
    document.documentElement.dir = dir;
  }, [dir]);

  return dir;
};
