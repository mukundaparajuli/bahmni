import { AuthContext } from '@/contexts/auth-context';
import useForm from '@/hooks/useForm';
import FormField from '@/components/common/form-field';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';


const LoginForm = () => {
    const { login, isLoading } = useContext(AuthContext);
    const { formData, handleChange } = useForm({ email: '', password: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        login(formData);
    };

    return (
        <div >
            <form onSubmit={handleSubmit} >
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