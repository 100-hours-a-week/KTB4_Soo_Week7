import LoginForm from './components/LoginForm';
import PostsPage from './pages/PostsPage';
import './App.css';

function App() {
  const isLoggedIn = Boolean(localStorage.getItem('accessToken'));

  return (
    <main className="app-shell">
      {isLoggedIn ? <PostsPage /> : <LoginForm />}
    </main>
  );
}

export default App;
