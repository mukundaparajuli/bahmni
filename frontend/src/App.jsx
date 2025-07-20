import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import PasswordResetRequest from '@/pages/PasswordResetRequest';
import PasswordReset from '@/pages/PasswordReset';
import { Toaster } from 'sonner';
import Navbar from './components/common/Navbar';
import Dashboard from '@/pages/Dashboard';
import AdminDashboardPage from './pages/AdminDashboard';
import Profile from './pages/Profile';

const App = () => (
  <Router>
    <Navbar />
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/reset-password" element={<PasswordResetRequest />} />
      <Route path="/reset-password/:token" element={<PasswordReset />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
    <Toaster />
  </Router>
);

export default App;