import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import PasswordResetRequest from '@/pages/PasswordResetRequest';
import PasswordReset from '@/pages/PasswordReset';
import { Toaster } from 'sonner';
import Navbar from './components/common/Navbar';

const App = () => (
  <Router>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<PasswordResetRequest />} />
      <Route path="/reset-password/:token" element={<PasswordReset />} />
    </Routes>
    <Toaster />
  </Router>
);

export default App;