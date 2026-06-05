import type { NotificationType } from '../../types';
import './Notification.css'
interface NotificationProps {
    message: string;
    type: NotificationType;
}
const Notification = ({ message, type }: NotificationProps) => {
  return (
    <div className="alert-overlay">
        <div className={`alert alert-${type}`}>
            {message}
        </div>
    </div>
  )
}

export default Notification
