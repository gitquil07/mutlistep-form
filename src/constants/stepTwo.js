export const PROGRAMS = [
  {
    value: "silver",
    name: "Silver",
    coverage: "20 000 EUR",
    description: "Медицинское лечение, репатриация и другое",
  },
  {
    value: "gold",
    name: "Gold",
    coverage: "50 000 EUR",
    description: "Всё из Silver + несчастный случай и потеря багажа",
  },
  {
    value: "stopvirus",
    name: "Stopvirus (С покрытием COVID)",
    coverage: "60 000 EUR",
    description: "Всё вышеперечисленное + COVID",
  },
];

export const PROGRAM_FEATURES = [
  {
    key: "medical",
    label: "Медицинское лечение",
    programs: ["silver", "gold", "stopvirus"],
  },
  {
    key: "repatriation",
    label: "Репатриация",
    programs: ["silver", "gold", "stopvirus"],
  },
  {
    key: "accident",
    label: "Несчастный случай",
    programs: ["gold", "stopvirus"],
  },
  { key: "baggage", label: "Потеря багажа", programs: ["gold", "stopvirus"] },
  { key: "covid", label: "COVID-19", programs: ["stopvirus"] },
];

export const getProgram = (value) =>
  PROGRAMS.find((program) => program.value === value);
