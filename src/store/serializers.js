import dayjs from "../lib/dayjs";
import { COUNTRIES, formatPhone } from "../constants/stepOne";

// Redux keeps plain serializable values; the form works with dayjs objects,
// { value } rows for useFieldArray and a formatted phone. These convert both ways.

export const toStepOneForm = (saved) => {
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
    countries: [{ value: COUNTRIES[0].value }],
    coverType: "single",
    startDate,
    endDate: startDate.add(7, "day"),
    purpose: "tourism",
    phoneCode: "uz",
    phone: "",
  };
};

// Also used for unvalidated drafts, so every field may be incomplete
export const fromStepOneForm = (values) => ({
  ...values,
  countries: values.countries.map((country) => country.value),
  startDate: values.startDate?.format("YYYY-MM-DD") ?? null,
  endDate: values.endDate?.format("YYYY-MM-DD") ?? null,
  phone: values.phone.replace(/\D/g, ""),
});
