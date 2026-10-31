import { useId, useState } from "react";
import { DownOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "../lib/dayjs";
import { COVER_OPTIONS, PURPOSE_OPTIONS } from "../constants/stepOne";
import { COUNTRIES } from "../data/countries";
import type { StepOneStored } from "../store/persistence";
import { useAppSelector } from "../store/hooks";
import "./TripSummary.css";

// Ids of the step one controls each row points to (see StepOne)
export type SummaryField =
  "countries.0" | "coverType" | "startDate" | "endDate" | "purpose";

// "card": full block beside the step card on wide screens.
// "bar": collapsed line at the top of the step card on narrow screens; tap to expand.
// Pages render both and CSS shows the one that fits, so each keeps its natural
// position in the document (and in keyboard / screen reader order).
export type SummaryVariant = "card" | "bar";

interface TripSummaryProps {
  variant: SummaryVariant;
  onEdit: (field: SummaryField) => void;
}

interface SummaryRow {
  field: SummaryField;
  label: string;
  value: string;
}

const DATE_PLACEHOLDER = "DD/MM/YYYY";

const formatDate = (value: string | null) => {
  const date = dayjs(value);
  return value && date.isValid() ? date.format("DD/MM/YYYY") : DATE_PLACEHOLDER;
};

const countryNames = (stepOne: StepOneStored) =>
  stepOne.countries
    .map((id) => COUNTRIES.find((country) => country.id === id)?.name)
    .filter(Boolean)
    .join(", ");

const buildRows = (stepOne: StepOneStored): SummaryRow[] => [
  {
    field: "countries.0",
    label: "Страна путешествия",
    value: countryNames(stepOne),
  },
  {
    field: "coverType",
    label: "Тип покрытия",
    value:
      COVER_OPTIONS.find((option) => option.value === stepOne.coverType)
        ?.label ?? "",
  },
  {
    field: "startDate",
    label: "Начало страхования",
    value: formatDate(stepOne.startDate),
  },
  {
    field: "endDate",
    label: "Конец страхования",
    value: formatDate(stepOne.endDate),
  },
  {
    field: "purpose",
    label: "Цель",
    value:
      PURPOSE_OPTIONS.find((option) => option.value === stepOne.purpose)
        ?.label ?? "",
  },
];

// One-line preview for the collapsed bar, e.g. "ЛАТВИЯ · 01.11–08.11"
const buildPreview = (stepOne: StepOneStored) => {
  const start = dayjs(stepOne.startDate);
  const end = dayjs(stepOne.endDate);
  const dates =
    start.isValid() && end.isValid()
      ? `${start.format("DD.MM")}–${end.format("DD.MM")}`
      : "";
  return [countryNames(stepOne), dates].filter(Boolean).join(" · ");
};

const SummaryList = ({
  rows,
  onEdit,
  id,
}: {
  rows: SummaryRow[];
  onEdit: TripSummaryProps["onEdit"];
  id?: string;
}) => (
  <dl className="trip-summary__list" id={id}>
    {rows.map((row) => (
      <div key={row.field} className="trip-summary__row">
        <dt className="trip-summary__label">{row.label}</dt>
        <dd className="trip-summary__value">
          <button
            type="button"
            className="trip-summary__edit"
            onClick={() => onEdit(row.field)}
            aria-label={`Изменить: ${row.label}`}
          >
            <span className="trip-summary__text">{row.value}</span>
            <EditOutlined className="trip-summary__icon" />
          </button>
        </dd>
      </div>
    ))}
  </dl>
);

// "Ваши данные": the answers given in earlier steps, each with a shortcut back to its field
const TripSummary = ({ variant, onEdit }: TripSummaryProps) => {
  const stepOne = useAppSelector((state) => state.form.stepOne);
  // Bar starts collapsed and keeps its state while the user stays on the step
  const [expanded, setExpanded] = useState(false);
  const titleId = useId();
  const listId = useId();
  if (!stepOne) return null;

  const rows = buildRows(stepOne);

  if (variant === "bar") {
    return (
      <section className="trip-summary-bar" aria-labelledby={titleId}>
        <button
          type="button"
          className="trip-summary-bar__toggle"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpanded((open) => !open)}
        >
          <span id={titleId} className="trip-summary-bar__title">
            Ваши данные
          </span>
          <span className="trip-summary-bar__preview">
            {buildPreview(stepOne)}
          </span>
          <DownOutlined
            className={`trip-summary-bar__chevron${expanded ? " trip-summary-bar__chevron--open" : ""}`}
          />
        </button>
        {expanded && <SummaryList id={listId} rows={rows} onEdit={onEdit} />}
      </section>
    );
  }

  return (
    <aside className="trip-summary" aria-labelledby={titleId}>
      <h2 id={titleId} className="trip-summary__title">
        Ваши данные
      </h2>
      <SummaryList rows={rows} onEdit={onEdit} />
    </aside>
  );
};

export default TripSummary;
