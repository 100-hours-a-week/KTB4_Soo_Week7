import { useEffect, useState } from 'react';
import { apiRequest } from '../services/apiClient';
import AppHeader from '../components/AppHeader';
import { usePageStyles } from '../hooks/usePageStyles';
import pageStyles from '../../../pages/profile-edit/profile-edit.css?inline';

function ProfileEditPage() {
  usePageStyles('profile-edit', pageStyles);
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const body = await apiRequest('/api/v1/users/me');
        const user = body?.data ?? body;
        setEmail(user?.email || localStorage.getItem('loginUserEmail') || '');
        setNickname(user?.nickname || '');
      } catch (error) {
        setErrorMessage(error.message || '회원 정보를 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const newNickname = nickname.trim();
    if (!newNickname) {
      setErrorMessage('닉네임을 입력해주세요.');
      return;
    }
    if (newNickname.includes(' ')) {
      setErrorMessage('닉네임에서 띄어쓰기를 없애주세요.');
      return;
    }
    if (newNickname.length > 10) {
      setErrorMessage('닉네임은 최대 10자까지 작성 가능합니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest('/api/v1/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ newNickname }),
      });
      localStorage.setItem('loginUserNickname', newNickname);
      setNickname(newNickname);
      setSuccessMessage('회원 정보가 수정되었습니다.');
    } catch (error) {
      setErrorMessage(error.message || '회원 정보 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p className="posts-status">불러오는 중...</p>;

  return (
    <>
      <AppHeader />
      <main className="edit-profile-container">
        <h2>디버거 프로필</h2>
        <section className="profile-image-section">
          <div className="profile-image-label">프로필 사진*</div>
          <button type="button" className="profile-image-button" aria-label="프로필 사진 변경"><span className="profile-placeholder" /><span className="profile-change-text">변경</span></button>
        </section>
        <form id="profile-edit-form" onSubmit={handleSubmit}>
          <div className="form-panel">
            <div className="field-group"><div className="field-label">이메일</div><p className="email-text">{email}</p></div>
            <div className="field-group"><label htmlFor="nickname-input">닉네임</label><input id="nickname-input" value={nickname} onChange={(event) => setNickname(event.target.value)} maxLength={10} /><p className="error-text">{errorMessage}</p></div>
          </div>
          <button type="submit" id="edit-submit-btn" disabled={isSubmitting}>{isSubmitting ? '수정 중...' : '수정하기'}</button>
        </form>
        {successMessage && <div className="toast-message is-visible">수정완료</div>}
      </main>
    </>
  );
}

export default ProfileEditPage;
