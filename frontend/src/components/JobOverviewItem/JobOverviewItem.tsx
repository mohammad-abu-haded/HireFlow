import './JobOverviewItem.css'
interface IProps {
  title: string;
  value: string | number;
  Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
}
const JobOverviewItem = (props: IProps) => {
  return (
    <div className="job-overview-item">
      <div className="job-overview-item-icon">
        <props.Icon className="job-overview-icon" />
      </div>
      <div className="job-overview-item-content">
        <p className="job-overview-item-title">{props.title}</p>
        <p className="job-overview-item-value">{props.value}</p>
      </div>
    </div>
  )
}

export default JobOverviewItem
