import { useEffect, useRef } from "react";
import AddIcon from "../../assets/icons/add.svg?react";
import DeleteIcon from "../../assets/icons/delete.svg?react";
interface IProps {
  setState: (newState: string[]) => void;
  state: string[];
  label: string;
  placeholder: string;
}
const DynamicList = (props: IProps) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const lastIndex = props.state.length - 1;
    if (lastIndex >= 0) {
      inputRefs.current[lastIndex]?.focus();
    }
  }, [props.state.length]);

  const handleChange = (index: number, value: string) => {
    const newState = [...props.state];
    newState[index] = value;
    props.setState(newState);
  };

  const handleAdd = () => {
    const newState = [...props.state, ""];
    props.setState(newState);
  };
  return (
    <div className="form-group">
      <div className="form-group-header">
        <label>{props.label}</label>
        <button type="button" className="add-to-section" onClick={handleAdd}>
          <AddIcon className="add-icon" />
          <p>Add {props.placeholder}</p>
        </button>
      </div>
      <div className="inputs-grid">
        {props.state.map((resp, index) => (
          <div className="dynamic-input" key={index}>
            <input
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              placeholder={`${props.placeholder} ${index + 1}`}
              value={resp}
              onChange={(e) => {
                handleChange(index, e.target.value);
              }}
              required
            />
            <DeleteIcon
              className="delete-icon"
              onClick={() => {
                const newState: string[] = props.state.filter(
                  (_, i) => i !== index,
                );
                props.setState(newState);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DynamicList;
