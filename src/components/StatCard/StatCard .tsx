import './StatCard.css';
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
}
const StatCard  = (props: StatCardProps) => {
  return (
    <div className='stat-card'>
      <p className='stat-title'>{props.title}</p>
      <div className='stat-value'>
        <h2 className='stat-value'>{props.value}</h2>
        <div className='stat-icon-container'>
            <props.icon className='stat-icon'/>
        </div>
      </div>
        {props.subtitle && <p className='stat-subtitle'>{props.subtitle}</p>}
    </div>
  )
}

export default StatCard 
