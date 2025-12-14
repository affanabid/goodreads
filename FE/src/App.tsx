// client/src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import type { JSX } from 'react';
import Navbar from './pages/Navbar'; // <-- NEW IMPORT
import BookListPage from './pages/BookListPage';
import BookDetailPage from './pages/BookDetailPage';
import Dashboard from './pages/Dashboard';
// import UserRecommendationCard from './components/UserRecommendationCard';
// import BookRecommendationCard from './components/BookRecommendationCard';
// Placeholder pages (will be created later)
// const Placeholder = ({ name }: { name: string }) => <h1>{name} Page</h1>;

// A wrapper component to protect routes
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  // Redirect to login if not authenticated
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <> {/* Use a Fragment to wrap Navbar and Routes */}
      <Navbar />
      <div style={{ padding: '20px' }}> {/* Add padding for content */}
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage isSignup={true} />} />

          {/* Main Public/Auth Home */}
          <Route path="/" element={<BookListPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/books/:bookId" element={<ProtectedRoute><BookDetailPage /></ProtectedRoute>} />
          {/* <Route path="/users/:userId" element={<ProtectedRoute><UserRecommendationCard /></ProtectedRoute>} /> */}

          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </div>
    </>
  );
}

export default App;