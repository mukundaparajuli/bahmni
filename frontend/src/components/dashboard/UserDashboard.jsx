import { useContext } from 'react';
import { AuthContext } from '@/contexts/auth-context';
import DashboardCard from '@/components/common/DashboardCard';
import { ROLES } from '@/utils/constants';
import { Badge } from '../ui/badge';

const UserDashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">
                Welcome, {user?.fullName || 'User'}!
            </h2>
            <p className="text-gray-600 mb-6 flex gap-2 justify-start items-center">
                Your roles:
                <div className='flex gap-1'>{user.roles.length > 0 ? (
                    user.roles.map((role) => (
                        <Badge key={role} variant="secondary" className="text-xs">
                            {role}
                        </Badge>
                    ))
                ) : (
                    <span className="text-sm text-gray-500">No roles assigned</span>
                )}</div>
            </p>
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {user?.roles.includes(ROLES.ADMIN) && (
                    <DashboardCard
                        title="Admin Dashboard"
                        description="Manage users, approve registrations, and assign roles."
                        link="/admin"
                    />
                )}
                {user?.roles.includes(ROLES.SCANNER_CLERK) && (
                    <DashboardCard
                        title="Scan Documents"
                        description="Scan or upload documents for processing."
                        onClick={() => alert('Document scanning coming soon!')}
                        link="/scanner"
                    />
                )}
                {user?.roles.includes(ROLES.APPROVER) && (
                    <DashboardCard
                        title="Review Documents"
                        description="Review and approve/reject scanned documents."
                        onClick={() => alert('Document review coming soon!')}
                        link="/approver"
                    />
                )}
                {user?.roles.includes(ROLES.UPLOADER) && (
                    <DashboardCard
                        title="Upload to Bahmni"
                        description="Upload approved documents to Bahmni EMR."
                        onClick={() => alert('Bahmni upload coming soon!')}
                        link="/uploader"
                    />
                )}
            </div>
        </div>
    );
};

export default UserDashboard;