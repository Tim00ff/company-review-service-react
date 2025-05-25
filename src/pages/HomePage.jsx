import { useState, useEffect } from 'react';
import { ServicePost } from '../components/ServicePost';
import { store } from '../mockBackend/Store';

export const HomePage = () => {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadServices = async () => {
      const results = await store.searchServices(searchTerm);
      setServices(results);
    };
    loadServices();
  }, [searchTerm]);

  return (
    <div className="home-page">
      <input
        type="text"
        placeholder="Search services..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      
      <div className="services-grid">
        {services.map(service => (
          <ServicePost key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
};