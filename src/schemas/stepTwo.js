import { z } from "zod";

// The valid choices depend on the countries picked in step one, so the schema is
// built from the ids of the programs available for them
export const createStepTwoSchema = (availableProgramIds) =>
  z.object({
    program: z.literal(availableProgramIds, {
      message: "Выберите программу",
    }),
  });
