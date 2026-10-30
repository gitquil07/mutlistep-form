import { Link } from "react-router";
import "./StepProgress.css";

const StepProgress = ({ current, total }) => (
  <nav className="step-progress" aria-label="Шаги оформления">
    {Array.from({ length: total }, (_, index) => {
      const step = index + 1;
      const isCurrent = step === current;
      return (
        <Link
          key={step}
          to={`/step-${step}`}
          className={`step-progress__segment${isCurrent ? " step-progress__segment--current" : ""}`}
          aria-label={`Шаг ${step} из ${total}`}
          aria-current={isCurrent ? "step" : undefined}
        />
      );
    })}
  </nav>
);

export default StepProgress;
