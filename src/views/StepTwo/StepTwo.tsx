"use client";

import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { App, Button, Modal, Radio, Table, type TableColumnsType } from "antd";
import { CheckCircleFilled, MinusOutlined } from "@ant-design/icons";
import StepLayout from "../../components/StepLayout";
import TripSummary from "../../components/TripSummary";
import {
  COVERAGE_KEYS,
  COVERAGE_LABELS,
  describeProgram,
  formatAmount,
} from "../../constants/stepTwo";
import type { CoverageKey, Program } from "../../data/programs";
import {
  createStepTwoSchema,
  type StepTwoFormValues,
} from "../../schemas/stepTwo";
import { TOTAL_STEPS } from "../../constants/steps";
import {
  saveStepTwo,
  selectAvailablePrograms,
  selectFurthestReachableStep,
} from "../../store/formSlice";
import { useAppDispatch, useAppSelector, useAppStore } from "../../store/hooks";
import "./StepTwo.css";

const STEP = 2;

interface CompareRow {
  key: "liability" | CoverageKey;
  label: string;
  getAmount: (program: Program) => number;
}

const compareRows: CompareRow[] = [
  {
    key: "liability",
    label: "Общее покрытие",
    getAmount: (program) => program.liability,
  },
  ...COVERAGE_KEYS.map((key) => ({
    key,
    label: COVERAGE_LABELS[key],
    getAmount: (program: Program) => program.coverages[key],
  })),
];

const renderCompareCell = (program: Program, row: CompareRow) => {
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

const getCompareColumns = (
  programs: Program[],
): TableColumnsType<CompareRow> => [
  { title: "", dataIndex: "label", key: "label" },
  ...programs.map((program) => ({
    title: program.name,
    key: program.id,
    align: "center" as const,
    render: (_: unknown, row: CompareRow) => renderCompareCell(program, row),
  })),
];

const StepTwo = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { message } = App.useApp();
  const furthestReachable = useAppSelector(selectFurthestReachableStep);
  // Countries can't change while this page is open, so neither can the programs
  const programs = useAppSelector(selectAvailablePrograms);
  const store = useAppStore();
  const [defaultValues] = useState((): StepTwoFormValues => {
    const saved = store.getState().form.stepTwo?.program ?? null;
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
  const blocked = furthestReachable < STEP;
  useEffect(() => {
    if (blocked) router.replace(`/step-${furthestReachable}`);
  }, [blocked, furthestReachable, router]);

  if (blocked) return null;

  // Same rules as step one: back never validates, forward always does
  const goToStep = (target: number) => {
    if (target < STEP) {
      router.push(`/step-${target}`);
      return;
    }
    handleSubmit((values) => {
      dispatch(saveStepTwo(values));
      if (target > TOTAL_STEPS) {
        const chosen = programs.find(
          (program) => program.id === values.program,
        );
        if (chosen) message.success(`Программа ${chosen.name} выбрана`);
        return;
      }
      router.push(`/step-${target}`);
    })();
  };

  return (
    <StepLayout
      step={STEP}
      title="Выберите программу"
      onBack={() => goToStep(STEP - 1)}
      onStepClick={goToStep}
      renderSummary={(variant) => (
        <TripSummary
          variant={variant}
          // Going back never validates, so this is a plain move to step one
          onEdit={(field) =>
            router.push(`/step-1?focus=${encodeURIComponent(field)}`)
          }
        />
      )}
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
