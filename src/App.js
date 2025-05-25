import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { store } from './mockBackend/Store';
import { HomePage } from './HomePage';
import { LoginPage } from './LoginPage';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Проверка сессии при загрузке
  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await store.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        setCurrentUser(null);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const handleLogout = () => {
    store.logout();
    setCurrentUser(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <nav>
        {currentUser ? (
          <>
            <span>Welcome, {currentUser.email}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>

      <Routes>
        <Route path="/login" element={
          currentUser ? <Navigate to="/" /> : 
          <LoginPage setCurrentUser={setCurrentUser} />
        }/>
        <Route path="/" element={
          currentUser ? <HomePage /> : <Navigate to="/login" />
        }/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;