import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthContext } from '@/contexts/auth-context';
import { useContext } from 'react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="bg-gray-800 text-white p-4 sticky top-0">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-xl font-bold">Bahmni</Link>
                <div>
                    {user ? (
                        <>
                            <span className="mr-4">Welcome, {user.fullName}</span>
                            {user.roles.includes('Admin') && (
                                <Link to="/admin" className="mr-4">Admin Dashboard</Link>
                            )}
                            <Button onClick={logout} variant="outline" className="text-black cursor-pointer">Logout</Button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="mr-4">Login</Link>
                            <Link to="/register">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;