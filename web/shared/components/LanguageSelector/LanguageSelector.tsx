import { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";

import { I18N_LNG_LOCAL_STORAGE_KEY } from "@/shared/constants/app.constants";
import { ELocale } from "@/shared/typedefs/enums";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../shadui/select";
import { LANGUAGE_SELECTOR_OPTIONS } from "./LanguageSelector.constants";

export const LanguageSelector = () => {
  const router = useRouter();
  const { i18n, t } = useTranslation();
  const [value, setValue] = useState(i18n.language ?? ELocale.ENGLISH);

  const changeLocale = useCallback(
    (locale: string) => {
      if (!router || !router.isReady || locale === router.locale) {
        return;
      }

      router.push(
        {
          pathname: router.pathname,
          query: router.query,
        },
        router.asPath,
        { locale },
      );
    },
    [router],
  );

  useEffect(() => {
    if (router.locale === value) {
      return;
    }

    changeLocale(value);
    i18n.changeLanguage(value);
    window.localStorage.setItem(I18N_LNG_LOCAL_STORAGE_KEY, value);
  }, [router, value, i18n, changeLocale]);

  useEffect(() => {
    if (i18n.language === value) {
      return;
    }

    setValue(i18n.language);
  }, [i18n.language, value]);

  const handleLanguageChange = (newValue: string | null) => {
    if (newValue) {
      setValue(newValue);
    }
  };

  return (
    <Select onValueChange={handleLanguageChange} value={value}>
      <SelectTrigger className="w-full">
        <SelectValue
          placeholder={t("selectLanguage")}
          renderValue={(selectedValue) =>
            LANGUAGE_SELECTOR_OPTIONS.find((opt) => opt.value === selectedValue)?.label
          }
        />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {LANGUAGE_SELECTOR_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
