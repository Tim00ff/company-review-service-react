import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from '../mockBackend/Store';
import styles from './ServicePost.module.css';

export const ServicePost = ({ service, isDetail = false, onUpdate }) => {
  const navigate = useNavigate();
  const [userRating, setUserRating] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const loadUser = async () => {
      const user = await store.getCurrentUser();
      setCurrentUser(user);
      
      if (user) {
        setUserLiked(service.likes?.includes(user.id));
        setUserRating(service.ratings?.[user.id] || 0);
        store.incrementViews(service.id, user.id);
      }
    };
    
    const updateRating = () => {
    setAverageRating(service.averageRating || 0); // Use service.averageRating
  };

    loadUser();
    updateRating();
  }, [service.id, service.comments]);

  const handleRate = async (stars) => {
    if (!currentUser) return;
    
    try {
      await store.rateService(service.id, currentUser.id, stars);
      setUserRating(stars);
      setAverageRating(store.getServiceAverageRating(service.id));
      onUpdate?.();
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
		<div className={styles.ratingSummary}>
		  <div className={styles.stars}>
			{[1, 2, 3, 4, 5].map((star) => {
			  const isFilled = star <= averageRating;
			  const isHalf = !isFilled && (averageRating + 0.5) >= star;
			  
			  return (
				<span
				  key={star}
				  className={`${styles.star} ${
					isFilled ? styles.filled : ''
				  } ${
					isHalf ? styles.half : ''
				  }`}
				>
				  ★
				</span>
			  );
			})}
		  </div>
		  <div className={styles.ratingText}>
			{averageRating.toFixed(1)}/5 ({service.comments?.length || 0} reviews)
		  </div>
		</div>
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

export default ServicePost;