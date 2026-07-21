import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../services/apiClient';
import CommentList from './CommentList';

function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadVersion, setReloadVersion] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadPost() {
      try {
        const parsedBody = await apiRequest(`/api/v1/posts/${postId}`);

        const detail = parsedBody?.data;
        setPost(detail);
        setComments(detail?.comments ?? []);
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
    setErrorMessage('');

    try {
      await apiRequest(`/api/v1/posts/${postId}`, { method: 'DELETE' });
      navigate('/posts', { replace: true });
    } catch (error) {
      setErrorMessage(error.message || '게시글 삭제에 실패했습니다.');
      setIsDeleting(false);
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
        <p>{post.content || '내용이 없습니다.'}</p>
        <p className="post-meta">
          작성자: {post.nickname || post.author || '미등록'}
        </p>
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
