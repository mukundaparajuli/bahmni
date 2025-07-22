import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { selfRegister } from '@/api';
import { Button } from '@/components/ui/button';
import useForm from '@/hooks/useForm';
import useToastError from '@/hooks/useToastError';
import FormField from '@/components/common/form-field';

const RegisterForm = () => {
    const { showError, showSuccess } = useToastError();
    const { formData, handleChange } = useForm({
        employeeId: '',
        fullName: '',
        department: '',
        email: '',
        education: '',
        profession: '',
        password: '',
    });

    const mutation = useMutation({
        mutationFn: selfRegister,
        onSuccess: () => showSuccess('Registration submitted, pending approval'),
        onError: (error) => showError(error, 'Registration failed'),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="w-full max-w-md p-6 bg-white rounded shadow">
                <h2 className="text-2xl font-bold mb-6">Register</h2>
                {['employeeId', 'fullName', 'department', 'email', 'education', 'profession', 'password'].map((field) => (
                    <FormField
                        key={field}
                        label={field.charAt(0).toUpperCase() + field.slice(1)}
                        id={field}
                        type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                        required
                    />
                ))}
                <Button type="submit" disabled={mutation.isLoading} className="w-full">
                    {mutation.isLoading ? 'Submitting...' : 'Submit'}
                </Button>
                <div className="mt-4 text-center">
                    <Link to="/login" className="text-blue-600">Already registered? Login</Link>
                </div>
            </form>
        </div>
    );
};

export default RegisterForm;