import "./JobOverviewCard.css";
import DateIcon from "../../assets/icons/calender.svg?react";
import JobTypeIcon from "../../assets/icons/clock.svg?react";
import SalaryIcon from "../../assets/icons/dollar-sign.svg?react";
import WorkSettingIcon from "../../assets/icons/work-setting.svg?react";
import LevelIcon from "../../assets/icons/star.svg?react";
import JobIcon from "../../assets/icons/briefcase-bag.svg?react";
import JobOverviewItem from "../JobOverviewItem/JobOverviewItem";
import { formatDisplayDateTime } from "../../utils/dateFormatter";
import { formatText } from "../../utils/text";
interface IProps {
  jobType: string;
  salaryRange: string;
  workSetting: string;
  experienceLevel: string;
  Deadline: string;
  employmentType?: string;
  Duration?: string;
}
const JobOverviewCard = (props: IProps) => {
  return (
    <div className="job-overview-card">
      <div className="job-overview-header">
        <div className="job-overview-title-container">
          <JobIcon className="job-overview-title-icon" />
          <h3 className="job-overview-title">Job Overview</h3>
        </div>
      </div>
      <div className="job-overview-content">
        <JobOverviewItem
          title="Salary Range"
          value={props.salaryRange}
          Icon={SalaryIcon}
        />
        <JobOverviewItem
          title="Job Type"
          value={formatText(
            `${props.jobType} / ${
              props.employmentType ? ` - ${props.employmentType}` : ""
            }${props.Duration ? ` - ${props.Duration}` : ""}`,
            {
              replaceSeparators: true,
              capitalizeWords: true,
            },
          )}
          Icon={JobTypeIcon}
        />
        <JobOverviewItem
          title="Work Setting"
          value={formatText(props.workSetting, { capitalizeWords: true })}
          Icon={WorkSettingIcon}
        />
        <JobOverviewItem
          title="Experience Level"
          value={formatText(props.experienceLevel, { capitalizeWords: true })}
          Icon={LevelIcon}
        />
        <JobOverviewItem
          title="Application Deadline"
          value={formatDisplayDateTime(props.Deadline)}
          Icon={DateIcon}
        />
      </div>
    </div>
  );
};

export default JobOverviewCard;
