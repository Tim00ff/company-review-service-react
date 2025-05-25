import { useState } from 'react';
import { store } from '../mockBackend/Store';

export function LoginPage({ setCurrentUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user'
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
        const user = await store.registerUser({
          email: formData.email,
          password: formData.password,
          role: formData.role
        });
        if (formData.role === 'manager') {
          alert('Manager account requires admin approval');
        }
        setIsLogin(true); // Переключить на форму логина
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
        />
        
        {!isLogin && (
          <div className="role-selector">
            <label>
              <input
                type="radio"
                name="role"
                value="user"
                checked={formData.role === 'user'}
                onChange={() => setFormData({...formData, role: 'user'})}
              />
              Regular User
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="manager"
                checked={formData.role === 'manager'}
                onChange={() => setFormData({...formData, role: 'manager'})}
              />
              Company Manager
            </label>
          </div>
        )}

        <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
      </form>

      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Need an account? Register' : 'Already have account? Login'}
      </button>
    </div>
  );
}
