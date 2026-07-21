import { useEffect, useState } from 'react';

function PostDetailPage({ postId }) {
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadPost() {
      try {
        const response = await fetch(`http://${window.location.hostname}:8080/api/v1/posts/${postId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
          },
        });

        const text = await response.text();
        const parsedBody = text ? JSON.parse(text) : null;

        if (!response.ok) {
          throw new Error(parsedBody?.message || '게시글을 불러오지 못했습니다.');
        }

        setPost(parsedBody?.data);
      } catch (error) {
        setErrorMessage(error.message || '게시글을 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    }

    if (postId) {
      loadPost();
    }
  }, [postId]);

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
      <article className="post-card">
        <h1>{post.title || '제목 없음'}</h1>
        <p>{post.content || '내용이 없습니다.'}</p>
        <p className="post-meta">작성자: {post.author || '미등록'}</p>
      </article>
    </main>
  );
}

export default PostDetailPage;
