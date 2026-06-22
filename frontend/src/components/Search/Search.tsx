import "./Search.css";
import SearchIcon from "../../assets/icons/search.svg?react";
import type { SetURLSearchParams } from "react-router-dom";
interface IProps {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  params: URLSearchParams;
  setParams: SetURLSearchParams;
  placeholder: string;
  setPage?: React.Dispatch<React.SetStateAction<number>>;
}
const Search = (props: IProps) => {
  const handleSearch = (e: any) => {
    e.preventDefault();
    props.params.set("q", props.search);
    props.setParams(props.params);
    props.setPage && props.setPage(1);
    if (props.search === "") {
      props.params.delete("q");
      props.setParams(props.params);
    }
  };
  return (
    <form onSubmit={handleSearch} style={{width: "100%"}}>
      <div className="search-container">
        <SearchIcon
          className="search-icon"
          onClick={() => document.getElementById("search")?.focus()}
        />
        <input
          className="search-input"
          type="text"
          id="search"
          placeholder={props.placeholder}
          value={props.search}
          onChange={(e) => {
            props.setSearch(e.target.value);
            if (e.target.value === "") {
              props.params.delete("q");
              props.setParams(props.params);
            }
          }}
        />
        <div className="search-button-container">
          <input className="search-button" value="Search" type="submit" />
        </div>
      </div>
    </form>
  );
};

export default Search;
