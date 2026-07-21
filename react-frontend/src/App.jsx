import { useMemo } from 'react';
import LoginForm from './components/LoginForm';
import PostsPage from './pages/PostsPage';
import PostDetailPage from './pages/PostDetailPage';
import PostCreatePage from './pages/PostCreatePage';
import SignupPage from './pages/SignupPage';
import './App.css';

function App() {
  const isLoggedIn = Boolean(localStorage.getItem('accessToken'));
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const postId = searchParams.get('postId');
  const view = searchParams.get('view');

  const handlePostCreated = (createdPostId) => {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('postId', createdPostId);
    nextUrl.searchParams.delete('view');
    window.history.pushState({}, '', nextUrl.toString());
    window.location.reload();
  };

  return (
    <main className="app-shell">
      {!isLoggedIn ? (
        view === 'signup' ? <SignupPage /> : <LoginForm />
      ) : postId ? (
        <PostDetailPage postId={postId} />
      ) : view === 'create' ? (
        <PostCreatePage onCreated={handlePostCreated} />
      ) : (
        <PostsPage />
      )}
    </main>
  );
}

export default App;
