import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/auth-context';
import useForm from '@/hooks/useForm';
import useToastError from '@/hooks/useToastError';
import FormField from '@/components/common/form-field';

const LoginForm = () => {
    const { login, isLoading } = useContext(AuthContext);
    const { showError } = useToastError();
    const navigate = useNavigate();
    const { formData, handleChange } = useForm({ email: '', password: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        login(formData, {
            onSuccess: () => navigate('/'),
            onError: (error) => showError(error, 'Login failed'),
        });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="w-full max-w-md p-6 bg-white rounded shadow">
                <h2 className="text-2xl font-bold mb-6">Login</h2>
                <FormField
                    label="Email"
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <FormField
                    label="Password"
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? 'Logging in...' : 'Login'}
                </Button>
                <div className="mt-4 text-center">
                    <Link to="/reset-password" className="text-blue-600">Forgot Password?</Link>
                </div>
                <div className="mt-2 text-center">
                    <Link to="/register" className="text-blue-600">Register</Link>
                </div>
            </form>
        </div>
    );
};

export default LoginForm;