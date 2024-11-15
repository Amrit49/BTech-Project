import React, { useState } from 'react';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa';
import bg from '../assets/bg1.webp';
import logo from '../assets/logo.png';

const LoginPage = () => {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState('');


  const navigate = useNavigate();

  const handleLogin = async (e) => {
    
    e.preventDefault();   
    try {
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          password,
        }), // Send email and password
      });

 const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('roleposition_id', data.role_id);
        localStorage.setItem('token', data.token);
        
        // Handle successful login, navigate to the homepage or dashboard
        if(data.is_admin){
          navigate('/admin')
        }
        else{// Optional: log success message
          navigate('/main'); // Redirect to a home/dashboard page
          
        }
      } else {
        // Display error message
        setError(data.message);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div className='login-page'>
      <div className="wrapper">
        <div className="login_left">
          <img src={bg} alt="College Logo" className="college-image" />
        </div>

        <div className="login_right">
          <div className='logo-title-container'>
            <img src={logo} alt='College logo' className='college-logo' />
            <h2 className='app-title'> e-LEAVE IIITG </h2>
          </div>
          <form onSubmit={handleLogin}> {/* Add onSubmit handler */}
            <div className="input-box">
              <input 
                type='email' 
                name='email' 
                placeholder='E-Mail' 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
              <FaUser className='login__icon' />
            </div>
            <div className="input-box">
              <input 
                type='password' 
                name='password' 
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <FaLock className='login__icon' />
            </div>

            
            <button type="submit" className="login-button">Login</button> {/* Add the login button */}
            {error && <p className='error-message'>{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
