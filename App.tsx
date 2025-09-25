import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Elections from './pages/Elections';
import Vote from './pages/Vote';
import Results from './pages/Results';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminElections from './pages/admin/AdminElections';
import './App.css';

// Home component to redirect based on user role
const Home: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  } else {
    return <Navigate to="/elections" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Home route - redirects based on user role */}
            <Route path="/" element={<Home />} />
            
            {/* Voter routes */}
            <Route 
              path="/elections" 
              element={
                <ProtectedRoute>
                  <Elections />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/elections/:id/vote" 
              element={
                <ProtectedRoute>
                  <Vote />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/elections/:id/results" 
              element={
                <ProtectedRoute>
                  <Results />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/elections" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminElections />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
