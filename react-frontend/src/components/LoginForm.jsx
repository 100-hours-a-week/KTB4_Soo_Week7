import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { login } from '../services/authService';
import AppHeader from './AppHeader';
import { usePageStyles } from '../hooks/usePageStyles';
import pageStyles from '../../../pages/login/login.css?inline';

function LoginForm() {
  usePageStyles('login', pageStyles);
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
      window.alert('로그인에 성공했습니다!');
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
    <>
      <AppHeader showProfile={false} />
      <main className="login-container">
        <h2>디버거 로그인</h2>
        <form id="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email-input">이메일</label>
            <input id="email-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="이메일을 입력하세요" />
            <p className="error-text">{errorMessage}</p>
          </div>
          <div className="input-group">
            <label htmlFor="password-input">비밀번호</label>
            <input id="password-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="비밀번호를 입력하세요" />
            <p className="error-text" />
          </div>
          <button type="submit" id="login-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? '도감 여는 중...' : '도감 열기'}
          </button>
        </form>
        <div className="signup-link-wrap"><Link to="/signup">새 디버거 등록</Link></div>
      </main>
    </>
  );
}

export default LoginForm;
