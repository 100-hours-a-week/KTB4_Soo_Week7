import { Navigate, Route, Routes } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import ProtectedRoute from './components/ProtectedRoute';
import PostsPage from './pages/PostsPage';
import PostDetailPage from './pages/PostDetailPage';
import PostCreatePage from './pages/PostCreatePage';
import PostEditPage from './pages/PostEditPage';
import SignupPage from './pages/SignupPage';
import './App.css';

function App() {
  return (
    <main className="app-shell">
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<Navigate to="/posts" replace />} />
        <Route path="/posts" element={<ProtectedRoute><PostsPage /></ProtectedRoute>} />
        <Route path="/posts/new" element={<ProtectedRoute><PostCreatePage /></ProtectedRoute>} />
        <Route path="/posts/:postId" element={<ProtectedRoute><PostDetailPage /></ProtectedRoute>} />
        <Route path="/posts/:postId/edit" element={<ProtectedRoute><PostEditPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/posts" replace />} />
      </Routes>
    </main>
  );
}

export default App;
