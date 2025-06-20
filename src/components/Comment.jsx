import { useState } from 'react';
import { store } from '../mockBackend/Store';
import styles from './Comment.module.css';

const Comment = ({ comment, currentUser, onUpdate, serviceOwnerId }) => {
  const [replyText, setReplyText] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState({});
  
  const maxPreviewLength = 200;
  const initialRepliesToShow = 1;

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      await store.addReply(comment.id, currentUser.id, replyText);
      setReplyText('');
      setShowReplyForm(false);
      onUpdate?.();
    } catch (error) {
      alert(error.message);
    }
  };

  const toggleReplyExpansion = (replyId) => {
    setExpandedReplies(prev => ({ ...prev, [replyId]: !prev[replyId] }));
  };

  const visibleReplies = showAllReplies 
    ? comment.replies 
    : comment.replies?.slice(0, initialRepliesToShow) || [];

  const commentUser = store.data.users.find(u => u.id === comment.userId);
  const isManager = currentUser?.role === 'manager';
  const authorRating = comment.authorRating || 0;
  const canReply = isManager && currentUser.id === serviceOwnerId;

const handleReplyLike = async (replyId) => {
    if (!currentUser) {
      alert('Please login to like replies');
      return;
    }
    try {
      await store.toggleReplyLike(replyId, currentUser.id);
      onUpdate?.();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleReplyDislike = async (replyId) => {
    if (!currentUser) {
      alert('Please login to dislike replies');
      return;
    }
    try {
      await store.toggleReplyDislike(replyId, currentUser.id);
      onUpdate?.();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className={styles.comment}>
      <div className={styles.commentHeader}>
        <div className={styles.userInfo}>
          <span className={styles.author}>
            {commentUser?.email || 'Anonymous'}
          </span>
          <span className={styles.date}>
            {new Date(comment.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>
        
        <div className={styles.ratingStars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`${styles.star} ${
                authorRating >= star ? styles.active : ''
              }`}
              aria-label={`${star} stars`}
            >
              ★
            </span>
          ))}
          <span className={styles.authorRating}>
            ({authorRating.toFixed(1)})
          </span>
        </div>
      </div>

      <p className={styles.commentText}>{comment.text}</p>

      <div className={styles.commentFooter}>
        <div className={styles.reactions}>
          <button
            className={`${styles.likeButton} ${
              comment.likes?.includes(currentUser?.id) ? styles.active : ''
            }`}
            onClick={async () => {
              if (!currentUser) {
                alert('Please login to like comments');
                return;
              }
              await store.toggleCommentLike(comment.id, currentUser.id);
              onUpdate?.();
            }}
          >
            ❤️ {comment.likes?.length || 0}
          </button>
          
          <button
            className={`${styles.dislikeButton} ${
              comment.dislikes?.includes(currentUser?.id) ? styles.active : ''
            }`}
            onClick={async () => {
              if (!currentUser) {
                alert('Please login to dislike comments');
                return;
              }
              await store.toggleCommentDislike(comment.id, currentUser.id);
              onUpdate?.();
            }}
          >
            💔 {comment.dislikes?.length || 0}
          </button>
        </div>
        
        {canReply && (
          <div className={styles.replyActions}>
            <button 
              onClick={() => setShowReplyForm(!showReplyForm)}
              className={styles.toggleReplyButton}
            >
              {showReplyForm ? 'Cancel' : 'Reply'}
            </button>
          </div>
        )}
      </div>

      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className={styles.replyForm}>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your official response..."
            rows="2"
            maxLength="500"
          />
          <button 
            type="submit" 
            className={styles.submitReplyButton}
            disabled={!replyText.trim()}
          >
            Post Response
          </button>
        </form>
      )}

      {comment.replies?.length > 0 && (
        <div className={styles.repliesContainer}>
          {visibleReplies.map((reply) => {
            const isExpanded = expandedReplies[reply.id];
            const needsTruncation = reply.text.length > maxPreviewLength;
            const displayText = isExpanded || !needsTruncation 
              ? reply.text 
              : `${reply.text.substring(0, maxPreviewLength)}...`;

            return (
              <div key={reply.id} className={styles.reply}>
                <div className={styles.replyHeader}>
                  <span className={styles.replyAuthor}>
				  {store.data.users.find(u => u.id === reply.userId)?.email}
                   {store.data.users.find(u => u.id === reply.userId)?.companyName}
                  </span>
                  <span className={styles.replyDate}>
                    {new Date(reply.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className={styles.replyText}>
                  {displayText}
                  {needsTruncation && (
                    <button
                      className={styles.expandButton}
                      onClick={() => toggleReplyExpansion(reply.id)}
                    >
                      {isExpanded ? ' Show less' : ' Show more'}
                    </button>
                  )}
                </p>
				<div className={styles.replyActions}>
				<button
				  className={`${styles.likeButton} ${
					reply.likes?.includes(currentUser?.id) ? styles.active : ''
				  }`}
				  onClick={() => handleReplyLike(reply.id)}
				>
				  ❤️ {reply.likes?.length || 0}
				</button>
				
				<button
				  className={`${styles.dislikeButton} ${
					reply.dislikes?.includes(currentUser?.id) ? styles.active : ''
				  }`}
				  onClick={() => handleReplyDislike(reply.id)}
				>
				  💔 {reply.dislikes?.length || 0}
				</button>
			  </div>
              </div>
            );
          })}

          {comment.replies.length > initialRepliesToShow && !showAllReplies && (
            <button
              className={styles.showMoreReplies}
              onClick={() => setShowAllReplies(true)}
            >
              Show all {comment.replies.length} replies
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Comment;