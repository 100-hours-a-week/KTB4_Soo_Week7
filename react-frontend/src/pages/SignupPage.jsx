import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/apiClient';
import { login } from '../services/authService';
import AppHeader from '../components/AppHeader';
import { useAuth } from '../hooks/useAuth';
import { usePageStyles } from '../hooks/usePageStyles';
import pageStyles from '../../../pages/signup/signup.css?inline';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

function SignupPage() {
  usePageStyles('signup', pageStyles);
  const navigate = useNavigate();
  const { completeLogin } = useAuth();
  const profileInputRef = useRef(null);
  const [form, setForm] = useState({
    email: '',
    nickname: '',
    password: '',
    passwordConfirm: '',
  });
  const [profilePreview, setProfilePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!EMAIL_PATTERN.test(form.email.trim())) {
      setMessage('올바른 이메일 주소 형식을 입력해주세요.');
      return;
    }
    if (!PASSWORD_PATTERN.test(form.password)) {
      setMessage('비밀번호는 8~20자이며 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.');
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setMessage('비밀번호가 다릅니다.');
      return;
    }
    if (!form.nickname.trim() || form.nickname.includes(' ') || form.nickname.length > 10) {
      setMessage('닉네임은 공백 없이 최대 10자로 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    let signupCompleted = false;

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
      signupCompleted = true;

      localStorage.setItem('loginUserEmail', form.email.trim());
      localStorage.setItem('loginUserNickname', form.nickname.trim());
      const tokenPayload = await login({
        email: form.email.trim(),
        password: form.password,
      });
      completeLogin(tokenPayload, form.email.trim());
      window.alert('회원가입에 성공했습니다!');
      navigate('/posts', { replace: true });
    } catch (error) {
      if (signupCompleted) {
        window.alert('회원가입은 완료됐지만 자동 로그인에 실패했습니다. 로그인해주세요.');
        navigate('/login', { replace: true });
        return;
      }
      setMessage(error.message || '회원가입에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AppHeader backTo="/login" backLabel="로그인 페이지로 이동" showProfile={false} />
      <main className="signup-container">
        <h2>디버거 등록</h2>
        <section className="profile-section">
          <div className="profile-label">프로필 사진</div>
          <p className="error-text" />
          <button type="button" className="profile-upload-button" aria-label="프로필 사진 추가" onClick={() => profileInputRef.current?.click()}>
            {profilePreview ? <img src={profilePreview} alt="선택한 프로필" /> : <span aria-hidden="true">+</span>}
          </button>
          <input ref={profileInputRef} id="profile-input" type="file" accept="image/*" onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) setProfilePreview(URL.createObjectURL(file));
          }} />
        </section>
        <form id="signup-form" onSubmit={handleSubmit}>
          {[
            ['email', '이메일*', 'email', '이메일을 입력하세요'],
            ['password', '비밀번호*', 'password', '비밀번호를 입력하세요'],
            ['passwordConfirm', '비밀번호 확인*', 'password', '비밀번호를 한번 더 입력하세요'],
            ['nickname', '닉네임*', 'text', '닉네임을 입력하세요'],
          ].map(([name, label, type, placeholder]) => (
            <div className="input-group" key={name}>
              <label htmlFor={`${name}-input`}>{label}</label>
              <input id={`${name}-input`} name={name} type={type} value={form[name]} onChange={handleChange} placeholder={placeholder} />
              <p className="error-text">{name === 'nickname' ? message : ''}</p>
            </div>
          ))}
          <button type="submit" id="signup-submit-btn" disabled={isSubmitting}>{isSubmitting ? '등록 중...' : '디버거 등록 완료'}</button>
        </form>
        <Link className="login-link" to="/login">이미 등록된 디버거인가요?</Link>
      </main>
    </>
  );
}

export default SignupPage;
