import type { IForm } from '../../types';
import './JobBenefitsCard.css'
import BenefitsIcon from '../../assets/icons/arrow-up.svg?react';
import BenefitsTitleIcon from '../../assets/icons/gift.svg?react';
interface IProps {
  benefits: IForm["benefits"];
}
const JobBenefitsCard = (props: IProps) => {
  return (
    <div className="job-benefits-card">
      <div className="job-benefits-header">
        <div className="job-benefits-title">
          <BenefitsTitleIcon className="benefits-title-icon" />
          <h3>Employee Benefits</h3>
        </div>
      </div>
      <div className="benefits-list">
        {props.benefits.map((benefit, index) => (
          <div className="benefit-item" key={index}>
            <BenefitsIcon className="benefits-icon" />
            <p>{benefit}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default JobBenefitsCard
