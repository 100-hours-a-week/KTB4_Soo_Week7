import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../services/apiClient';
import CommentList from './CommentList';
import AppHeader from '../components/AppHeader';
import { usePageStyles } from '../hooks/usePageStyles';
import pageStyles from '../../../pages/post-detail/post-detail.css?inline';

function formatDateTime(value) {
  if (!value) return '-';
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

function countComments(items) {
  return items.reduce((total, comment) => {
    const children = Array.isArray(comment.children) ? comment.children : [];
    const commentId = comment.id ?? comment.commentId;
    const currentCommentCount = commentId == null ? 0 : 1;
    return total + currentCommentCount + countComments(children);
  }, 0);
}

function PostDetailPage() {
  usePageStyles('post-detail', pageStyles);
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadVersion, setReloadVersion] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isUpdatingLike, setIsUpdatingLike] = useState(false);
  const [actionError, setActionError] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    async function loadPost() {
      try {
        const parsedBody = await apiRequest(`/api/v1/posts/${postId}`);

        const detail = parsedBody?.data;
        setPost(detail);
        setComments(detail?.comments ?? []);
        setLikeCount(Number(detail?.likeCount ?? detail?.likes) || 0);
        setIsLiked(Boolean(detail?.liked ?? detail?.isLiked));
      } catch (error) {
        setErrorMessage(error.message || '게시글을 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    }

    if (postId) {
      loadPost();
    }
  }, [postId, reloadVersion]);

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    setActionError('');

    try {
      await apiRequest(`/api/v1/posts/${postId}`, { method: 'DELETE' });
      navigate('/posts', { replace: true });
    } catch (error) {
      setActionError(error.message || '게시글 삭제에 실패했습니다.');
      setIsDeleting(false);
    }
  };

  const handleLike = async () => {
    if (isUpdatingLike) return;

    const previousLiked = isLiked;
    const previousCount = likeCount;
    const nextLiked = !previousLiked;

    setIsUpdatingLike(true);
    setActionError('');
    setIsLiked(nextLiked);
    setLikeCount(Math.max(0, previousCount + (nextLiked ? 1 : -1)));

    try {
      await apiRequest(`/api/v1/posts/${postId}/like`, { method: 'POST' });
    } catch (error) {
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
      setActionError(error.message || '좋아요 처리에 실패했습니다.');
    } finally {
      setIsUpdatingLike(false);
    }
  };

  if (isLoading) {
    return <p className="posts-status">불러오는 중...</p>;
  }

  if (errorMessage) {
    return <p className="posts-error">{errorMessage}</p>;
  }

  if (!post) {
    return <p className="posts-empty">게시글이 없습니다.</p>;
  }

  return (
    <>
      <AppHeader backTo="/posts" backLabel="게시글 목록으로 이동" />
      <main className="post-detail-container">
        <article className="post-detail">
          <header className="post-head">
            <h1>{post.title || '제목 없음'}</h1>
            <div className="post-meta-row">
              <div className="post-author"><span className="author-avatar" aria-hidden="true" /><strong>{post.nickname || post.author || '작성자'}</strong><time>{formatDateTime(post.updatedAt || post.createdAt)}</time></div>
              <div className="post-actions"><button type="button" onClick={() => navigate(`/posts/${postId}/edit`)}>수정</button><button type="button" onClick={() => setIsDeleteModalOpen(true)}>삭제</button></div>
            </div>
          </header>
          {post.image && <img className="post-image react-post-image" src={post.image} alt="게시글 이미지" />}
          <p className="post-content">{post.content || '내용이 없습니다.'}</p>
          <section className="post-stats" aria-label="게시글 통계">
            <button type="button" className={`stat-box${isLiked ? ' is-liked' : ''}`} onClick={handleLike} disabled={isUpdatingLike} aria-pressed={isLiked}><strong>{likeCount}</strong><span>같은 문제</span></button>
            <div className="stat-box"><strong>{Number(post.viewCount ?? post.views) || 0}</strong><span>조회</span></div>
            <div className="stat-box"><strong>{countComments(comments)}</strong><span>댓글</span></div>
          </section>
          {actionError && <p className="error-text">{actionError}</p>}
        </article>
        <CommentList postId={postId} comments={comments} onCommentAdded={() => setReloadVersion((version) => version + 1)} />
      </main>
      <div className={`modal-overlay${isDeleteModalOpen ? ' is-open' : ''}`} aria-hidden={!isDeleteModalOpen} onMouseDown={(event) => { if (event.target === event.currentTarget) setIsDeleteModalOpen(false); }}>
        <div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-post-title">
          <h2 id="delete-post-title">게시글을 삭제하시겠습니까?</h2><p>삭제한 내용은 복구 할 수 없습니다.</p>
          <div className="modal-actions"><button type="button" className="cancel-btn" onClick={() => setIsDeleteModalOpen(false)}>취소</button><button type="button" className="confirm-btn" onClick={handleDelete} disabled={isDeleting}>{isDeleting ? '삭제 중...' : '확인'}</button></div>
        </div>
      </div>
    </>
  );
}

export default PostDetailPage;
