import { z } from "zod";

const STORAGE_KEY = "insurance-form";
// Bump when the stored shape changes so old drafts are dropped instead of breaking the form
const VERSION = 3;
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

// Shape check only (drafts may be incomplete); real validation is done by the step schemas.
// The Redux form slice uses the same shape, so its types are inferred from here.
const storedFormSchema = z.object({
  stepOne: z
    .object({
      countries: z.array(z.number().nullable()),
      coverType: z.enum(["single", "multi"]),
      startDate: z.string().nullable(),
      endDate: z.string().nullable(),
      purpose: z.number(),
      phoneCode: z.string(),
      phone: z.string(),
    })
    .nullable(),
  stepTwo: z.object({ program: z.number().nullable() }).nullable(),
});

const storedEnvelopeSchema = z.object({
  version: z.number(),
  savedAt: z.number(),
  form: z.unknown(),
});

export type FormState = z.infer<typeof storedFormSchema>;
export type StepOneStored = NonNullable<FormState["stepOne"]>;
export type StepTwoStored = NonNullable<FormState["stepTwo"]>;

const clear = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable (private mode, blocked cookies): nothing to clear
  }
};

export const loadFormState = (): FormState | undefined => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;

    const envelope = storedEnvelopeSchema.safeParse(JSON.parse(raw));
    const parsed = storedFormSchema.safeParse(envelope.data?.form);
    if (
      !envelope.success ||
      envelope.data.version !== VERSION ||
      Date.now() - envelope.data.savedAt > MAX_AGE_MS ||
      !parsed.success
    ) {
      clear();
      return undefined;
    }
    return parsed.data;
  } catch {
    clear();
    return undefined;
  }
};

export const saveFormState = (form: FormState): void => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: VERSION, savedAt: Date.now(), form }),
    );
  } catch {
    // Quota exceeded or storage blocked: the form keeps working, just without persistence
  }
};
