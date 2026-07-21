import { useState } from 'react';

function SignupPage() {
  const [form, setForm] = useState({
    email: '',
    nickname: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!form.email || !form.nickname || !form.password) {
      setMessage('모든 항목을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          nickname: form.nickname,
          password: form.password,
        }),
      });

      const text = await response.text();
      const parsedBody = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(parsedBody?.message || '회원가입에 실패했습니다.');
      }

      setMessage('회원가입에 성공했습니다.');
    } catch (error) {
      setMessage(error.message || '회원가입에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app-shell">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>회원가입</h1>

        <label>
          이메일
          <input name="email" type="email" value={form.email} onChange={handleChange} />
        </label>

        <label>
          닉네임
          <input name="nickname" value={form.nickname} onChange={handleChange} />
        </label>

        <label>
          비밀번호
          <input name="password" type="password" value={form.password} onChange={handleChange} />
        </label>

        {message && <p className="login-error">{message}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '처리 중...' : '회원가입'}
        </button>
      </form>
    </main>
  );
}

export default SignupPage;
