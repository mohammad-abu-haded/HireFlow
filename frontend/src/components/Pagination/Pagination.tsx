import "./Pagination.css";

interface IProps {
  pagination: number[];
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  totalJobs: number;
  displayedJobs: number;
  limit: number;
}
const Pagination = (props: IProps) => {
    const from = (props.limit * (props.page - 1) + 1);
    const to = props.page * props.limit - (props.limit - props.displayedJobs);
  return (
    <footer className="pagination-container">
        <div className="results-summary">
            Showing <b>{from} - {to}</b> of <b>{props.totalJobs}</b> results
        </div>
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
    </footer>
  );
};

export default Pagination;
