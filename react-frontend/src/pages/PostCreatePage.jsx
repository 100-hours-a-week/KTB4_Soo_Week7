import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/apiClient';
import AppHeader from '../components/AppHeader';
import { usePageStyles } from '../hooks/usePageStyles';
import pageStyles from '../../../pages/post-create/post-create.css?inline';

function PostCreatePage() {
  usePageStyles('post-create', pageStyles);
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      const parsedBody = await apiRequest('/api/v1/posts', {
        method: 'POST',
        body: JSON.stringify({ title, content }),
      });

      const createdPostId = parsedBody?.data;
      if (createdPostId) {
        navigate(`/posts/${createdPostId}`, { replace: true });
      } else {
        navigate('/posts', { replace: true });
      }
    } catch (error) {
      setErrorMessage(error.message || '게시글 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AppHeader backTo="/posts" backLabel="게시글 목록으로 이동" />
      <main className="post-create-container">
        <h2>버그 등록</h2>
        <form id="post-create-form" onSubmit={handleSubmit}>
          <div className="form-group title-group">
            <label htmlFor="title-input">제목*</label>
            <input id="title-input" name="title" value={form.title} onChange={handleChange} maxLength={26} placeholder="발견한 버그를 한 문장으로 적어주세요. (최대 26자)" />
          </div>
          <div className="form-group content-group">
            <label htmlFor="content-input">내용*</label>
            <textarea id="content-input" name="content" value={form.content} onChange={handleChange} placeholder="어디서 발견했고, 어떤 현상이 발생했나요?" />
            <p className="error-text">{errorMessage}</p>
          </div>
          <div className="image-group">
            <label htmlFor="image-input">에러 화면</label>
            <div className="file-row"><input type="file" id="image-input" accept="image/*" /></div>
          </div>
          <button type="submit" id="post-submit-btn" disabled={isSubmitting}>{isSubmitting ? '등록 중...' : '도감에 등록'}</button>
        </form>
      </main>
    </>
  );
}

export default PostCreatePage;
