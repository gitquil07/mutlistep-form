import type { Dayjs } from "dayjs";
import dayjs from "../lib/dayjs";
import { z } from "zod";
import { PURPOSE_OPTIONS, phoneLength } from "../constants/stepOne";

const date = z.custom<Dayjs>(
  (value) => dayjs.isDayjs(value) && value.isValid(),
  { message: "Укажите дату" },
);

export const stepOneSchema = z
  .object({
    countries: z
      .array(z.object({ value: z.number().nullable() }))
      .min(1)
      .superRefine((countries, ctx) => {
        countries.forEach((country, index) => {
          if (!country.value) {
            ctx.addIssue({
              code: "custom",
              path: [index, "value"],
              message: "Выберите страну",
            });
          }
        });
      }),
    coverType: z.enum(["single", "multi"]),
    startDate: date,
    endDate: date,
    purpose: z.literal(PURPOSE_OPTIONS.map((option) => option.value)),
    phoneCode: z.string(),
    phone: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.startDate.isBefore(dayjs(), "day")) {
      ctx.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "Дата начала не может быть в прошлом",
      });
    }
    if (values.endDate.isBefore(values.startDate, "day")) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "Дата окончания раньше даты начала",
      });
    }
    if (
      values.phone.replace(/\D/g, "").length !== phoneLength(values.phoneCode)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Введите номер полностью",
      });
    }
  });

// What the step one form holds; drafts may still fail the refinements above
export type StepOneFormValues = z.input<typeof stepOneSchema>;
