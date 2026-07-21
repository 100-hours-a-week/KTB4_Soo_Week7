import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/apiClient';

function SignupPage() {
  const navigate = useNavigate();
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
      await apiRequest('/api/v1/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email,
          nickname: form.nickname,
          password: form.password,
        }),
        auth: false,
      });

      navigate('/login', { replace: true, state: { signupComplete: true } });
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
        <p className="form-link">
          이미 계정이 있나요? <Link to="/login">로그인</Link>
        </p>
      </form>
    </main>
  );
}

export default SignupPage;
