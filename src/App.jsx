import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import FormOperator from './FormOperator.jsx';
import DashboardMTC from './DashboardMTC.jsx';
import Login from './Login.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* Route Publik untuk Operator */}
        <Route path="/" element={<FormOperator />} />
        
        {/* Route Login untuk Admin/Manager MTC */}
        <Route path="/login" element={<Login />} />
        
        {/* Route Terproteksi untuk Dashboard MTC */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardMTC />
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback ke home jika URL tidak ditemukan */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;