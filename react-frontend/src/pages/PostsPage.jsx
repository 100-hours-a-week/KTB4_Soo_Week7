import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../services/apiClient';
import AppHeader from '../components/AppHeader';
import { usePageStyles } from '../hooks/usePageStyles';
import pageStyles from '../../../pages/posts/posts.css?inline';

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

function PostsPage() {
  usePageStyles('posts', pageStyles);
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
    <>
      <AppHeader />
      <main className="posts-container">
        <section className="posts-hero">
          <div className="posts-hero-text">
            <p className="posts-welcome">BUG SIGHTINGS ARCHIVE</p>
            <p className="posts-desc">개발 중 마주친 버그를<br />수집하고 공유합니다.</p>
          </div>
          <Link to="/posts/new" className="create-post-btn">+ 버그 등록</Link>
        </section>

      {isLoading && <p className="posts-status">불러오는 중...</p>}
      {errorMessage && <p className="posts-error">{errorMessage}</p>}

      {!isLoading && !errorMessage && posts.length === 0 && (
        <article className="posts-empty">아직 등록된 버그가 없습니다.</article>
      )}

      <section className="posts-list">
        {posts.map((post) => {
          const postId = post.id ?? post.postId;
          return (
            <article key={postId} className="post-card">
              <Link to={`/posts/${postId}`} className="post-link">
                <div className="post-card-content">
                  <h2 className="post-card-title">{post.title || '제목 없음'}</h2>
                  <div className="post-card-meta-row">
                    <div className="post-card-stats">
                      <span>같은 문제 {Number(post.likeCount ?? post.likes) || 0}</span>
                      <span>댓글 {Number(post.commentCount ?? post.comments) || 0}</span>
                      <span>조회 {Number(post.viewCount ?? post.views) || 0}</span>
                    </div>
                    <time className="post-card-date">{formatDateTime(post.updatedAt || post.createdAt || post.updatedDate || post.createdDate || post.updated_at || post.created_at)}</time>
                  </div>
                  <div className="post-card-footer">
                    <div className="author-info"><span className="author-avatar" aria-hidden="true" /><span className="author-name">{post.author || post.writer || post.nickname || '미등록 작성자'}</span></div>
                  </div>
                </div>
              </Link>
            </article>
          );
        })}
      </section>
      </main>
    </>
  );
}

export default PostsPage;
