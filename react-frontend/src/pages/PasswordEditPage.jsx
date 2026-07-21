import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../services/apiClient';

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

function PasswordEditPage() {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!PASSWORD_PATTERN.test(password)) {
      setErrorMessage('비밀번호는 8~20자이며 대문자, 소문자, 숫자, 특수문자를 각각 포함해야 합니다.');
      return;
    }
    if (password !== passwordConfirm) {
      setErrorMessage('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest('/api/v1/users/me/password', {
        method: 'PATCH',
        body: JSON.stringify({ newPassword: password }),
      });
      setPassword('');
      setPasswordConfirm('');
      setSuccessMessage('비밀번호가 수정되었습니다.');
    } catch (error) {
      setErrorMessage(error.message || '비밀번호 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h1>비밀번호 변경</h1>
      <label>
        새 비밀번호
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
        />
      </label>
      <label>
        새 비밀번호 확인
        <input
          type="password"
          value={passwordConfirm}
          onChange={(event) => setPasswordConfirm(event.target.value)}
          autoComplete="new-password"
        />
      </label>
      {errorMessage && <p className="login-error">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '수정 중...' : '수정하기'}
      </button>
      <Link to="/users/me" className="form-link">회원 정보로 돌아가기</Link>
    </form>
  );
}

export default PasswordEditPage;
