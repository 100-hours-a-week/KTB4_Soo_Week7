import { useEffect, useState } from 'react';

function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadPosts() {
      try {
        const response = await fetch('/api/v1/posts', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
          },
        });

        const text = await response.text();
        const parsedBody = text ? JSON.parse(text) : null;

        if (!response.ok) {
          throw new Error(parsedBody?.message || '게시글 목록을 불러오지 못했습니다.');
        }

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
          <a href="/?view=create" className="create-post-button">
            글쓰기
          </a>
        </div>
      </header>

      {isLoading && <p className="posts-status">불러오는 중...</p>}
      {errorMessage && <p className="posts-error">{errorMessage}</p>}

      {!isLoading && !errorMessage && posts.length === 0 && (
        <p className="posts-empty">아직 등록된 게시글이 없습니다.</p>
      )}

      <section className="posts-list">
        {posts.map((post) => (
          <article key={post.id ?? post.postId} className="post-card">
            <h2>{post.title || '제목 없음'}</h2>
            <p>{post.content || '내용이 없습니다.'}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default PostsPage;
