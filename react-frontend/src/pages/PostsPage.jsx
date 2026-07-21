import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiRequest } from '../services/apiClient';

function PostsPage() {
  const { logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadPosts() {
      try {
        const parsedBody = await apiRequest('/api/v1/posts');

        const items = Array.isArray(parsedBody?.data)
          ? parsedBody.data
          : parsedBody?.data?.posts ?? [];

        setPosts(items);
      } catch (error) {
        setErrorMessage(error.message || '게시글 목록을 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    }

    loadPosts();
  }, []);

  return (
    <main className="posts-page">
      <header className="posts-header">
        <div className="posts-header-top">
          <div>
            <h1>버그 게시판</h1>
            <p>등록된 게시글을 확인해보세요.</p>
          </div>
          <Link to="/posts/new" className="create-post-button">
            글쓰기
          </Link>
          <Link to="/users/me" className="secondary-button">회원 정보</Link>
          <button type="button" className="text-button" onClick={logout}>로그아웃</button>
        </div>
      </header>

      {isLoading && <p className="posts-status">불러오는 중...</p>}
      {errorMessage && <p className="posts-error">{errorMessage}</p>}

      {!isLoading && !errorMessage && posts.length === 0 && (
        <p className="posts-empty">아직 등록된 게시글이 없습니다.</p>
      )}

      <section className="posts-list">
        {posts.map((post) => {
          const postId = post.id ?? post.postId;
          return (
            <article key={postId} className="post-card">
              <Link to={`/posts/${postId}`} className="post-link">
                <h2>{post.title || '제목 없음'}</h2>
                <p>{post.content || '내용이 없습니다.'}</p>
              </Link>
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default PostsPage;
