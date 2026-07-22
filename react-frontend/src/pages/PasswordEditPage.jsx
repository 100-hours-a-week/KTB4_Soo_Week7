import { useState } from 'react';
import { apiRequest } from '../services/apiClient';
import AppHeader from '../components/AppHeader';
import { usePageStyles } from '../hooks/usePageStyles';
import pageStyles from '../../../pages/password-edit/password-edit.css?inline';

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

function PasswordEditPage() {
  usePageStyles('password-edit', pageStyles);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentPassword) {
      setErrorMessage('현재 비밀번호를 입력해주세요.');
      return;
    }
    if (!PASSWORD_PATTERN.test(newPassword)) {
      setErrorMessage('비밀번호는 8~20자이며 대문자, 소문자, 숫자, 특수문자를 각각 포함해야 합니다.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setErrorMessage('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest('/api/v1/users/me/password', {
        method: 'PATCH',
        body: JSON.stringify({
          currentPassword,
          newPassword,
          newPasswordConfirm,
        }),
      });
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
      setSuccessMessage('비밀번호가 수정되었습니다.');
    } catch (error) {
      setErrorMessage(error.message || '비밀번호 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AppHeader />
      <main className="password-edit-container">
        <h2>접근 코드 변경</h2>
        <form id="password-edit-form" onSubmit={handleSubmit}>
          <div className="password-form-panel">
            <div className="input-group"><label htmlFor="current-password-input">현재 비밀번호</label><input id="current-password-input" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="현재 비밀번호를 입력하세요" autoComplete="current-password" /><p className="error-text" /></div>
            <div className="input-group"><label htmlFor="password-input">새 비밀번호</label><input id="password-input" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="새 비밀번호를 입력하세요" autoComplete="new-password" /><p className="error-text">{errorMessage}</p></div>
            <div className="input-group"><label htmlFor="password-confirm-input">새 비밀번호 확인</label><input id="password-confirm-input" type="password" value={newPasswordConfirm} onChange={(event) => setNewPasswordConfirm(event.target.value)} placeholder="새 비밀번호를 한번 더 입력하세요" autoComplete="new-password" /><p className="error-text" /></div>
          </div>
          <button type="submit" id="password-edit-submit-btn" disabled={isSubmitting}>{isSubmitting ? '수정 중...' : '수정하기'}</button>
        </form>
        {successMessage && <div className="complete-message is-visible">수정완료</div>}
      </main>
    </>
  );
}

export default PasswordEditPage;
