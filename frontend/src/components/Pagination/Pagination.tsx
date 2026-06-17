import "./Pagination.css";

interface IProps {
  pagination: number[];
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  totalItems: number;
  displayedItems: number;
  limit: number;
}
const Pagination = (props: IProps) => {
  const from = props.limit * (props.page - 1) + 1;
  const to = props.page * props.limit - (props.limit - props.displayedItems);
  return props.displayedItems > 0 ? (
    <footer className="pagination-container">
      <div className="results-summary">
        Showing{" "}
        <b>
          {from} - {to}
        </b>{" "}
        of <b>{props.totalItems}</b> results
      </div>
      {props.totalPages > 1 && (
        <div className="jobs-count">
          <button
            disabled={props.page === 1}
            onClick={() => props.setPage(props.page - 1)}
            className="pagination-action"
          >
            Previous
          </button>
          <div className="pagination-items-container">
            {props.pagination.map((item, index) => {
              if (item === -1) {
                return (
                  <span key={index} className="pagination-dots">
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={index}
                  onClick={() => props.setPage(item)}
                  className={`pagination-item ${props.page === item ? "pagination-item-active" : ""}`}
                >
                  {item}
                </button>
              );
            })}
          </div>
          <button
            disabled={props.page === props.totalPages}
            onClick={() => props.setPage(props.page + 1)}
            className="pagination-action"
          >
            Next
          </button>
        </div>
      )}
    </footer>
  ) : (
    <div></div>
  );
};

export default Pagination;
