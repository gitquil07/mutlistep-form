import { z } from "zod";
import { PROGRAMS } from "../constants/stepTwo";

export const stepTwoSchema = z.object({
  program: z.enum(PROGRAMS.map((program) => program.value), {
    message: "Выберите программу",
  }),
});
