import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Reply, Heart, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface Comment {
  id: number;
  user: {
    user: {
      username: string;
    };
    profile_image?: string;
  };
  text: string;
  parent?: number;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
  likes_count: number;
  is_liked: boolean;
}

interface CommentsProps {
  contentType: string;
  objectId: number;
}

const Comments: React.FC<CommentsProps> = ({ contentType, objectId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const { state } = useAuth();

  useEffect(() => {
    fetchComments();
  }, [contentType, objectId]);

  const fetchComments = async () => {
    try {
      const response = await apiService.socialAPI.getComments(contentType, objectId);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !state.user) return;

    try {
      await apiService.socialAPI.addComment(contentType, objectId, newComment);
      setNewComment('');
      await fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleReply = async (parentId: number, e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !state.user) return;

    try {
      await apiService.socialAPI.addComment(contentType, objectId, replyText, parentId);
      setReplyText('');
      setReplyingTo(null);
      await fetchComments();
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-12' : ''} bg-gray-800 rounded-lg p-4`}>
      <div className="flex items-start space-x-3">
        <img
          src={comment.user.profile_image || '/default-avatar.png'}
          alt={comment.user.user.username}
          className="w-10 h-10 rounded-full"
        />
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-semibold text-white">{comment.user.user.username}</span>
              <span className="text-gray-400 text-sm ml-2">{formatDate(comment.created_at)}</span>
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-gray-200 mb-3">{comment.text}</p>
          
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 text-gray-400 hover:text-purple-400 transition-colors">
              <Heart className={`w-4 h-4 ${comment.is_liked ? 'fill-current text-purple-500' : ''}`} />
              <span className="text-sm">{comment.likes_count}</span>
            </button>
            
            {!isReply && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center space-x-1 text-gray-400 hover:text-purple-400 transition-colors"
              >
                <Reply className="w-4 h-4" />
                <span className="text-sm">Reply</span>
              </button>
            )}
          </div>
          
          {/* Reply Form */}
          {replyingTo === comment.id && (
            <form onSubmit={(e) => handleReply(comment.id, e)} className="mt-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
          
          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-3">
              {comment.replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Comments ({comments.length})
        </h3>
      </div>

      {/* Add Comment Form */}
      {state.user ? (
        <form onSubmit={handleAddComment} className="bg-gray-800 rounded-lg p-4">
          <div className="flex space-x-3">
            <img
              src={state.profile?.avatar || state.profile?.profile_image || '/default-avatar.png'}
              alt={state.user.username}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center">
                    <Send className="w-4 h-4 mr-2" />
                    Post Comment
                  </div>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-gray-400">
            <a href="/login" className="text-purple-400 hover:text-purple-300">Log in</a> to leave a comment
          </p>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-500" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => renderComment(comment))}
        </div>
      )}
    </div>
  );
};

export default Comments;
