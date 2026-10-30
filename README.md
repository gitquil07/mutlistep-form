# Travel insurance form

Two-step form for buying a travel insurance policy: trip details on step one, program selection on
step two. Progress is saved in the browser (localStorage), so users can leave and continue later.

## Stack

- Next.js (App Router), React, TypeScript (strict)
- Ant Design for UI
- react-hook-form + zod for forms and validation
- Redux Toolkit for form state shared between steps

## Scripts

```bash
npm install
npm run dev        # development server on http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint
npm run typecheck  # TypeScript without emitting files
```

## Structure

- `src/app` — routes (`/step-1`, `/step-2`; `/` resumes at the first unfinished step), layout, providers
- `src/views` — the two step screens
- `src/components` — shared UI (step layout, progress bar, date fields, radio groups)
- `src/store` — Redux slice, selectors, localStorage persistence
- `src/schemas` — zod validation per step
- `src/constants`, `src/data` — options, countries and programs
