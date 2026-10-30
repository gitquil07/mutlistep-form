import { Radio } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import "./CheckRadioGroup.css";

// Radio group styled as the design's check-circle options; the native antd radio
// stays in the DOM (visually hidden) so keyboard navigation keeps working.
const CheckRadioGroup = ({ options, value, onChange, direction = "vertical", ...rest }) => (
  <Radio.Group
    {...rest}
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className={`check-radio-group check-radio-group--${direction}`}
  >
    {options.map((option) => (
      <Radio
        key={option.value}
        value={option.value}
        classNames={{ icon: "check-radio__native", label: "check-radio__label" }}
      >
        <CheckCircleFilled
          className={`check-radio__icon${value === option.value ? " check-radio__icon--checked" : ""}`}
        />
        {option.label}
      </Radio>
    ))}
  </Radio.Group>
);

export default CheckRadioGroup;
