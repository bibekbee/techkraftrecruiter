import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toast';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CandidatesList } from './pages/CandidatesList';
import { CandidateDetail } from './pages/CandidateDetail';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/candidates" /> : <>{children}</>;
};

const RootRoute = () => {
  const token = localStorage.getItem('token');
  return <Navigate to={token ? "/candidates" : "/login"} />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={<PublicRoute><Login /></PublicRoute>}
          />
          <Route
            path="/register"
            element={<PublicRoute><Register /></PublicRoute>}
          />
          <Route
            path="/candidates"
            element={<ProtectedRoute><CandidatesList /></ProtectedRoute>}
          />
          <Route
            path="/candidates/:id"
            element={<ProtectedRoute><CandidateDetail /></ProtectedRoute>}
          />
          <Route
            path="/"
            element={<RootRoute />}
          />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
