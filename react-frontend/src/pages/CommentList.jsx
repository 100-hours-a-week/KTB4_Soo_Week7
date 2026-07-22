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
  if (Number.isNaN(date.getTime())) return value;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function CommentItem({ comment, isReply, onEdit, onDelete, onReply }) {
  const commentId = getCommentId(comment);
  const isDeleted = commentId == null;

  return (
    <article className={`comment-item${isReply ? ' is-reply' : ''}`}>
      <span className="author-avatar" aria-hidden="true" />
      <div className="comment-body">
        <div className="comment-meta">
          <strong>{isDeleted ? '알 수 없는 사용자' : getCommentAuthor(comment)}</strong>
          <time>{getCommentDate(comment)}</time>
        </div>
        <p className="comment-content">{isDeleted ? '삭제된 댓글입니다.' : getCommentContent(comment)}</p>
      </div>

      {!isDeleted && (
        <div className="comment-actions">
          {!isReply && (
            <button type="button" className="reply-toggle-btn" onClick={() => onReply(comment)}>
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
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const visibleComments = (comments ?? []).filter((comment) => {
    const children = Array.isArray(comment.children) ? comment.children : [];
    return getCommentId(comment) != null || children.length > 0;
  });

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

  const handleDelete = async () => {
    if (!pendingDeleteId || isDeletingComment) return;
    setIsDeletingComment(true);
    setErrorMessage('');

    try {
      await apiRequest(`/api/v1/posts/${postId}/comments/${pendingDeleteId}`, {
        method: 'DELETE',
      });
      if (editingCommentId === pendingDeleteId) resetEditor();
      setPendingDeleteId(null);
      refreshComments();
    } catch (error) {
      setErrorMessage(error.message || '댓글 삭제에 실패했습니다.');
    } finally {
      setIsDeletingComment(false);
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
    <>
    <section className="comment-panel">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={4}
          maxLength={500}
          placeholder="해결 방법이나 의견을 댓글로 남겨주세요."
        />
        <p className="character-count">{content.length} / 500</p>
        {errorMessage && <p className="error-text comment-form-error">{errorMessage}</p>}
        <div className="comment-form-footer react-comment-actions">
          {editingCommentId && (
            <button type="button" className="cancel-btn" onClick={resetEditor}>
              수정 취소
            </button>
          )}
          <button type="submit" id="comment-submit-btn" disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? '저장 중...' : editingCommentId ? '댓글 수정' : '댓글 작성'}
          </button>
        </div>
      </form>

    </section>

      {visibleComments.length > 0 && (
      <section className="comments-list" aria-label="댓글 목록">
        {visibleComments.map((comment, index) => {
          const commentId = getCommentId(comment);
          const children = Array.isArray(comment.children) ? comment.children : [];

          return (
            <div className="comment-thread" key={commentId ?? `deleted-${index}`}>
              <CommentItem
                comment={comment}
                isReply={false}
                onEdit={startEdit}
                onDelete={setPendingDeleteId}
                onReply={startReply}
              />

              {replyTarget !== null && replyTarget.id === commentId && (
                <form className="reply-composer" onSubmit={handleReplySubmit}>
                  <label className="reply-composer-label" htmlFor={`reply-${commentId}`}>
                    ↳ {replyTarget.author}님에게 답글
                  </label>
                  <textarea
                    id={`reply-${commentId}`}
                    value={replyContent}
                    onChange={(event) => setReplyContent(event.target.value)}
                    className="reply-input" rows={3}
                    maxLength={500}
                    autoFocus
                  />
                  <p className="reply-character-count">{replyContent.length} / 500</p>
                  <div className="reply-composer-footer">
                    <button type="button" className="reply-cancel-btn" onClick={() => setReplyTarget(null)}>
                      취소
                    </button>
                    <button type="submit" className="reply-submit-btn" disabled={isSubmitting || !replyContent.trim()}>
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
                      onDelete={setPendingDeleteId}
                      onReply={startReply}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>
      )}
      {pendingDeleteId && (
      <div className="modal-overlay is-open" aria-hidden="false" onMouseDown={(event) => { if (event.target === event.currentTarget) setPendingDeleteId(null); }}>
        <div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-comment-title">
          <h2 id="delete-comment-title">댓글을 삭제하시겠습니까?</h2><p>삭제한 내용은 복구 할 수 없습니다.</p>
          <div className="modal-actions"><button type="button" className="cancel-btn" onClick={() => setPendingDeleteId(null)}>취소</button><button type="button" className="confirm-btn" onClick={handleDelete} disabled={isDeletingComment}>{isDeletingComment ? '삭제 중...' : '확인'}</button></div>
        </div>
      </div>
      )}
    </>
  );
}

export default CommentList;
