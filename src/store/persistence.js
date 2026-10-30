import { z } from "zod";

const STORAGE_KEY = "insurance-form";
// Bump when the stored shape changes so old drafts are dropped instead of breaking the form
const VERSION = 2;
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

// Shape check only (drafts may be incomplete); real validation is done by the step schemas
const storedFormSchema = z.object({
  stepOne: z
    .object({
      countries: z.array(z.string().nullable()),
      coverType: z.string(),
      startDate: z.string().nullable(),
      endDate: z.string().nullable(),
      purpose: z.number(),
      phoneCode: z.string(),
      phone: z.string(),
    })
    .nullable(),
  stepTwo: z.object({ program: z.string().nullable() }).nullable(),
});

const clear = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable (private mode, blocked cookies): nothing to clear
  }
};

export const loadFormState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;

    const { version, savedAt, form } = JSON.parse(raw);
    const parsed = storedFormSchema.safeParse(form);
    if (
      version !== VERSION ||
      Date.now() - savedAt > MAX_AGE_MS ||
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

export const saveFormState = (form) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: VERSION, savedAt: Date.now(), form }),
    );
  } catch {
    // Quota exceeded or storage blocked: the form keeps working, just without persistence
  }
};
