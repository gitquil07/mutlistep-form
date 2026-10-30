import "./StepProgress.css";

const StepProgress = ({ current, total }) => (
  <div
    className="step-progress"
    role="progressbar"
    aria-valuemin={1}
    aria-valuemax={total}
    aria-valuenow={current}
    aria-label={`Шаг ${current} из ${total}`}
  >
    {Array.from({ length: total }, (_, index) => (
      <span
        key={index}
        className={`step-progress__segment${index < current ? " step-progress__segment--done" : ""}`}
      />
    ))}
  </div>
);

export default StepProgress;
