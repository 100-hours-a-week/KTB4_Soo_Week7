import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../services/apiClient';
import CommentList from './CommentList';

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('ko-KR');
}

function countComments(items) {
  return items.reduce((total, comment) => {
    const children = Array.isArray(comment.children) ? comment.children : [];
    return total + 1 + countComments(children);
  }, 0);
}

function PostDetailPage() {
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
    const shouldDelete = window.confirm('게시글을 삭제하시겠습니까?');
    if (!shouldDelete || isDeleting) return;

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
    <main className="posts-page">
      <Link to="/posts" className="form-link">← 목록으로</Link>
      <article className="post-card">
        <h1>{post.title || '제목 없음'}</h1>
        <div className="post-detail-meta">
          <span>작성자 {post.nickname || post.author || '미등록'}</span>
          <time>{formatDateTime(post.updatedAt || post.createdAt)}</time>
        </div>
        {post.image && (
          <img className="post-image" src={post.image} alt="게시글 첨부 이미지" />
        )}
        <p>{post.content || '내용이 없습니다.'}</p>
        <div className="post-stats">
          <button
            type="button"
            className={`like-button${isLiked ? ' is-liked' : ''}`}
            onClick={handleLike}
            disabled={isUpdatingLike}
            aria-pressed={isLiked}
          >
            ♥ 같은 문제 {likeCount}
          </button>
          <span>댓글 {countComments(comments)}</span>
          <span>조회 {Number(post.viewCount ?? post.views) || 0}</span>
        </div>
        {actionError && <p className="login-error">{actionError}</p>}
        <div className="post-actions">
          <Link to={`/posts/${postId}/edit`} className="secondary-button">수정</Link>
          <button
            type="button"
            className="danger-button"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </article>

      <CommentList
        postId={postId}
        comments={comments}
        onCommentAdded={() => setReloadVersion((version) => version + 1)}
      />
    </main>
  );
}

export default PostDetailPage;
