import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import RegistrationSuccess from '@/pages/RegistrationSuccess';
import PasswordResetRequest from '@/pages/PasswordResetRequest';
import PasswordReset from '@/pages/PasswordReset';
import Navbar from './components/common/Navbar';
import Dashboard from '@/pages/Dashboard';
import AdminDashboardPage from './pages/AdminPage';
import Profile from './pages/Profile';
import ScannerPage from './pages/ScannerPage';
import Unauthorized from './pages/Unauthorized';
import DocumentScanner from './components/Scanner';
import DisplayScannedDocs from './components/DisplayScannedDocs';
import ApproverPage from './pages/ApproverPage';
import ReviewSection from './components/ReviewSection';
import RejectedSection from './components/RejectedSection';
import ApprovedSection from './components/ApprovedSection';
import Rescan from './components/Rescan';
import Footer from './components/common/Footer';
import ManageDepartments from './pages/ManageDepartments';
import ManageEducation from './pages/ManageEducation';
import ManageProfessions from './pages/ManageProfessions';
import UsersSection from './components/admin/UsersSection';
import Welcome from './components/Welcome';
import RejectedDocs from './components/scanner/RejectedDocs';
import ScannersInfo from './components/admin/ScannersInfo';
import ApproversInfo from './components/admin/ApproversInfo';
import UploadersInfo from './components/admin/UploadersInfo';
import DocumentsList from './components/admin/Documents';
import DocsToUpload from './components/uploader/DocsToUpload';
import UploaderDashboard from './components/uploader/UploaderDashboard';
import ScannerInfo from './components/admin/ScannerInfo';
import ApproverInfo from './components/admin/ApproverInfo';
import UploaderInfo from './components/admin/UploaderInfo';
import { Overview } from './components/admin/Overview';
import AdminRescanner from './components/admin/AdminRescanner';
import PerformanceSummary from './components/admin/PerformanceSummary';

const App = () => (
  <>

    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/register" element={<Register />} />
          <Route path="/registration-success" element={<RegistrationSuccess />} />
          <Route path="/reset-password" element={<PasswordResetRequest />} />
          <Route path="/reset-password/:token" element={<PasswordReset />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/unauthorized" element={<Unauthorized />} />


          <Route path="/admin" element={<AdminDashboardPage />}>
            <Route index element={<Overview />} />
            <Route path="users" element={<UsersSection />} />
            <Route path="departments" element={<ManageDepartments />} />
            <Route path="education" element={<ManageEducation />} />
            <Route path="professions" element={<ManageProfessions />} />

            {/* Lists */}
            <Route path="scanners" element={<ScannersInfo />} />
            <Route path="approvers" element={<ApproversInfo />} />
            <Route path="uploaders" element={<UploadersInfo />} />

            {/* Details */}
            <Route path="scanner/:id" element={<ScannerInfo />} />
            <Route path="approver/:id" element={<ApproverInfo />} />
            <Route path="uploader/:id" element={<UploaderInfo />} />

            <Route path="documents" element={<DocumentsList />} />
            <Route path="performance" element={<PerformanceSummary />} />

            {/* rescan uploaded docs */}
            <Route path="rescan" element={<AdminRescanner />} />
          </Route>


          <Route path="/scanner" element={<ScannerPage />} >
            <Route index element={<DocumentScanner />} />
            <Route path="scan" element={<DocumentScanner />} />
            <Route path="docs" element={<DisplayScannedDocs />} />
            <Route path="rejected" element={<RejectedDocs />} />
          </Route>

          <Route path="/rescan" element={<Rescan />} />
          <Route path="/approver" element={<ApproverPage />}      >
            <Route index element={<ReviewSection />} />
            <Route path="review" element={<ReviewSection />} />
            <Route path="approved" element={<ApprovedSection />} />
            <Route path="rejected" element={<RejectedSection />} />
          </Route>

          <Route path="/uploader" element={<UploaderDashboard />} >
            <Route index element={<DocsToUpload />} />
            <Route path="upload" element={<DocsToUpload />} />
          </Route>

          <Route path="/test" element={<AdminRescanner />} />

        </Routes>
      </main>
    </div>
    <Footer />
  </>
);

export default App;