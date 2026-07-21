import { useState } from 'react';
import { apiRequest } from '../services/apiClient';

function getCommentId(comment) {
  return comment.id ?? comment.commentId;
}

function getCommentContent(comment) {
  return comment.content ?? comment.commentContent ?? '';
}

function getCommentAuthor(comment) {
  return comment.nickname ?? comment.author ?? comment.writer ?? '사용자';
}

function getCommentDate(comment) {
  const value = comment.updatedAt || comment.createdAt || comment.updatedDate || comment.createdDate;
  if (!value) return '';

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('ko-KR');
}

function CommentItem({ comment, isReply, onEdit, onDelete, onReply }) {
  const commentId = getCommentId(comment);
  const isDeleted = commentId == null;

  return (
    <article className={`comment-item${isReply ? ' is-reply' : ''}`}>
      <div className="comment-body">
        <div className="comment-meta">
          <strong>{isDeleted ? '알 수 없는 사용자' : getCommentAuthor(comment)}</strong>
          <time>{getCommentDate(comment)}</time>
        </div>
        <p>{isDeleted ? '삭제된 댓글입니다.' : getCommentContent(comment)}</p>
      </div>

      {!isDeleted && (
        <div className="comment-actions">
          {!isReply && (
            <button type="button" onClick={() => onReply(comment)}>
              답글
            </button>
          )}
          <button type="button" onClick={() => onEdit(comment)}>수정</button>
          <button type="button" onClick={() => onDelete(commentId)}>삭제</button>
        </div>
      )}
    </article>
  );
}

function CommentList({ postId, comments, onCommentAdded }) {
  const [content, setContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const refreshComments = () => {
    if (onCommentAdded) onCommentAdded();
  };

  const resetEditor = () => {
    setContent('');
    setEditingCommentId(null);
  };

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
      const path = editingCommentId
        ? `/api/v1/posts/${postId}/comments/${editingCommentId}`
        : `/api/v1/posts/${postId}/comments`;

      await apiRequest(path, {
        method: editingCommentId ? 'PATCH' : 'POST',
        body: JSON.stringify({ content: trimmed }),
      });

      resetEditor();
      refreshComments();
    } catch (error) {
      setErrorMessage(error.message || '댓글 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (comment) => {
    setEditingCommentId(getCommentId(comment));
    setContent(getCommentContent(comment));
    setReplyTarget(null);
    setReplyContent('');
    setErrorMessage('');
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?') || deletingCommentId) return;

    setDeletingCommentId(commentId);
    setErrorMessage('');

    try {
      await apiRequest(`/api/v1/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (editingCommentId === commentId) resetEditor();
      refreshComments();
    } catch (error) {
      setErrorMessage(error.message || '댓글 삭제에 실패했습니다.');
    } finally {
      setDeletingCommentId(null);
    }
  };

  const startReply = (comment) => {
    const nextId = getCommentId(comment);
    setReplyTarget((current) => current?.id === nextId
      ? null
      : { id: nextId, author: getCommentAuthor(comment) });
    setReplyContent('');
    setErrorMessage('');
  };

  const handleReplySubmit = async (event) => {
    event.preventDefault();
    const trimmed = replyContent.trim();
    if (!trimmed || !replyTarget) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await apiRequest(`/api/v1/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ parentId: replyTarget.id, content: trimmed }),
      });
      setReplyTarget(null);
      setReplyContent('');
      refreshComments();
    } catch (error) {
      setErrorMessage(error.message || '답글 작성에 실패했습니다.');
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
          maxLength={500}
          placeholder="댓글을 입력하세요"
        />
        <p className="character-count">{content.length} / 500</p>
        {errorMessage && <p className="login-error">{errorMessage}</p>}
        <div className="comment-form-actions">
          {editingCommentId && (
            <button type="button" className="secondary-button" onClick={resetEditor}>
              수정 취소
            </button>
          )}
          <button type="submit" disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? '저장 중...' : editingCommentId ? '댓글 수정' : '댓글 작성'}
          </button>
        </div>
      </form>

      <div className="comment-list">
        {comments?.map((comment, index) => {
          const commentId = getCommentId(comment);
          const children = Array.isArray(comment.children) ? comment.children : [];

          return (
            <div className="comment-thread" key={commentId ?? `deleted-${index}`}>
              <CommentItem
                comment={comment}
                isReply={false}
                onEdit={startEdit}
                onDelete={handleDelete}
                onReply={startReply}
              />

              {replyTarget?.id === commentId && (
                <form className="reply-composer" onSubmit={handleReplySubmit}>
                  <label htmlFor={`reply-${commentId}`}>
                    ↳ {replyTarget.author}님에게 답글
                  </label>
                  <textarea
                    id={`reply-${commentId}`}
                    value={replyContent}
                    onChange={(event) => setReplyContent(event.target.value)}
                    rows={3}
                    maxLength={500}
                    autoFocus
                  />
                  <p className="character-count">{replyContent.length} / 500</p>
                  <div className="comment-form-actions">
                    <button type="button" className="secondary-button" onClick={() => setReplyTarget(null)}>
                      취소
                    </button>
                    <button type="submit" disabled={isSubmitting || !replyContent.trim()}>
                      {isSubmitting ? '등록 중...' : '답글 등록'}
                    </button>
                  </div>
                </form>
              )}

              {children.length > 0 && (
                <div className="reply-list">
                  {children.map((child, childIndex) => (
                    <CommentItem
                      key={getCommentId(child) ?? `deleted-reply-${childIndex}`}
                      comment={child}
                      isReply
                      onEdit={startEdit}
                      onDelete={handleDelete}
                      onReply={startReply}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default CommentList;
