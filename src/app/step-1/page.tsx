import { Suspense } from "react";
import StepOne from "../../views/StepOne/StepOne";

// StepOne reads ?focus= with useSearchParams, which Next requires to sit under Suspense
const StepOnePage = () => (
  <Suspense>
    <StepOne />
  </Suspense>
);

export default StepOnePage;
