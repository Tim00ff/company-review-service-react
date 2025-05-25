import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { store } from '../mockBackend/Store';
import { ServicePost } from '../components/ServicePost';
import styles from '../components/ServicePost.module.css';

const Comment = ({ comment, currentUser, onUpdate }) => {
  const [localComment, setLocalComment] = useState(comment);

  const handleLike = async () => {
    if (!currentUser) {
      alert('Please login to like comments');
      return;
    }
    
    try {
      const updated = await store.toggleCommentLike(comment.id, currentUser.id);
      setLocalComment(updated);
      onUpdate?.();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDislike = async () => {
    if (!currentUser) {
      alert('Please login to dislike comments');
      return;
    }

    try {
      const updated = await store.toggleCommentDislike(comment.id, currentUser.id);
      setLocalComment(updated);
      onUpdate?.();
    } catch (error) {
      alert(error.message);
    }
  };

  const commentUser = store.data.users.find(u => u.id === comment.userId);

  return (
    <div className={styles.comment}>
      <div className={styles.commentHeader}>
        <span className={styles.commentAuthor}>
          {commentUser?.email || 'Anonymous'}
        </span>
        <span className={styles.commentDate}>
          {new Date(comment.createdAt).toLocaleDateString()}
        </span>
      </div>
      
      <p className={styles.commentText}>{localComment.text}</p>
      
      <div className={styles.commentActions}>
        <button
          onClick={handleLike}
          className={`${styles.likeButton} ${
            localComment.likes?.includes(currentUser?.id) ? styles.active : ''
          }`}
        >
          ❤️ {localComment.likes?.length || 0}
        </button>
        
        <button
          onClick={handleDislike}
          className={`${styles.dislikeButton} ${
            localComment.dislikes?.includes(currentUser?.id) ? styles.active : ''
          }`}
        >
          💔 {localComment.dislikes?.length || 0}
        </button>
      </div>
    </div>
  );
};

export const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [updateFlag, setUpdateFlag] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const user = await store.getCurrentUser();
      setCurrentUser(user);
      
      const serviceData = await store.getService(id);
      setService(serviceData);
    };
    loadData();
  }, [id, updateFlag]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !commentText.trim()) return;

    try {
      await store.addComment(id, currentUser.id, commentText.trim());
      setCommentText('');
      setUpdateFlag(prev => !prev); 
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCommentUpdate = () => {
    setUpdateFlag(prev => !prev);
  };

  if (!service) return <div className={styles.loading}>Loading service details...</div>;

  return (
    <div className={styles.serviceDetail}>
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        ← Back to List
      </button>

      <ServicePost service={service} isDetail onUpdate={() => setUpdateFlag(prev => !prev)} />

      <div className={styles.commentsSection}>
        <h2>Comments ({service.comments?.length || 0})</h2>

        {currentUser && (
          <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your thoughts..."
              rows="3"
              maxLength="500"
            />
            <button type="submit" className={styles.submitButton}>
              Post Comment
            </button>
          </form>
        )}

        <div className={styles.commentsList}>
          {service.comments?.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              onUpdate={handleCommentUpdate}
            />
          ))}
        </div>
      </div>
    </div>
  );
};