export const COUNTRIES = [
  { value: "lv", label: "Латвия" },
  { value: "de", label: "Германия" },
  { value: "fr", label: "Франция" },
  { value: "it", label: "Италия" },
  { value: "es", label: "Испания" },
  { value: "tr", label: "Турция" },
  { value: "ae", label: "ОАЭ" },
  { value: "ge", label: "Грузия" },
  { value: "th", label: "Таиланд" },
  { value: "eg", label: "Египет" },
];

export const MAX_COUNTRIES = 5;

export const COVER_OPTIONS = [
  { value: "single", label: "Однократное путешествие" },
  { value: "multi", label: "Многократное путешествие" },
];

// Kept in the API's { id, name } shape so it can later be replaced by a request
export const ACTIVITIES = [
  { id: 0, name: "Туризм" },
  { id: 1, name: "Спорт" },
  { id: 2, name: "Работа" },
  { id: 4, name: "Учёба" },
  { id: 3, name: "SPORT/WORK" },
];

export const PURPOSE_OPTIONS = ACTIVITIES.map(({ id, name }) => ({
  value: id,
  label: name,
}));

// `groups` describes how the local number is split when displayed, e.g. 90 123 45 67
export const PHONE_CODES = [
  { value: "uz", dial: "+998", groups: [2, 3, 2, 2] },
  { value: "ru", dial: "+7", groups: [3, 3, 2, 2] },
  { value: "kz", dial: "+7", groups: [3, 3, 2, 2] },
  { value: "kg", dial: "+996", groups: [3, 3, 3] },
  { value: "tj", dial: "+992", groups: [2, 3, 2, 2] },
];

export const getPhoneCode = (value) =>
  PHONE_CODES.find((code) => code.value === value) ?? PHONE_CODES[0];

export const phoneLength = (value) =>
  getPhoneCode(value).groups.reduce((sum, size) => sum + size, 0);

export const formatPhone = (digits, codeValue) => {
  const parts = [];
  let rest = digits;
  for (const size of getPhoneCode(codeValue).groups) {
    if (!rest) break;
    parts.push(rest.slice(0, size));
    rest = rest.slice(size);
  }
  return parts.join(" ");
};
