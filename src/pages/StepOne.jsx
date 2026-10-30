import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { App, Button, Form, Input, Select } from "antd";
import {
  ArrowLeftOutlined,
  CloseOutlined,
  InfoCircleFilled,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "../lib/dayjs";
import StepProgress from "../components/StepProgress";
import FieldHeader from "../components/FieldHeader";
import CheckRadioGroup from "../components/CheckRadioGroup";
import DateFields from "../components/DateFields";
import {
  COUNTRIES,
  COVER_OPTIONS,
  MAX_COUNTRIES,
  PHONE_CODES,
  PURPOSE_OPTIONS,
  TOTAL_STEPS,
  formatPhone,
  phoneLength,
} from "../constants/stepOne";
import { stepOneSchema } from "../schemas/stepOne";
import { saveStepOne } from "../store/formSlice";
import "./StepOne.css";

const getDefaultValues = (saved) => {
  if (saved) {
    return {
      ...saved,
      countries: saved.countries.map((value) => ({ value })),
      startDate: dayjs(saved.startDate),
      endDate: dayjs(saved.endDate),
    };
  }
  const startDate = dayjs().add(1, "day").startOf("day");
  return {
    countries: [{ value: COUNTRIES[0].value }],
    coverType: "single",
    startDate,
    endDate: startDate.add(7, "day"),
    purpose: "tourism",
    phoneCode: "uz",
    phone: "",
  };
};

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

const errorProps = (error) =>
  error ? { validateStatus: "error", help: error.message } : {};

const StepOne = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const saved = useSelector((state) => state.form.stepOne);

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(stepOneSchema),
    defaultValues: getDefaultValues(saved),
  });
  const { fields, append, remove } = useFieldArray({ control, name: "countries" });

  const startDate = useWatch({ control, name: "startDate" });
  const phoneCode = useWatch({ control, name: "phoneCode" });

  const onSubmit = (values) => {
    dispatch(
      saveStepOne({
        ...values,
        countries: values.countries.map((country) => country.value),
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        phone: values.phone.replace(/\D/g, ""),
      }),
    );
    message.success("Данные сохранены");
  };

  return (
    <main className="step-page">
      <div className="step-card">
        <div className="step-card__top">
          <StepProgress current={1} total={TOTAL_STEPS} />
          <Button
            className="step-card__back"
            type="primary"
            shape="circle"
            icon={<ArrowLeftOutlined />}
            aria-label="Назад"
            onClick={() => navigate(-1)}
          />
        </div>

        <h1 className="step-card__title">Покупка страхового полиса</h1>

        <form className="step-form" onSubmit={handleSubmit(onSubmit)} noValidate>
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
                          options={COUNTRIES}
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
            <FieldHeader title="Цель поездки" hint="От цели поездки зависят условия покрытия" />
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

          <p className="step-form__note">
            <InfoCircleFilled className="step-form__note-icon" />
            Не волнуйтесь! Вы можете покинуть сайт и продолжить с этого момента
            в любое время
          </p>
        </form>
      </div>
    </main>
  );
};

export default StepOne;
