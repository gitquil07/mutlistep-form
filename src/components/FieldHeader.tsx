import { Tooltip } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import "./FieldHeader.css";

interface FieldHeaderProps {
  title: string;
  // Id of the control the title labels; without it the title is plain text
  htmlFor?: string;
  hint?: string;
}

const FieldHeader = ({ title, htmlFor, hint }: FieldHeaderProps) => (
  <div className="field-header">
    {htmlFor ? (
      <label className="field-header__title" htmlFor={htmlFor}>
        {title}
      </label>
    ) : (
      <span className="field-header__title">{title}</span>
    )}
    {hint && (
      <Tooltip title={hint} placement="topRight">
        <QuestionCircleOutlined
          className="field-header__hint"
          aria-label={hint}
          tabIndex={0}
        />
      </Tooltip>
    )}
  </div>
);

export default FieldHeader;
