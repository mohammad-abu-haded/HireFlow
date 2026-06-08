import type { NotificationType } from '../../types';
import './NotificationOverlay.css'
interface NotificationProps {
    message: string;
    type: NotificationType;
}
const NotificationOverlay = ({ message, type }: NotificationProps) => {
  return (
    <div className="alert-overlay">
        <div className={`alert alert-${type}`}>
            {message}
        </div>
    </div>
  )
}

export default NotificationOverlay
