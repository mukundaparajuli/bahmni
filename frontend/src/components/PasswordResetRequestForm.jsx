import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { requestPasswordReset } from '@/api';
import { Button } from '@/components/ui/button';
import useForm from '@/hooks/useForm';
import useToastError from '@/hooks/useToastError';
import FormField from '@/components/common/form-field';

const PasswordResetRequestForm = () => {
    const { showError, showSuccess } = useToastError();
    const { formData, handleChange } = useForm({ email: '' });

    const mutation = useMutation({
        mutationFn: requestPasswordReset,
        onSuccess: () => showSuccess('Password reset link sent to email'),
        onError: (error) => showError(error, 'Request failed'),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="w-full max-w-md p-6 bg-white rounded shadow">
                <h2 className="text-2xl font-bold mb-6">Request Password Reset</h2>
                <FormField
                    label="Email"
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <Button type="submit" disabled={mutation.isLoading} className="w-full">
                    {mutation.isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
                <div className="mt-4 text-center">
                    <Link to="/login" className="text-blue-600">Back to Login</Link>
                </div>
            </form>
        </div>
    );
};

export default PasswordResetRequestForm;