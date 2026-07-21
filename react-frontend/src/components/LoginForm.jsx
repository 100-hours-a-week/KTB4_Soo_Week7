import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { login } from '../services/authService';

function LoginForm() {
  const { completeLogin, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const tokenPayload = await login({ email: email.trim(), password });
      completeLogin(tokenPayload, email.trim());
      navigate(location.state?.from?.pathname || '/posts', { replace: true });
    } catch (error) {
      const message = error?.message || '로그인에 실패했습니다.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoggedIn) {
    return <Navigate to="/posts" replace />;
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h1>로그인</h1>
      <label>
        이메일
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="이메일을 입력하세요"
        />
      </label>
      <label>
        비밀번호
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="비밀번호를 입력하세요"
        />
      </label>
      {errorMessage && <p className="login-error">{errorMessage}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '로그인 중...' : '로그인'}
      </button>
      <p className="form-link">
        계정이 없으신가요?{' '}
        <Link to="/signup">회원가입</Link>
      </p>
    </form>
  );
}

export default LoginForm;
