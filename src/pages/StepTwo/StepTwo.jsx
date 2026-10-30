import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router";
import { App, Button, Modal, Radio, Table } from "antd";
import {
  CheckCircleFilled,
  CheckOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import StepLayout from "../../components/StepLayout";
import {
  PROGRAMS,
  PROGRAM_FEATURES,
  getProgram,
} from "../../constants/stepTwo";
import { stepTwoSchema } from "../../schemas/stepTwo";
import { TOTAL_STEPS } from "../../constants/steps";
import {
  saveStepTwo,
  selectFurthestReachableStep,
} from "../../store/formSlice";
import "./StepTwo.css";

const STEP = 2;

const renderCompareCell = (program, row) => {
  if (row.key === "coverage") {
    return (
      <span className="program-compare__coverage">{program.coverage}</span>
    );
  }
  return row.programs.includes(program.value) ? (
    <CheckOutlined className="program-compare__yes" aria-label="Входит" />
  ) : (
    <MinusOutlined className="program-compare__no" aria-label="Не входит" />
  );
};

const compareColumns = [
  { title: "", dataIndex: "label", key: "label" },
  ...PROGRAMS.map((program) => ({
    title: program.name,
    key: program.value,
    align: "center",
    render: (_, row) => renderCompareCell(program, row),
  })),
];

const compareRows = [
  { key: "coverage", label: "Общее покрытие" },
  ...PROGRAM_FEATURES,
];

const StepTwo = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const furthestReachable = useSelector(selectFurthestReachableStep);
  const saved = useSelector((state) => state.form.stepTwo);
  const [compareOpen, setCompareOpen] = useState(false);

  const { control, handleSubmit, getValues } = useForm({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: { program: saved?.program ?? null },
  });
  const selected = getProgram(useWatch({ control, name: "program" }));

  // Keep the selection as a draft whichever way the user leaves the page
  useEffect(
    () => () => dispatch(saveStepTwo(getValues())),
    [dispatch, getValues],
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
        message.success(`Программа ${getProgram(values.program).name} выбрана`);
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
              {PROGRAMS.map((program) => {
                const checked = field.value === program.value;
                return (
                  <Radio
                    key={program.value}
                    value={program.value}
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
                      Общее покрытие - {program.coverage}
                    </span>
                    <span className="program-card__description">
                      {program.description}
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
          columns={compareColumns}
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
