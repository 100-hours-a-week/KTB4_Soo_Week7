import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../services/apiClient';
import AppHeader from '../components/AppHeader';
import { usePageStyles } from '../hooks/usePageStyles';
import pageStyles from '../../../pages/post-edit/post-edit.css?inline';

function PostEditPage() {
  usePageStyles('post-edit', pageStyles);
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
    <>
      <AppHeader backTo={`/posts/${postId}`} backLabel="게시글 상세로 이동" />
      <main className="post-edit-container">
        <h2>기록 수정</h2>
        <form id="post-edit-form" onSubmit={handleSubmit}>
          <div className="form-group title-group">
            <label htmlFor="title-input">제목*</label>
            <input id="title-input" name="title" value={form.title} onChange={handleChange} maxLength={26} placeholder="제목을 입력해주세요. (최대 26글자)" />
          </div>
          <div className="form-group content-group">
            <label htmlFor="content-input">내용*</label>
            <textarea id="content-input" name="content" value={form.content} onChange={handleChange} placeholder="내용을 입력해주세요." />
            <p className="error-text">{errorMessage}</p>
          </div>
          <div className="image-group"><label htmlFor="image-input">에러 화면</label><div className="file-row"><input type="file" id="image-input" accept="image/*" /><span className="current-image-name">기존 파일 명</span></div></div>
          <button type="submit" id="post-submit-btn" disabled={isSubmitting}>{isSubmitting ? '수정 중...' : '기록 수정하기'}</button>
        </form>
      </main>
    </>
  );
}

export default PostEditPage;
