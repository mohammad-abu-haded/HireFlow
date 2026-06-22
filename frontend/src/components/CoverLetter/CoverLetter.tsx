import "./CoverLetter.css";
import Icon from "../../assets/icons/comment.svg?react";
interface IProps {
  CoverLetter: string;
}
const CoverLetter = (props: IProps) => {
  return (
    <div className="cover-letter">
      <div className="cover-letter-header">
        <Icon className="cover-letter-icon" />
        Cover Letter
      </div>
      <div className="cover-letter-content">
        {props.CoverLetter ? (
          <p>{props.CoverLetter}</p>
        ) : (
          <p className="cover-letter-empty">Not provided</p>
        )}
      </div>
    </div>
  );
};

export default CoverLetter;
