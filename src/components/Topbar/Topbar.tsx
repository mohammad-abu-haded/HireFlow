import { useContext } from 'react';
import './Topbar.css'
import { AuthContext } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
const Topbar = () => {
    const navigate = useNavigate();
    const { isAuthenticated, userName } = useContext(AuthContext);
    
  return (
    <div className='topbar'>
        {isAuthenticated ? 
            <div className='user-info'>
                <div className='user-name-bar'>{userName}</div>
                <div className='user-initial'>{userName[0]}</div>
            </div> :
            <div className='signin-bar' onClick={() => navigate("/login")}>
                Login
            </div>
        }
    </div>
  )
}

export default Topbar