import { AuthContext } from '@/contexts/auth-context';
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import UserDashboard from '@/components/dashboard/UserDashboard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <UserDashboard />;
};

export default Dashboard;