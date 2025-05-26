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
        className="search-input"
      />
      
      <div className="services-grid">
        {services.map(service => (
          <ServicePost key={service.id} service={service} />
        ))}
      </div>

      <style jsx>{`
        .home-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .search-input {
          width: 100%;
          max-width: 600px;
          display: block;
          margin: 0 auto 2rem;
          padding: 1rem 1.5rem;
          font-size: 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 30px;
          outline: none;
          transition: all 0.3s ease;
          background-color: #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .search-input:focus {
          border-color: #4a90e2;
          box-shadow: 0 4px 6px rgba(74,144,226,0.1);
        }

        .search-input::placeholder {
          color: #9e9e9e;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(500px, 2fr));
          gap: 2rem;
          padding: 0 1rem;
        }

        @media (max-width: 768px) {
          .home-page {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};