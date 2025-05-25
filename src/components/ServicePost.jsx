import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from '../mockBackend/Store';
import styles from './ServicePost.module.css';
import { ServiceDetail } from './ServiceDetail';

export const ServicePost = ({ service, isDetail = false }) => {
  const navigate = useNavigate();
  const [userRating, setUserRating] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const user = await store.getCurrentUser();
      setCurrentUser(user);
      
      // Check existing interactions
      if (user) {
        setUserLiked(service.likes?.includes(user.id));
        setUserRating(service.ratings?.[user.id] || 0);
        
        // Increment views with cooldown
        store.incrementViews(service.id, user.id);
      }
    };
    loadUser();
  }, [service.id]);

  const handleRate = async (stars) => {
    if (!currentUser) return;
    
    try {
      await store.rateService(service.id, currentUser.id, stars);
      setUserRating(stars);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLike = async () => {
    if (!currentUser) return;
    
    try {
      await store.toggleLike(service.id, currentUser.id);
      setUserLiked(!userLiked);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/services/${service.id}`);
    alert('Link copied to clipboard!');
  };

  return (
    <div className={styles.servicePost}>
      <div className={styles.serviceHeader}>
        <h2>{service.sections[0].title}</h2>
      </div>

      <div className={styles.serviceContent}>
        {service.sections.map((section, index) => (
          <div key={index} className={styles.serviceSection}>
            {isDetail && <h3>{section.title}</h3>}
            <p>
              {isDetail 
                ? section.content
                : `${section.content.substring(0, 100)}...`
              }
            </p>
            {service.images[index] && (
              <img
                src={service.images[index]}
                alt={`Section ${index + 1}`}
                className={styles.sectionImage}
              />
            )}
          </div>
        ))}
      </div>

      <div className={styles.serviceFooter}>
        <div className={styles.stats}>
          <span>👁 {service.stats.views}</span>
          <button 
            onClick={handleLike}
            className={`${styles.likeButton} ${userLiked ? styles.liked : ''}`}
          >
            ❤️ {service.stats.likes}
          </button>
          <button onClick={handleShare} className={styles.shareButton}>
            🔗 Share
          </button>
        </div>

        <div className={styles.tags}>
          {service.tags.map((tag, i) => (
            <span key={i} className={styles.tag}>#{tag}</span>
          ))}
        </div>

        {!isDetail && (
          <button
            onClick={() => navigate(`/services/${service.id}`)}
            className={styles.readMore}
          >
            Read Full Review
          </button>
        )}
      </div>
    </div>
  );
};