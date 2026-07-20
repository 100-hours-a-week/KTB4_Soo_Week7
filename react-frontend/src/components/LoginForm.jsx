import { useState } from 'react';
import { login } from '../services/authService';

function LoginForm() {
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
      await login({ email: email.trim(), password });
      window.alert('로그인에 성공했습니다!');
      window.location.href = '/posts';
    } catch (error) {
      const message = error?.message || '로그인에 실패했습니다.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
    </form>
  );
}

export default LoginForm;
