import { useEffect } from "react";

import { useTranslation } from "next-i18next";

import { I18N_LNG_LOCAL_STORAGE_KEY } from "@/shared/constants/app.constants";

export const useSubscribeToLanguageStorageEvents = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const isLanguageChangeEvent = (event: StorageEvent): boolean =>
      Boolean(event.key === I18N_LNG_LOCAL_STORAGE_KEY && event.newValue);

    const handleLanguageChangeEvent = (event: StorageEvent) => {
      if (!isLanguageChangeEvent(event)) {
        return;
      }

      i18n.changeLanguage(event.newValue!);
    };

    window.addEventListener("storage", handleLanguageChangeEvent);

    return () => {
      window.removeEventListener("storage", handleLanguageChangeEvent);
    };
  }, [i18n]);
};
