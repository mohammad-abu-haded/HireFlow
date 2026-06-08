import type { JobCardProps } from '../../types';
import { formatSalary } from '../../utils/formatSalary';
import './JobCard.css'

const JobCard = (props: JobCardProps) => {
  return (
    <div className='job-card-container'>
        <div className='job-card-details-container'>
          <div className="job-card-details-profile">
            {props.companyName[0]}
          </div>

          <div className="job-card-details">
              <div className="job-card-job-title">
                {props.jobTitle}
              </div>

              <div className="job-card-salary">
                {formatSalary(props.salaryMin, props.salaryMax)}
              </div>
          </div>
            
        </div>

        <div className='job-card-actions-container'>
          <button className='job-card-apply-button'>
            Apply Now
          </button>
        </div>
    </div>
  )
}

export default JobCard
