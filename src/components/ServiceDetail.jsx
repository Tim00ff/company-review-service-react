import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { store } from '../mockBackend/Store';
import ServicePost from './ServicePost';
import Comment from '../components/Comment';
import styles from './ServicePost.module.css';

export const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const user = await store.getCurrentUser();
      setCurrentUser(user);
      const serviceData = await store.getService(id);
      setService(serviceData);
    };
    loadData();
  }, [id]);

  const handleCommentSubmit = async (e) => {
  e.preventDefault();
  if (!currentUser || !commentText.trim() || commentRating === 0) {
    alert('Please select rating and write comment');
    return;
  }

  try {
    await store.addComment(service.id, currentUser.id, commentText, commentRating);
    const updatedService = await store.getService(service.id);
    setService(updatedService);
    setCommentText('');
    setCommentRating(0);
  } catch (error) {
    alert(error.message);
  }
  const updatedService = await store.getService(service.id);
  setService(updatedService);
};

  if (!service) return <div className={styles.loading}>Loading service details...</div>;

  return (
    <div className={styles.serviceDetail}>
      <ServicePost service={service} isDetail onUpdate={() => setService({...service})} />

      <div className={styles.commentsSection}>
        <h2>Customer Reviews</h2>
        
        <div className={styles.ratingDistribution}>
		  {[5, 4, 3, 2, 1].map((rating) => {
			const count = service.comments?.filter(c => c.authorRating === rating).length || 0;
			const percentage = (count / service.comments?.length * 100) || 0;
			
			return (
			  <div key={rating} className={styles.ratingBar}>
				<div className={styles.ratingLabel}>{rating}★</div>
				<div className={styles.barContainer}>
				  <div 
					className={styles.barFill} 
					style={{ width: `${percentage}%` }}
				  />
				</div>
				<div className={styles.ratingCount}>{count}</div>
			  </div>
			);
		  })}
		  </div>

        {/* Форма добавления комментария */}
        {currentUser && (
          <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
            <div className={styles.ratingInput}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={`${styles.star} ${
                    commentRating >= star ? styles.selected : ''
                  }`}
                  onClick={() => setCommentRating(star)}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your experience..."
              rows="4"
            />
            <button type="submit" className={styles.submitButton}>
              Submit Review
            </button>
          </form>
        )}

        {/* Список комментариев */}
        <div className={styles.commentsList}>
          {service.comments?.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              onUpdate={async () => {
			  const updatedService = await store.getService(id);
			  setService(updatedService);
			}}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;