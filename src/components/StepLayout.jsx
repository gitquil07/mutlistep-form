import { useSelector } from "react-redux";
import { Button } from "antd";
import { ArrowLeftOutlined, InfoCircleFilled } from "@ant-design/icons";
import StepProgress from "./StepProgress";
import { TOTAL_STEPS } from "../constants/steps";
import { selectFurthestReachableStep } from "../store/formSlice";
import "./StepLayout.css";

// Shared card shell for every step: progress, back button, title and the footer note.
// The back button is shown only when the page passes onBack (the first step has none).
// onStepClick receives the step picked in the progress bar; pages route it through
// the same handler as their own buttons so every way of moving behaves the same.
const StepLayout = ({ step, title, onBack, onStepClick, children }) => {
  const furthestReachable = useSelector(selectFurthestReachableStep);

  return (
    <main className="step-page">
      <div className="step-card">
        <div className="step-card__top">
          <StepProgress
            current={step}
            total={TOTAL_STEPS}
            furthestReachable={furthestReachable}
            onStepClick={onStepClick}
          />
          {onBack && (
            <Button
              className="step-card__back"
              type="primary"
              shape="circle"
              icon={<ArrowLeftOutlined />}
              aria-label="Назад"
              onClick={onBack}
            />
          )}
        </div>

        <h1 className="step-card__title">{title}</h1>

        {children}

        <p className="step-card__note">
          <InfoCircleFilled className="step-card__note-icon" />
          Не волнуйтесь! Вы можете покинуть сайт и продолжить с этого момента в
          любое время
        </p>
      </div>
    </main>
  );
};

export default StepLayout;
