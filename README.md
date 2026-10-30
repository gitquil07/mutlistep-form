# Travel insurance form

Two-step form for buying a travel insurance policy: trip details on step one, program selection on
step two. Progress is saved in the browser (localStorage), so users can leave and continue later.

## Stack

- React, TypeScript (strict), Vite
- React Router for the steps
- Ant Design for UI
- react-hook-form + zod for forms and validation
- Redux Toolkit for form state shared between steps

A Next.js version of the app lives on the `nextjs-migration` branch.

## Scripts

```bash
npm install
npm run dev        # development server on http://localhost:5173
npm run build      # type-check, then production build into dist/
npm run preview    # serve the production build
npm run lint       # ESLint
npm run typecheck  # TypeScript only
```

## Structure

- `src/App.tsx` — routes (`/step-1`, `/step-2`; `/` resumes at the first unfinished step) and antd theme
- `src/pages` — the two step screens
- `src/components` — shared UI (step layout, progress bar, date fields, radio groups)
- `src/store` — Redux slice, selectors, localStorage persistence
- `src/schemas` — zod validation per step
- `src/constants`, `src/data` — options, countries and programs
