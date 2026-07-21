import { useMemo } from 'react';
import LoginForm from './components/LoginForm';
import PostsPage from './pages/PostsPage';
import PostDetailPage from './pages/PostDetailPage';
import './App.css';

function App() {
  const isLoggedIn = Boolean(localStorage.getItem('accessToken'));
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const postId = searchParams.get('postId');

  return (
    <main className="app-shell">
      {!isLoggedIn ? (
        <LoginForm />
      ) : postId ? (
        <PostDetailPage postId={postId} />
      ) : (
        <PostsPage />
      )}
    </main>
  );
}

export default App;
