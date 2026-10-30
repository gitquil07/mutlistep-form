import { Link } from "react-router";
import "./StepProgress.css";

// Segments are: the current step (not a link), reachable steps (links whose click is
// handed to onStepClick so moving forward validates like "Далее"), and locked steps.
interface StepProgressProps {
  current: number;
  total: number;
  furthestReachable: number;
  onStepClick: (step: number) => void;
}

const StepProgress = ({
  current,
  total,
  furthestReachable,
  onStepClick,
}: StepProgressProps) => (
  <nav className="step-progress" aria-label="Шаги оформления">
    {Array.from({ length: total }, (_, index) => {
      const step = index + 1;
      const label = `Шаг ${step} из ${total}`;

      if (step === current) {
        return (
          <span
            key={step}
            className="step-progress__segment step-progress__segment--current"
            aria-label={label}
            aria-current="step"
          />
        );
      }

      if (step <= furthestReachable) {
        return (
          <Link
            key={step}
            to={`/step-${step}`}
            className="step-progress__segment step-progress__segment--link"
            aria-label={label}
            onClick={(event) => {
              event.preventDefault();
              onStepClick(step);
            }}
          />
        );
      }

      return (
        <span
          key={step}
          className="step-progress__segment step-progress__segment--locked"
          aria-label={`${label} (недоступен)`}
          aria-disabled="true"
        />
      );
    })}
  </nav>
);

export default StepProgress;
