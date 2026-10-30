import { useEffect, useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type FieldError,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { Button, Form, Input, Select, type FormItemProps } from "antd";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "../lib/dayjs";
import StepLayout from "../components/StepLayout";
import FieldHeader from "../components/FieldHeader";
import CheckRadioGroup from "../components/CheckRadioGroup";
import DateFields from "../components/DateFields";
import {
  COUNTRY_OPTIONS,
  COVER_OPTIONS,
  MAX_COUNTRIES,
  PHONE_CODES,
  PURPOSE_OPTIONS,
  formatPhone,
  phoneLength,
} from "../constants/stepOne";
import { stepOneSchema } from "../schemas/stepOne";
import { saveStepOne } from "../store/formSlice";
import { useAppDispatch, useAppStore } from "../store/hooks";
import { fromStepOneForm, toStepOneForm } from "../store/serializers";
import "./StepOne.css";

const STEP = 1;

const phoneCodeOptions = PHONE_CODES.map((code) => ({
  value: code.value,
  label: (
    <span className="phone-code">
      <img
        className="phone-code__flag"
        src={`https://flagcdn.com/${code.value}.svg`}
        alt=""
        width={24}
        height={16}
      />
      ({code.dial}) {code.value.toUpperCase()}
    </span>
  ),
}));

const errorProps = (
  // Only the message is used; date fields (Dayjs objects) get a nested error type
  error: Pick<FieldError, "message"> | undefined,
): Pick<FormItemProps, "validateStatus" | "help"> =>
  error ? { validateStatus: "error", help: error.message } : {};

const StepOne = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const store = useAppStore();
  // Read the saved draft once; subscribing would re-render on every synced keystroke
  const [defaultValues] = useState(() =>
    toStepOneForm(store.getState().form.stepOne),
  );

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    subscribe,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(stepOneSchema),
    defaultValues,
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "countries",
  });

  const startDate = useWatch({ control, name: "startDate" });
  const phoneCode = useWatch({ control, name: "phoneCode" });
  const chosenCountries = useWatch({ control, name: "countries" }).map(
    (country) => country.value,
  );

  // Keep every edit as a draft in the store (and so in localStorage), so leaving the
  // page or closing the browser never loses input. Drafts are not validated; the
  // completion selector decides if the step counts as done.
  useEffect(
    () =>
      subscribe({
        formState: { values: true },
        callback: ({ values }) =>
          dispatch(saveStepOne(fromStepOneForm(values))),
      }),
    [subscribe, dispatch],
  );

  // Single entry point for "Далее" and the progress bar: going forward validates
  // and shows the same inline errors, going back never does.
  const goToStep = (target: number) => {
    if (target < STEP) {
      navigate(`/step-${target}`);
      return;
    }
    handleSubmit((values) => {
      dispatch(saveStepOne(fromStepOneForm(values)));
      navigate(`/step-${target}`);
    })();
  };

  return (
    <StepLayout
      step={STEP}
      title="Покупка страхового полиса"
      onStepClick={goToStep}
    >
      <form
        className="step-form"
        onSubmit={(event) => {
          event.preventDefault();
          goToStep(STEP + 1);
        }}
        noValidate
      >
        <section className="step-form__field">
          <FieldHeader
            title="Страна путешествия"
            htmlFor="countries.0"
            hint="Выберите страны, которые вы планируете посетить"
          />
          {fields.map((field, index) => {
            const isFirst = index === 0;
            return (
              <div key={field.id} className="country-row">
                <Form.Item
                  className="country-row__select"
                  {...errorProps(errors.countries?.[index]?.value)}
                >
                  <Controller
                    control={control}
                    name={`countries.${index}.value`}
                    render={({ field: { ref, ...controlField } }) => (
                      <Select
                        {...controlField}
                        ref={ref}
                        id={`countries.${index}`}
                        variant="filled"
                        showSearch={{ optionFilterProp: "label" }}
                        placeholder="Выберите страну"
                        // A country already picked in another row isn't offered again
                        options={COUNTRY_OPTIONS.filter(
                          (option) =>
                            option.value === controlField.value ||
                            !chosenCountries.includes(option.value),
                        )}
                      />
                    )}
                  />
                </Form.Item>
                {isFirst ? (
                  <Button
                    className="country-row__action"
                    variant="filled"
                    color="default"
                    icon={<PlusOutlined />}
                    aria-label="Добавить страну"
                    disabled={fields.length >= MAX_COUNTRIES}
                    onClick={() => append({ value: null })}
                  />
                ) : (
                  <Button
                    className="country-row__action"
                    variant="filled"
                    color="default"
                    icon={<CloseOutlined />}
                    aria-label="Удалить страну"
                    onClick={() => remove(index)}
                  />
                )}
              </div>
            );
          })}
        </section>

        <section className="step-form__field">
          <FieldHeader
            title="Тип покрытия"
            hint="Однократное — на одну поездку, многократное — на несколько поездок в течение периода"
          />
          <Controller
            control={control}
            name="coverType"
            render={({ field }) => (
              <CheckRadioGroup
                aria-label="Тип покрытия"
                options={COVER_OPTIONS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </section>

        <section className="step-form__field">
          <FieldHeader
            title="Начало страхования"
            htmlFor="startDate"
            hint="Дата, с которой начинает действовать полис"
          />
          <Form.Item {...errorProps(errors.startDate)}>
            <Controller
              control={control}
              name="startDate"
              render={({ field }) => (
                <DateFields
                  id="startDate"
                  value={field.value}
                  minDate={dayjs().startOf("day")}
                  status={errors.startDate && "error"}
                  onChange={(value) => {
                    field.onChange(value);
                    const endDate = getValues("endDate");
                    if (endDate?.isBefore(value, "day")) {
                      setValue("endDate", value, { shouldValidate: true });
                    }
                  }}
                />
              )}
            />
          </Form.Item>
        </section>

        <section className="step-form__field">
          <FieldHeader
            title="Конец страхования"
            htmlFor="endDate"
            hint="Последний день действия полиса"
          />
          <Form.Item {...errorProps(errors.endDate)}>
            <Controller
              control={control}
              name="endDate"
              render={({ field }) => (
                <DateFields
                  id="endDate"
                  value={field.value}
                  minDate={startDate ?? dayjs().startOf("day")}
                  status={errors.endDate && "error"}
                  onChange={field.onChange}
                />
              )}
            />
          </Form.Item>
        </section>

        <section className="step-form__field">
          <FieldHeader
            title="Цель поездки"
            hint="От цели поездки зависят условия покрытия"
          />
          <Controller
            control={control}
            name="purpose"
            render={({ field }) => (
              <CheckRadioGroup
                aria-label="Цель поездки"
                direction="horizontal"
                options={PURPOSE_OPTIONS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </section>

        <section className="step-form__field">
          <FieldHeader
            title="Номер мобильного телефона"
            htmlFor="phone"
            hint="На этот номер придёт подтверждение и полис"
          />
          <Form.Item {...errorProps(errors.phone)}>
            <div className="phone-row">
              <Controller
                control={control}
                name="phoneCode"
                render={({ field }) => (
                  <Select
                    className="phone-row__code"
                    aria-label="Код страны"
                    value={field.value}
                    options={phoneCodeOptions}
                    onChange={(value) => {
                      field.onChange(value);
                      setValue("phone", "");
                    }}
                  />
                )}
              />
              <Controller
                control={control}
                name="phone"
                render={({ field: { ref, onChange, ...controlField } }) => (
                  <Input
                    {...controlField}
                    ref={ref}
                    id="phone"
                    className="phone-row__number"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder={formatPhone("901234567890", phoneCode)}
                    onChange={(event) => {
                      const digits = event.target.value
                        .replace(/\D/g, "")
                        .slice(0, phoneLength(phoneCode));
                      onChange(formatPhone(digits, phoneCode));
                    }}
                  />
                )}
              />
            </div>
          </Form.Item>
        </section>

        <Button
          className="step-form__submit"
          type="primary"
          htmlType="submit"
          size="large"
          loading={isSubmitting}
        >
          Далее
        </Button>
      </form>
    </StepLayout>
  );
};

export default StepOne;
