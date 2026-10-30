import { COUNTRIES } from "../data/countries";
import type { Option } from "../types";

// Countries without any program (e.g. "Без страны") can't be insured, so they aren't offered
export const COUNTRY_OPTIONS: Option<number>[] = COUNTRIES.filter(
  (country) => country.programIds.length > 0,
).map((country) => ({ value: country.id, label: country.name }));

export const MAX_COUNTRIES = 5;

export type CoverType = "single" | "multi";

export const COVER_OPTIONS: Option<CoverType>[] = [
  { value: "single", label: "Однократное путешествие" },
  { value: "multi", label: "Многократное путешествие" },
];

export interface Activity {
  id: number;
  name: string;
}

// Kept in the API's { id, name } shape so it can later be replaced by a request
export const ACTIVITIES: readonly Activity[] = [
  { id: 0, name: "Туризм" },
  { id: 2, name: "Работа" },
  { id: 4, name: "Учёба" },
  { id: 1, name: "Спорт" },
];

export const PURPOSE_OPTIONS: Option<number>[] = ACTIVITIES.map(
  ({ id, name }) => ({
    value: id,
    label: name,
  }),
);

export interface PhoneCode {
  value: string;
  dial: string;
  // How the local number is split when displayed, e.g. [2, 3, 2, 2] -> 90 123 45 67
  groups: number[];
}

export const PHONE_CODES: readonly PhoneCode[] = [
  { value: "uz", dial: "+998", groups: [2, 3, 2, 2] },
  { value: "ru", dial: "+7", groups: [3, 3, 2, 2] },
  { value: "kz", dial: "+7", groups: [3, 3, 2, 2] },
  { value: "kg", dial: "+996", groups: [3, 3, 3] },
  { value: "tj", dial: "+992", groups: [2, 3, 2, 2] },
];

export const getPhoneCode = (value: string): PhoneCode =>
  PHONE_CODES.find((code) => code.value === value) ?? PHONE_CODES[0];

export const phoneLength = (value: string): number =>
  getPhoneCode(value).groups.reduce((sum, size) => sum + size, 0);

export const formatPhone = (digits: string, codeValue: string): string => {
  const parts: string[] = [];
  let rest = digits;
  for (const size of getPhoneCode(codeValue).groups) {
    if (!rest) break;
    parts.push(rest.slice(0, size));
    rest = rest.slice(size);
  }
  return parts.join(" ");
};
