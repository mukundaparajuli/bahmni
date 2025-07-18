import AdminDashboard from '@/components/admin/AdminDashboard';
import ProtectedRoute from '@/routes/protected-route';

const AdminDashboardPage = () => (
    <ProtectedRoute roles={['Admin']}>
        <AdminDashboard />
    </ProtectedRoute>
);

export default AdminDashboardPage;