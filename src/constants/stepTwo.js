import { COUNTRIES } from "../data/countries";
import { PROGRAMS } from "../data/programs";

export const CURRENCY = "EUR";

export const COVERAGE_LABELS = {
  medicine: "Медицинские расходы",
  accident: "Несчастный случай",
  covid: "COVID-19",
  evacuation: "Эвакуация",
  transportation: "Транспортировка",
  compensation: "Компенсация",
};

const amountFormat = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 0,
});

export const formatAmount = (amount) =>
  `${amountFormat.format(amount)} ${CURRENCY}`;

export const getProgram = (id) => PROGRAMS.find((program) => program.id === id);

// One policy has to cover every destination, so only programs sold for all of the
// selected countries are offered. Empty rows (not chosen yet) are ignored.
export const getAvailablePrograms = (countryIds) => {
  const countries = countryIds
    .map((id) => COUNTRIES.find((country) => country.id === id))
    .filter(Boolean);
  if (countries.length === 0) return [];

  return PROGRAMS.filter((program) =>
    countries.every((country) => country.programIds.includes(program.id)),
  );
};

// Lowercases ordinary words for use mid-sentence but leaves abbreviations like COVID-19
const lowerFirst = (text) =>
  /^\p{Lu}\p{Ll}/u.test(text)
    ? text.charAt(0).toLowerCase() + text.slice(1)
    : text;

// Short card subtitle from what the program covers; COVID goes first because it is
// what sets the STOPVIRUS programs apart
export const describeProgram = (program) => {
  const covered = Object.entries(program.coverages)
    .filter(([, amount]) => amount > 0)
    .map(([key]) => key)
    .sort((a, b) => (b === "covid") - (a === "covid"))
    .map((key) => lowerFirst(COVERAGE_LABELS[key]));

  const [first, second, ...rest] = covered;
  const summary = [first, second].filter(Boolean).join(", ");
  const text = rest.length ? `${summary} и другое` : summary;
  return text.charAt(0).toUpperCase() + text.slice(1);
};
