import { z } from "zod";

// The valid choices depend on the countries picked in step one, so the schema is
// built from the ids of the programs available for them. The field starts empty (null).
export const createStepTwoSchema = (availableProgramIds: readonly number[]) =>
  z.object({
    program: z
      .number()
      .nullable()
      .refine((id) => id !== null && availableProgramIds.includes(id), {
        message: "Выберите программу",
      }),
  });

export type StepTwoFormValues = z.input<ReturnType<typeof createStepTwoSchema>>;
