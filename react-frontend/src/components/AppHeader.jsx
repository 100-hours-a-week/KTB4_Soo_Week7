import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function AppHeader({ backTo, backLabel = '뒤로 이동', showProfile = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const closeMenu = (event) => {
      if (!menuRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="main-header">
      {backTo && <Link className="back-link" to={backTo} aria-label={backLabel}>‹</Link>}
      <div className="header-title">버그도감</div>
      {showProfile && (
        <nav ref={menuRef} className={`profile-menu${isOpen ? ' is-open' : ''}`} aria-label="회원 메뉴">
          <button
            type="button"
            className="header-profile-button"
            aria-label="회원 메뉴 열기"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((open) => !open)}
          >
            <span className="header-avatar" aria-hidden="true" />
          </button>
          <ul className="profile-dropdown">
            <li><Link to="/users/me" onClick={() => setIsOpen(false)}>회원정보수정</Link></li>
            <li><Link to="/users/me/password" onClick={() => setIsOpen(false)}>비밀번호수정</Link></li>
            <li><button type="button" className="logout-menu-button" onClick={handleLogout}>로그아웃</button></li>
          </ul>
        </nav>
      )}
    </header>
  );
}

export default AppHeader;
