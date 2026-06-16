import type { SetURLSearchParams } from "react-router-dom";
import "./StatusFilter.css";
import type { StatusFilterOption } from "../../types";
import { formatText } from "../../utils/text";

interface IProps {
  params: URLSearchParams;
  setParams: SetURLSearchParams;
  setPage?: React.Dispatch<React.SetStateAction<number>>;
  STATUS_FILTER_CONFIG: StatusFilterOption[];
}
const StatusFilter = (props: IProps) => {
  return (
    <div className="status-filter-container">
      {props.STATUS_FILTER_CONFIG.map((config, index) => (
        <div
          key={index}
          onClick={() => {
            config.isAll
              ? props.params.delete("status")
              : props.params.set("status", config.label);
            props.setParams(props.params);
            props.setPage && props.setPage(1);
          }}
          className={`${(config.isAll ? !props.params.get("status") : props.params.get("status") === config.label) ? "status-filter-active" : ""} status-filter`}
        >
          {formatText(config.label, { capitalizeFirstOnly: true })}
        </div>
      ))}
    </div>
  );
};

export default StatusFilter;
