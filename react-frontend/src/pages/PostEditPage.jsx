import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../services/apiClient';

function PostEditPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadPost() {
      try {
        const body = await apiRequest(`/api/v1/posts/${postId}`);
        const post = body?.data;

        if (!post) {
          throw new Error('게시글 상세 데이터가 응답에 없습니다.');
        }

        setForm({
          title: post.title || '',
          content: post.content || '',
        });
      } catch (error) {
        setErrorMessage(error.message || '게시글을 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    }

    loadPost();
  }, [postId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    const title = form.title.trim();
    const content = form.content.trim();

    if (!title || !content) {
      setErrorMessage('제목과 내용을 모두 입력해주세요.');
      return;
    }

    if (title.length > 26) {
      setErrorMessage('제목은 최대 26자까지 작성 가능합니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      const body = await apiRequest(`/api/v1/posts/${postId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title, content }),
      });
      const updatedPostId = body?.data ?? postId;
      navigate(`/posts/${updatedPostId}`, { replace: true });
    } catch (error) {
      setErrorMessage(error.message || '게시글 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <p className="posts-status">불러오는 중...</p>;
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h1>게시글 수정</h1>

      <label>
        제목
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          maxLength={26}
        />
      </label>

      <label>
        내용
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          rows={8}
        />
      </label>

      {errorMessage && <p className="login-error">{errorMessage}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '수정 중...' : '수정 완료'}
      </button>
      <Link to={`/posts/${postId}`} className="form-link">취소</Link>
    </form>
  );
}

export default PostEditPage;
