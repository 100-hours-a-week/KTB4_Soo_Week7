import { useMemo } from 'react';
import LoginForm from './components/LoginForm';
import PostsPage from './pages/PostsPage';
import PostDetailPage from './pages/PostDetailPage';
import SignupPage from './pages/SignupPage';
import './App.css';

function App() {
  const isLoggedIn = Boolean(localStorage.getItem('accessToken'));
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const postId = searchParams.get('postId');
  const view = searchParams.get('view');

  return (
    <main className="app-shell">
      {!isLoggedIn ? (
        view === 'signup' ? <SignupPage /> : <LoginForm />
      ) : postId ? (
        <PostDetailPage postId={postId} />
      ) : (
        <PostsPage />
      )}
    </main>
  );
}

export default App;
