import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { store } from '../mockBackend/Store';
import styles from './ManagerDashboard.module.css';

export const ManagerDashboardPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const user = await store.getCurrentUser();
      if (!user || user.role !== 'manager') {
        navigate('/');
        return;
      }
      setCurrentUser(user);
      
      if (user.companyId) {
        const managerServices = await (await store.getServicesByCompany(user.companyId))
      .filter(service => service.userId === user.id);
        setServices(managerServices);
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [navigate]);
  
  const handleDelete = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service? This cannot be undone.')) {
      try {
        await store.deleteService(serviceId);
        setServices(prev => prev.filter(service => service.id !== serviceId));
      } catch (error) {
        alert(`Error deleting service: ${error.message}`);
      }
    }
  };

  const handleEdit = (serviceId) => {
    navigate(`/edit-service/${serviceId}`);
  };

  if (loading) return <div className={styles.loading}>Loading your services...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Your Service Posts</h1>
        <Link to="/create-service" className={styles.createButton}>
          + Create New Service
        </Link>
      </div>

      {services.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>No services yet</h2>
          <p>You haven't created any service posts yet. Create your first service to get started!</p>
          <Link to="/create-service" className={styles.createButton}>
            Create Your First Service
          </Link>
        </div>
      ) : (
        <div className={styles.servicesGrid}>
          {services.map(service => (
            <div key={service.id} className={styles.serviceCard}>
              <div className={styles.cardHeader}>
                <h3>{service.sections[0]?.title || 'Untitled Service'}</h3>
                <div className={styles.stats}>
                  <span>👁 {service.stats?.views || 0}</span>
                  <span>❤️ {service.stats?.likes || 0}</span>
                  <span>⭐ {service.averageRating?.toFixed(1) || 0}</span>
                </div>
              </div>
              
              <div className={styles.previewContent}>
                <p>{service.sections[0]?.content.substring(0, 150) + '...' || 'No content'}</p>
                {service.images[0] && (
                  <img 
                    src={service.images[0]} 
                    alt="Service preview" 
                    className={styles.previewImage}
                  />
                )}
              </div>
              
              <div className={styles.tags}>
                {service.tags?.map((tag, i) => (
                  <span key={i} className={styles.tag}>#{tag}</span>
                ))}
              </div>
              
              <div className={styles.cardFooter}>
                <button 
                  onClick={() => handleEdit(service.id)}
                  className={styles.editButton}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(service.id)}
                  className={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerDashboardPage;