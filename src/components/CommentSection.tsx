'use client';
import React, { useState } from 'react';

export default function CommentSection({
  noteId,
  comments,
  user,
  onUpdate
}: {
  noteId: string;
  comments: any[];
  user: any;
  onUpdate: () => void
}) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const [showAll, setShowAll] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('Please login to comment');
    if (!text.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/notes/${noteId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        setText('');
        onUpdate();
      }
    } catch (err) { }
    setLoading(false);
  };

  const handleCommentLike = async (commentId: string) => {
    if (!user) return alert('Please login to like comments');
    try {
      const res = await fetch(`/api/notes/${noteId}/comments/${commentId}/like`, { method: 'POST' });
      if (res.ok) onUpdate();
    } catch (err) { }
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!user) return;
    if (!(user.role === 'admin' || user.role === 'owner')) return;
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const res = await fetch(`/api/notes/${noteId}/comments/${commentId}`, { method: 'DELETE' });
      if (res.ok) {
        onUpdate();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const sortedComments = [...(comments || [])].sort((a, b) => {
    const likesA = a.likes?.length || 0;
    const likesB = b.likes?.length || 0;
    if (likesB !== likesA) return likesB - likesA;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const displayedComments = showAll ? sortedComments : sortedComments.slice(0, 5);

  return (
    <div className="comment-section-refined animate-fade">
      <div className="section-header-inline">
        <h3 className="section-title">Public Comments ({comments?.length || 0})</h3>
      </div>

      <div className="comments-list-refined">
        {displayedComments.map((comment, idx) => {
          const isLiked = user ? comment.likes?.includes(user.username) : false;
          return (
            <div key={comment._id || idx} className="comment-item-refined glass-card animate-fade" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="comment-main">
                <p className="comment-text-content">{comment.text}</p>
                <div className="comment-footer-row">
                  <div className="comment-footer-info">
                    <img src={comment.profile_pic_url || 'https://via.placeholder.com/40'} alt="avatar" className="comment-avatar-small" />
                    <span className="comment-author-name">{comment.full_name}</span>
                    <span className="comment-timestamp-dot">•</span>
                    <span className="comment-timestamp">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="comment-actions">
                    {(user?.role === 'admin' || user?.role === 'owner') && (
                      <button
                        onClick={() => handleCommentDelete(comment._id)}
                        className="btn-comment-delete"
                        title="Delete Comment"
                      >
                        🗑️
                      </button>
                    )}
                    <button
                      onClick={() => handleCommentLike(comment._id)}
                      className={`btn-comment-like ${isLiked ? 'active' : ''}`}
                    >
                      {isLiked ? '❤️' : '🤍'} {comment.likes?.length || 0}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {comments?.length > 5 && (
          <div className="more-btn-wrap" style={{ margin: '10px 0 30px' }}>
            <button onClick={() => setShowAll(!showAll)} className="btn-show-more">
              {showAll ? 'Show Fewer Comments' : `Show All Comments (${comments.length})`}
            </button>
          </div>
        )}

        {(!comments || comments.length === 0) && (
          <div className="empty-state-refined glass-card">
            <div className="empty-icon">💬</div>
            <p>No comments yet. Share your technical insights!</p>
          </div>
        )}
      </div>

      <div className="comment-box-bottom">
        {user ? (
          <form onSubmit={handleSubmit} className="comment-form-refined glass-card">
            <textarea
              placeholder="Write a technical comment, ask questions, or share tips..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="comment-textarea-refined"
              rows={2}
            />
            <div className="comment-form-footer">
              <span className="technical-note">🔒 Posting as: <b>{user.full_name}</b></span>
              <button type="submit" disabled={loading || !text.trim()} className="btn-post-refined">
                {loading ? 'Posting...' : 'Post  Comment'}
              </button>
            </div>
          </form>
        ) : (
          <div className="login-to-comment glass-card">
            <p>Want to join the discussion? <a href="/login" className="login-accent">Log in</a> or <a href="/register" className="login-accent">Register</a> to post comments and like technical tips.</p>
          </div>
        )}
      </div>
    </div>
  );
}
