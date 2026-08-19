import { ELocale } from "@/shared/typedefs/enums";

export const LANGUAGE_SELECTOR_OPTIONS: Array<{
  value: ELocale;
  label: string;
}> = [
  { value: ELocale.ENGLISH, label: "English" },
  { value: ELocale.ARABIC, label: "العربية" },
  { value: ELocale.FRENCH, label: "Français" },
];
