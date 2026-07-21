import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../services/apiClient';

function ProfileEditPage() {
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
    <form className="login-form" onSubmit={handleSubmit}>
      <h1>회원 정보 수정</h1>
      <label>
        이메일
        <input value={email} readOnly disabled />
      </label>
      <label>
        닉네임
        <input
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          maxLength={10}
        />
      </label>
      {errorMessage && <p className="login-error">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '수정 중...' : '수정하기'}
      </button>
      <Link to="/users/me/password" className="form-link">비밀번호 변경</Link>
      <Link to="/posts" className="form-link">게시글 목록으로</Link>
    </form>
  );
}

export default ProfileEditPage;
