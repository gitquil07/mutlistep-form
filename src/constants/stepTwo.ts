import { COUNTRIES, type Country } from "../data/countries";
import { PROGRAMS, type CoverageKey, type Program } from "../data/programs";

export const CURRENCY = "EUR";

// Display order of coverages in the comparison table
export const COVERAGE_KEYS: readonly CoverageKey[] = [
  "medicine",
  "accident",
  "covid",
  "evacuation",
  "transportation",
  "compensation",
];

export const COVERAGE_LABELS: Record<CoverageKey, string> = {
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

export const formatAmount = (amount: number): string =>
  `${amountFormat.format(amount)} ${CURRENCY}`;

// One policy has to cover every destination, so only programs sold for all of the
// selected countries are offered. Empty rows (not chosen yet) are ignored.
export const getAvailablePrograms = (
  countryIds: readonly (number | null)[],
): Program[] => {
  const countries = countryIds
    .map((id) => COUNTRIES.find((country) => country.id === id))
    .filter((country): country is Country => country !== undefined);
  if (countries.length === 0) return [];

  return PROGRAMS.filter((program) =>
    countries.every((country) => country.programIds.includes(program.id)),
  );
};

// Lowercases ordinary words for use mid-sentence but leaves abbreviations like COVID-19
const lowerFirst = (text: string): string =>
  /^\p{Lu}\p{Ll}/u.test(text)
    ? text.charAt(0).toLowerCase() + text.slice(1)
    : text;

// Short card subtitle from what the program covers; COVID goes first because it is
// what sets the STOPVIRUS programs apart
export const describeProgram = (program: Program): string => {
  const covered = COVERAGE_KEYS.filter((key) => program.coverages[key] > 0)
    .toSorted((a, b) => Number(b === "covid") - Number(a === "covid"))
    .map((key) => lowerFirst(COVERAGE_LABELS[key]));

  const [first, second, ...rest] = covered;
  const summary = [first, second].filter(Boolean).join(", ");
  const text = rest.length ? `${summary} и другое` : summary;
  return text.charAt(0).toUpperCase() + text.slice(1);
};
