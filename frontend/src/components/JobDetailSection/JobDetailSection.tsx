import type { JobDetailSectionType } from "../../types";
import "./jobDescription.css";

interface IProps {
  title: string;
  type: JobDetailSectionType;
  content?: string;
  list?: string[];
  Icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
}
const JobDetailSection = (props: IProps) => {
  const renderDescription = (): React.ReactNode => {
    return !!props.content?.trim() ? (
      <p className="job-detail-section-content">{props.content}</p>
    ) : (
      <p className="job-detail-section-empty-message">
        No information provided
      </p>
    );
  };

  const renderListSection = (): React.ReactNode => {
    return (
      <div className="job-detail-section-list">
        {!!props.list?.length ? (
          props.list.map((item, index) => (
            <div
              className="job-detail-section-item"
              key={`${index} ${props.title}`}
            >
              {props.Icon && (
                <props.Icon className="job-detail-section-list-icon" />
              )}
              <p>{item}</p>
            </div>
          ))
        ) : (
          <p className="job-detail-section-empty-message">
            No information provided
          </p>
        )}
      </div>
    );
  };

  const renderSkills = (): React.ReactNode => (
    <div className="job-detail-section-skills-container">
      {!!props.list?.length ? (
        props.list.map((skill) => (
          <div className="job-detail-section-skill">
            {skill}
          </div>
        ))
      ) : (
        <p className="job-detail-section-empty-message">
          No information provided
        </p>
      )}
    </div>
  );
  const renderSectionContent = (): React.ReactNode => {
    if (props.type === "DESCRIPTION") return renderDescription();
    if (props.type === "KEY_RESPONSIBILITIES" || props.type === "REQUIREMENTS")
      return renderListSection();
    if (props.type === "SKILLS") return renderSkills();
  };
  return (
    <div className="job-detail-section-main">
      <div className="title-job-details-section">{props.title}</div>
      {renderSectionContent()}
    </div>
  );
};

export default JobDetailSection;
