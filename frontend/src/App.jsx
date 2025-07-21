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
import ScannerPage from './pages/ScannerPage';
import Unauthorized from './pages/Unauthorized';
import ScannerDashboard from './components/ScannerDashboard';
import DocumentScanner from './components/Scanner';
import DisplayScannedDocs from './components/DisplayScannedDocs';
import ApproverPage from './pages/ApproverPage';
import ReviewSection from './components/ReviewSection';
import RejectedSection from './components/RejectedSection';
import ApprovedSection from './components/ApprovedSection';

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
      <Route path="/unauthorized" element={<Unauthorized />} />


      <Route path="/scanner" element={<ScannerPage />} >
        <Route index element={<DocumentScanner />} />
        <Route path="scan" element={<DocumentScanner />} />
        <Route path="docs" element={<DisplayScannedDocs />} />
      </Route>


      <Route path="/approver" element={<ApproverPage />}      >
        <Route index element={<ReviewSection />} />
        <Route path="review" element={<ReviewSection />} />
        <Route path="approved" element={<ApprovedSection />} />
        <Route path="rejected" element={<RejectedSection />} />
      </Route>


    </Routes>
    <Toaster />
  </Router>
);

export default App;