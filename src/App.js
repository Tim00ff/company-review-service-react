import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { store } from './mockBackend/Store';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { ServiceDetail } from './components/ServiceDetail';
import { AdminPanel } from './components/AdminPanel';
import { ServiceCreationPage } from './pages/ServiceCreationPage'; 
import { ManagerDashboardPage } from './pages/ManagerDashboardPage'; 

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
            <div className="nav-links">
              <Link to="/" className="nav-link">Home</Link>
              {currentUser?.role === 'manager' && (
                <Link to="/create-service" className="nav-link">Create Service</Link>
              )}
              {currentUser?.role === 'admin' && (
                <Link to="/admin" className="nav-link">Admin Panel</Link>
              )}
			  {currentUser?.role === 'manager' && (
			    <Link to="/manager-dashboard" className="nav-link">Dashboard</Link>
			  )}
            </div>
            
            <div className="user-info">
              <span className="user-email">{currentUser.email}</span>
              <div className="nav-buttons">
                <button onClick={handleLogout}>Logout</button>
                {currentUser?.role === 'admin' && (
                  <button 
                    onClick={handleResetData}
                    className="danger"
                    title="Reset all data to initial state"
                  >
                    Reset Data (Debug)
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <Link to="/login" className="login-link">Login</Link>
        )}
  
        <style jsx>{`
          nav {
            background: #2c3e50;
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          
          .nav-links {
            display: flex;
            gap: 1.5rem;
          }
          
          .nav-link {
            color: #ecf0f1;
            text-decoration: none;
            padding: 0.5rem;
            border-radius: 4px;
            transition: background 0.2s ease;
          }
          
          .nav-link:hover {
            background: rgba(255, 255, 255, 0.1);
          }
          
          .user-info {
            display: flex;
            align-items: center;
            gap: 1.5rem;
          }
          
          .user-email {
            color: #ecf0f1;
            font-size: 0.9rem;
            opacity: 0.9;
          }
          
          .nav-buttons {
            display: flex;
            gap: 1rem;
          }
          
          nav button {
            background: #3498db;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.9rem;
          }
          
          nav button:hover {
            background: #2980b9;
          }
          
          nav .danger {
            background: #e74c3c;
          }
          
          nav .danger:hover {
            background: #c0392b;
          }
          
          nav .login-link {
            color: #ecf0f1;
            text-decoration: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            transition: background 0.2s ease;
          }
          
          nav .login-link:hover {
            background: rgba(255, 255, 255, 0.1);
          }
          
          @media (max-width: 768px) {
            nav {
              padding: 1rem;
              flex-wrap: wrap;
              gap: 0.5rem;
            }
            
            .nav-links {
              gap: 0.5rem;
            }
            
            .user-info {
              flex-wrap: wrap;
              gap: 0.5rem;
            }
            
            .user-email {
              margin-right: 1rem;
              font-size: 0.8rem;
            }
            
            nav button {
              padding: 0.4rem 0.8rem;
              font-size: 0.8rem;
            }
          }
        `}</style>
      </nav>
      <style jsx>{`#root {background: linear-gradient(135deg, #AEF78E 0%, #66A182 100%);}`}</style>
      
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
        <Route path="/admin" element={
          currentUser?.role === 'admin' 
            ? <AdminPanel /> 
            : <Navigate to="/" />
        }/>
        <Route path="/create-service" element={
          currentUser?.role === 'manager' 
            ? <ServiceCreationPage /> 
            : <Navigate to="/" />
        }/>
		<Route path="/manager-dashboard" element={
          currentUser?.role === 'manager' 
            ? <ManagerDashboardPage /> 
            : <Navigate to="/" />
        }/>
		<Route path="/edit-service/:serviceId" element={
		  currentUser?.role === 'manager' 
			? <ServiceCreationPage /> 
			: <Navigate to="/" />
		}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;