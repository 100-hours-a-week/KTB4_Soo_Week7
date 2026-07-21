import { useState } from 'react';
import { apiRequest } from '../services/apiClient';

function CommentList({ postId, comments, onCommentAdded }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    const trimmed = content.trim();
    if (!trimmed) {
      setErrorMessage('댓글 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest(`/api/v1/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: trimmed }),
      });

      setContent('');
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      setErrorMessage(error.message || '댓글 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="comment-section">
      <h2>댓글</h2>
      <form className="comment-form" onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={4}
          placeholder="댓글을 입력하세요"
        />
        {errorMessage && <p className="login-error">{errorMessage}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '등록 중...' : '댓글 작성'}
        </button>
      </form>

      <ul className="comment-list">
        {comments?.map((comment) => (
          <li key={comment.id ?? comment.commentId} className="comment-item">
            <strong>{comment.nickname || '사용자'}</strong>
            <p>{comment.content || '내용이 없습니다.'}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default CommentList;
