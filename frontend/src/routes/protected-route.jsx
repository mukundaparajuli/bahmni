import { Navigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/auth-context';
import { useContext } from 'react';

const ProtectedRoute = ({ children, roles }) => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/login" />;
    }
    console.log('User roles:', user.roles);
    if (roles && !roles.some((role) => user.roles.includes(role))) {
        return <Navigate to="/unauthorized" />;
    }

    return children;
};

export default ProtectedRoute;