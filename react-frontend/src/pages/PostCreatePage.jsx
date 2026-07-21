import { useState } from 'react';

function PostCreatePage({ onCreated }) {
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
      const response = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
        },
        body: JSON.stringify({ title, content }),
      });

      const text = await response.text();
      const parsedBody = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(parsedBody?.message || '게시글 작성에 실패했습니다.');
      }

      const createdPostId = parsedBody?.data;
      if (createdPostId) {
        if (onCreated) {
          onCreated(createdPostId);
        }
      } else {
        window.alert('게시글이 작성되었습니다.');
        window.location.href = '/';
      }
    } catch (error) {
      setErrorMessage(error.message || '게시글 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app-shell">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>새 게시글 작성</h1>

        <label>
          제목
          <input name="title" value={form.title} onChange={handleChange} maxLength={26} />
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
          {isSubmitting ? '작성 중...' : '게시글 작성'}
        </button>
      </form>
    </main>
  );
}

export default PostCreatePage;
