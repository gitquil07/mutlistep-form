import type { Dayjs } from "dayjs";
import dayjs from "../lib/dayjs";
import { PURPOSE_OPTIONS, formatPhone } from "../constants/stepOne";
import type { StepOneFormValues } from "../schemas/stepOne";
import type { StepOneStored } from "./persistence";

// Redux keeps plain serializable values; the form works with dayjs objects,
// { value } rows for useFieldArray and a formatted phone. These convert both ways.

export const toStepOneForm = (
  saved: StepOneStored | null,
): StepOneFormValues => {
  if (saved) {
    return {
      ...saved,
      countries: saved.countries.map((value) => ({ value })),
      phone: formatPhone(saved.phone, saved.phoneCode),
      startDate: dayjs(saved.startDate),
      endDate: dayjs(saved.endDate),
    };
  }
  const startDate = dayjs().add(1, "day").startOf("day");
  return {
    countries: [{ value: null }],
    coverType: "single",
    startDate,
    endDate: startDate.add(7, "day"),
    purpose: PURPOSE_OPTIONS[0].value,
    phoneCode: "uz",
    phone: "",
  };
};

const toDateString = (date: Dayjs | undefined) =>
  date?.isValid() ? date.format("YYYY-MM-DD") : null;

// Also used for unvalidated drafts, so every field may be incomplete
export const fromStepOneForm = (values: StepOneFormValues): StepOneStored => ({
  ...values,
  countries: values.countries.map((country) => country.value),
  startDate: toDateString(values.startDate),
  endDate: toDateString(values.endDate),
  phone: values.phone.replace(/\D/g, ""),
});
