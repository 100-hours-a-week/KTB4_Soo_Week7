import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { login } from '../services/authService';
import AppHeader from './AppHeader';
import { usePageStyles } from '../hooks/usePageStyles';
import pageStyles from '../../../pages/login/login.css?inline';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

function LoginForm() {
  usePageStyles('login', pageStyles);
  const { completeLogin, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    let nextEmailError = '';
    let nextPasswordError = '';

    if (!trimmedEmail) {
      nextEmailError = '* 이메일을 입력해주세요.';
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      nextEmailError = '* 올바른 이메일 주소 형식을 입력해주세요. (예: example@adapterz.kr)';
    }

    if (!password) {
      nextPasswordError = '* 비밀번호를 입력해주세요.';
    } else if (!PASSWORD_PATTERN.test(password)) {
      nextPasswordError = '* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
    }

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);

    if (nextEmailError || nextPasswordError) {
      return;
    }

    setIsSubmitting(true);

    try {
      const tokenPayload = await login({ email: trimmedEmail, password });
      completeLogin(tokenPayload, trimmedEmail);
      window.alert('로그인에 성공했습니다!');
      navigate(location.state?.from?.pathname || '/posts', { replace: true });
    } catch (error) {
      const message = error?.message || '로그인에 실패했습니다.';
      if (error?.code === 'USER_NOT_FOUND') {
        setEmailError(`* ${message}`);
      } else if (error?.code === 'LOGIN_FAILED') {
        setPasswordError(`* ${message}`);
      } else {
        setPasswordError(`* ${message}`);
      }
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
            <input id="email-input" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setEmailError(''); }} placeholder="이메일을 입력하세요" />
            <p className="error-text">{emailError}</p>
          </div>
          <div className="input-group">
            <label htmlFor="password-input">비밀번호</label>
            <input id="password-input" type="password" value={password} onChange={(event) => { setPassword(event.target.value); setPasswordError(''); }} placeholder="비밀번호를 입력하세요" />
            <p className="error-text">{passwordError}</p>
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
