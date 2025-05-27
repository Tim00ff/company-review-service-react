import { useState } from 'react';
import { store } from '../mockBackend/Store';

export function LoginPage({ setCurrentUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
	  email: '',
	  password: '',
	  role: 'user',
	  managerName: '',
	  companyName: ''
});
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // Логин
        const { token, user } = await store.login(formData.email, formData.password);
        localStorage.setItem('sessionToken', token);
        setCurrentUser(user);
      } else {
        // Регистрация
        let user;
        if (formData.role === 'manager') {
          alert('Manager account requires admin approval');
		  user = await store.registerUser({
			  email: formData.email,
			  password: formData.password,
			  role: formData.role,
			  managerName: formData.managerName,
			  companyName: formData.companyName
			});
        }
		else{
			user = await store.registerUser({
			  email: formData.email,
			  password: formData.password,
			  role: formData.role
			});
		}
        setIsLogin(true); 
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="auth-form">
        <div className="form-header">
          <h1>Welcome to ReviewHub</h1>
          <p>{isLogin ? 'Sign in to continue' : 'Create your account'}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              placeholder=" "
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <label>Email Address</label>
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder=" "
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <label>Password</label>
          </div>
		{!isLogin && formData.role === 'manager' && (
		<div>
			<div className="input-group">
				<input
				  type="text"
				  placeholder="Your Full Name"
				  required
				  value={formData.managerName}
				  onChange={e => setFormData({...formData, managerName: e.target.value})}
				/>
			</div> 
			<div className="input-group">
				<input
				  type="text"
				  placeholder="Company Name"
				  required
				  value={formData.companyName}
				  onChange={e => setFormData({...formData, companyName: e.target.value})}
				/>
			</div>
		</div>
			)}
          {!isLogin && (
            <div className="role-selector">
              <button
                type="button"
                className={`role-option ${formData.role === 'user' ? 'active' : ''}`}
                onClick={() => setFormData({...formData, role: 'user'})}
              >
                Regular User
              </button>
              <button
                type="button"
                className={`role-option ${formData.role === 'manager' ? 'active' : ''}`}
                onClick={() => setFormData({...formData, role: 'manager'})}
              >
                Company Manager
              </button>
            </div>
          )}

          <button type="submit" className="submit-btn">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="form-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              className="toggle-mode"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Register here' : 'Login here'}
            </button>
          </p>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
         
          padding: 20px;
        }

        .auth-form {
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 440px;
        }

        .form-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .form-header h1 {
          color: #2d3748;
          font-size: 28px;
          margin-bottom: 8px;
          font-weight: 700;
        }

        .form-header p {
          color: #718096;
          font-size: 16px;
        }

        .input-group {
          position: relative;
          margin-bottom: 24px;
        }

        .input-group input {
          width: 90%;
          height: 12px;
          padding: 15px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .input-group input:focus {
          border-color: #667eea;
          outline: none;
        }

        .input-group label {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #718096;
          background: white;
          padding: 0 8px;
          transition: all 0.3s ease;
          pointer-events: none;
        }

        .input-group input:focus ~ label,
        .input-group input:not(:placeholder-shown) ~ label {
          top: 0;
          font-size: 14px;
          color: #667eea;
        }

        .role-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }

        .role-option {
          padding: 12px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .role-option.active {
          border-color: #667eea;
          background: #f0f4ff;
          color: #667eea;
        }

        .submit-btn {
          width: 98.5%;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
        }

        .form-footer {
          text-align: center;
          margin-top: 24px;
          color: #718096;
        }

        .toggle-mode {
          background: none;
          border: none;
          color: #667eea;
          text-decoration: underline;
          cursor: pointer;
          padding: 0;
          font-size: inherit;
        }

        .error-message {
          background: #fed7d7;
          color: #c53030;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          font-size: 14px;
        }
		}
      `}</style>
    </div>
  );
};