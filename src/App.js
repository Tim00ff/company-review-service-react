import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { store } from './mockBackend/Store';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { ServiceDetail } from './components/ServiceDetail';

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
  
   const handleResetData = async () => {
    if (window.confirm('Are you sure you want to reset ALL data? This cannot be undone!')) {
      await store.resetToInitial();
      handleLogout();
    }
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
		{currentUser && (
          <button 
            onClick={handleResetData}
            className="danger"
            title="Reset all data to initial state"
          >
            Reset Data (Debug)
          </button>
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
		<Route path="/services/:id" element={
          currentUser ? <ServiceDetail /> : <Navigate to="/login" />
        }/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;