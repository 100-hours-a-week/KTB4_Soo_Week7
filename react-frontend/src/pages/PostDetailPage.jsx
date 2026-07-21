import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiRequest } from '../services/apiClient';
import CommentList from './CommentList';

function PostDetailPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadVersion, setReloadVersion] = useState(0);

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
        <p className="post-meta">작성자: {post.author || '미등록'}</p>
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
