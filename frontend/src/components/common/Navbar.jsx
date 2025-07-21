import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthContext } from '@/contexts/auth-context';
import { useContext, useState } from 'react';
import { Menu, X, LogOut, User, Home, Shield } from 'lucide-react';
import { ROLES } from '@/utils/constants';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getStaticUrl } from '@/utils/get-static-url';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout(null, {
            onSuccess: () => navigate('/login'),
        });
        setIsMobileMenuOpen(false);
    };


    return (
        <nav className="bg-gray-800 text-white p-4 sticky top-0 z-50 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-xl font-bold flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Bahmni
                </Link>
                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" className="text-white flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={getStaticUrl(user.photo)} alt={user.fullName} />
                                            <AvatarFallback className="bg-gray-600 text-white">
                                                {user.fullName?.charAt(0).toUpperCase() || '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        {user.fullName}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-72 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={getStaticUrl(user.photo)} alt={user.fullName} />
                                            <AvatarFallback className="bg-gray-600 text-white">
                                                {user.fullName?.charAt(0).toUpperCase() || '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{user.fullName}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {user.roles.map((role) => (
                                            <Badge key={role} variant="secondary" className="text-xs">
                                                {role}
                                            </Badge>
                                        ))}
                                        {user.roles.length === 0 && (
                                            <span className="text-xs text-gray-500">No roles assigned</span>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Link
                                            to="/profile"
                                            className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
                                        >
                                            Edit Profile
                                        </Link>
                                        {user.roles.includes(ROLES.ADMIN) && (
                                            <Link
                                                to="/admin"
                                                className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
                                            >
                                                Admin Dashboard
                                            </Link>
                                        )}
                                        <Button
                                            variant="ghost"
                                            className="w-full text-left text-sm text-gray-700 bg-gray-100 hover:text-red-600 hover:bg-gray-200"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Logout
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm hover:text-gray-300 transition-colors">
                                Login
                            </Link>
                            <Link to="/register" className="text-sm hover:text-gray-300 transition-colors">
                                Register
                            </Link>
                        </>
                    )}
                </div>
                <Button
                    variant="ghost"
                    className="md:hidden text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>
            {isMobileMenuOpen && (
                <div className="md:hidden bg-gray-800 p-4 flex flex-col gap-3 transition-transform duration-300">
                    {user ? (
                        <>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={getStaticUrl(user.photo)} alt={user.fullName} />
                                    <AvatarFallback className="bg-gray-600 text-white">
                                        {user.fullName?.charAt(0).toUpperCase() || '?'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-semibold">{user.fullName}</p>
                                    <p className="text-xs text-gray-300">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {user.roles.map((role) => (
                                    <Badge key={role} variant="secondary" className="text-xs bg-gray-700 text-white">
                                        {role}
                                    </Badge>
                                ))}
                                {user.roles.length === 0 && (
                                    <span className="text-xs text-gray-300">No roles assigned</span>
                                )}
                            </div>
                            <Link
                                to="/profile"
                                className="flex items-center gap-2 text-sm hover:text-gray-300 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <User className="h-4 w-4" />
                                Profile
                            </Link>
                            {user.roles.includes(ROLES.ADMIN) && (
                                <Link
                                    to="/admin"
                                    className="flex items-center gap-2 text-sm hover:text-gray-300 transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Shield className="h-4 w-4" />
                                    Admin Dashboard
                                </Link>
                            )}
                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                className="text-white border-white hover:bg-gray-700 hover:text-white w-full"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="text-sm hover:text-gray-300 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="text-sm hover:text-gray-300 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;