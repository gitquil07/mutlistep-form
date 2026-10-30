import { useState } from "react";
import dayjs from "../lib/dayjs";
import { Button, Calendar, Popover, Select } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import "./DateFields.css";

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, month) => ({
  value: month,
  label: capitalize(dayjs().month(month).format("MMMM")),
}));

// Changes one part of the date, clamping the day so e.g. 31 Jan -> Feb stays in February
const setPart = (date, part, value) => {
  const year = part === "year" ? value : date.year();
  const month = part === "month" ? value : date.month();
  const day = part === "day" ? value : date.date();
  const base = dayjs().year(year).month(month).date(1).startOf("day");
  return base.date(Math.min(day, base.daysInMonth()));
};

const DateFields = ({ id, value, onChange, minDate, status }) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const date = value ?? minDate;
  const currentYear = dayjs().year();

  const dayOptions = Array.from({ length: date.daysInMonth() }, (_, index) => ({
    value: index + 1,
    label: String(index + 1).padStart(2, "0"),
  }));
  const yearOptions = [0, 1, 2].map((offset) => ({
    value: currentYear + offset,
    label: String(currentYear + offset),
  }));

  return (
    <div className="date-fields">
      <Select
        id={id}
        className="date-fields__day"
        variant="filled"
        status={status}
        aria-label="День"
        value={date.date()}
        options={dayOptions}
        onChange={(day) => onChange(setPart(date, "day", day))}
      />
      <Select
        className="date-fields__month"
        variant="filled"
        status={status}
        aria-label="Месяц"
        value={date.month()}
        options={MONTH_OPTIONS}
        onChange={(month) => onChange(setPart(date, "month", month))}
      />
      <Select
        className="date-fields__year"
        variant="filled"
        status={status}
        aria-label="Год"
        value={date.year()}
        options={yearOptions}
        onChange={(year) => onChange(setPart(date, "year", year))}
      />
      <Popover
        open={calendarOpen}
        onOpenChange={setCalendarOpen}
        trigger="click"
        placement="bottomRight"
        content={
          <Calendar
            className="date-fields__calendar"
            fullscreen={false}
            value={date}
            validRange={[minDate, dayjs().add(2, "year").endOf("year")]}
            onSelect={(selected, { source }) => {
              onChange(selected.startOf("day"));
              if (source === "date") setCalendarOpen(false);
            }}
          />
        }
      >
        <Button
          className="date-fields__calendar-btn"
          icon={<CalendarOutlined />}
          aria-label="Выбрать дату в календаре"
        />
      </Popover>
    </div>
  );
};

export default DateFields;
