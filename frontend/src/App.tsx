import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toast';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CandidatesList } from './pages/CandidatesList';
import { CandidateDetail } from './pages/CandidateDetail';

const queryClient = new QueryClient();

function App() {
  const token = localStorage.getItem('token');

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={token ? <Navigate to="/candidates" /> : <Login />}
          />
          <Route
            path="/register"
            element={token ? <Navigate to="/candidates" /> : <Register />}
          />
          <Route
            path="/candidates"
            element={token ? <CandidatesList /> : <Navigate to="/login" />}
          />
          <Route
            path="/candidates/:id"
            element={token ? <CandidateDetail /> : <Navigate to="/login" />}
          />
          <Route
            path="/"
            element={<Navigate to={token ? "/candidates" : "/login"} />}
          />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
