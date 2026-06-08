import { useEffect, useState } from "react";
import type { FilterSection } from "../../types";
import "./FilterSidebar.css";
import type { SetURLSearchParams } from "react-router-dom";

interface IProps {
  section: FilterSection;
  setClear: React.Dispatch<React.SetStateAction<boolean>>;
  clear: boolean;
  setParams: SetURLSearchParams;
  params: URLSearchParams;
}

const FilterSidebar = (props: IProps) => {
  const [selected, setSelected] = useState<string[]>(
    props.params.getAll(props.section.id),
  );

  const handleQuery = (item_id: string, type: "add" | "remove") => {
    const query = props.section.id;
    if (type === "add") {
      props.params.append(query, item_id);
      console.log("a");
    } else {
      props.params.delete(query, item_id);      
    }
    props.setParams(props.params);
  };

  useEffect(() => {
    if (props.clear) {
      setSelected([]);
      props.setClear(false);
    }
  }, [props.clear]);

  return (
    <div className="filter-sidebar-container">
      <div className="filter-sidebar-title">{props.section.title}</div>

      <div className="filter-sidebar-items">
        {props.section.items.map((item) => (
          <div className="filter-sidebar-item" key={item.id}>
            <input
              type="checkbox"
              id={item.id}
              className="filter-sidebar-checkbox"
              checked={selected.includes(item.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelected((prev) => [...prev, item.id]);
                  handleQuery(item.id, "add");
                } else {
                  setSelected((prev) => prev.filter((id) => id !== item.id));
                  handleQuery(item.id, "remove");
                }
              }}
            />
            <label htmlFor={item.id}>{item.label}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterSidebar;
