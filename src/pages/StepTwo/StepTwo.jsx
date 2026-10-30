import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector, useStore } from "react-redux";
import { Navigate, useNavigate } from "react-router";
import { App, Button, Modal, Radio, Table } from "antd";
import { CheckCircleFilled, MinusOutlined } from "@ant-design/icons";
import StepLayout from "../../components/StepLayout";
import {
  COVERAGE_LABELS,
  describeProgram,
  formatAmount,
} from "../../constants/stepTwo";
import { createStepTwoSchema } from "../../schemas/stepTwo";
import { TOTAL_STEPS } from "../../constants/steps";
import {
  saveStepTwo,
  selectAvailablePrograms,
  selectFurthestReachableStep,
} from "../../store/formSlice";
import "./StepTwo.css";

const STEP = 2;

const compareRows = [
  { key: "liability", label: "Общее покрытие", getAmount: (p) => p.liability },
  ...Object.entries(COVERAGE_LABELS).map(([key, label]) => ({
    key,
    label,
    getAmount: (p) => p.coverages[key],
  })),
];

const renderCompareCell = (program, row) => {
  const amount = row.getAmount(program);
  return amount > 0 ? (
    <span
      className={
        row.key === "liability" ? "program-compare__coverage" : undefined
      }
    >
      {formatAmount(amount)}
    </span>
  ) : (
    <MinusOutlined
      className="program-compare__no"
      aria-label="Не покрывается"
    />
  );
};

const getCompareColumns = (programs) => [
  { title: "", dataIndex: "label", key: "label" },
  ...programs.map((program) => ({
    title: program.name,
    key: program.id,
    align: "center",
    render: (_, row) => renderCompareCell(program, row),
  })),
];

const StepTwo = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const furthestReachable = useSelector(selectFurthestReachableStep);
  // Countries can't change while this page is open, so neither can the programs
  const programs = useSelector(selectAvailablePrograms);
  const store = useStore();
  const [defaultValues] = useState(() => {
    const saved = store.getState().form.stepTwo?.program;
    // Drop a choice made for countries that have since changed
    const stillAvailable = programs.some((program) => program.id === saved);
    return { program: stillAvailable ? saved : null };
  });
  const [schema] = useState(() =>
    createStepTwoSchema(programs.map((program) => program.id)),
  );
  const [compareOpen, setCompareOpen] = useState(false);

  const { control, handleSubmit, subscribe } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const selectedId = useWatch({ control, name: "program" });
  const selected = programs.find((program) => program.id === selectedId);

  // Keep the selection as a draft in the store (and so in localStorage) as soon as it changes
  useEffect(
    () =>
      subscribe({
        formState: { values: true },
        callback: ({ values }) => dispatch(saveStepTwo(values)),
      }),
    [subscribe, dispatch],
  );

  // Typed URL or browser navigation: send the user to the first step that still needs work
  if (furthestReachable < STEP) {
    return <Navigate to={`/step-${furthestReachable}`} replace />;
  }

  // Same rules as step one: back never validates, forward always does
  const goToStep = (target) => {
    if (target < STEP) {
      navigate(`/step-${target}`);
      return;
    }
    handleSubmit((values) => {
      dispatch(saveStepTwo(values));
      if (target > TOTAL_STEPS) {
        const chosen = programs.find(
          (program) => program.id === values.program,
        );
        message.success(`Программа ${chosen.name} выбрана`);
        return;
      }
      navigate(`/step-${target}`);
    })();
  };

  return (
    <StepLayout
      step={STEP}
      title="Выберите программу"
      onBack={() => goToStep(STEP - 1)}
      onStepClick={goToStep}
    >
      <form
        className="program-form"
        onSubmit={(event) => {
          event.preventDefault();
          goToStep(STEP + 1);
        }}
        noValidate
      >
        <Controller
          control={control}
          name="program"
          render={({ field }) => (
            <Radio.Group
              className="program-list"
              aria-label="Программа страхования"
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
            >
              {programs.map((program) => {
                const checked = field.value === program.id;
                return (
                  <Radio
                    key={program.id}
                    value={program.id}
                    className={`program-card${checked ? " program-card--checked" : ""}`}
                    classNames={{
                      icon: "program-card__native",
                      label: "program-card__body",
                    }}
                  >
                    <span className="program-card__name">
                      <CheckCircleFilled className="program-card__icon" />
                      {program.name}
                    </span>
                    <span className="program-card__coverage">
                      Общее покрытие - {formatAmount(program.liability)}
                    </span>
                    <span className="program-card__description">
                      {describeProgram(program)}
                    </span>
                  </Radio>
                );
              })}
            </Radio.Group>
          )}
        />

        <div className="program-form__actions">
          <Button
            type="link"
            className="program-form__compare"
            onClick={() => setCompareOpen(true)}
          >
            Сравнить программы
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            disabled={!selected}
            className="program-form__submit"
          >
            {selected ? `Выбрать ${selected.name}` : "Выбрать программу"}
          </Button>
        </div>
      </form>

      <Modal
        title="Сравнение программ"
        open={compareOpen}
        onCancel={() => setCompareOpen(false)}
        footer={null}
        width={560}
      >
        <Table
          className="program-compare"
          columns={getCompareColumns(programs)}
          dataSource={compareRows}
          pagination={false}
          size="small"
          scroll={{ x: true }}
        />
      </Modal>
    </StepLayout>
  );
};

export default StepTwo;
