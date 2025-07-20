import { Link, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { resetPassword } from '@/api';
import { Button } from '@/components/ui/button';
import useForm from '@/hooks/useForm';
import useToastError from '@/hooks/useToastError';
import FormField from '@/components/common/form-field';

const PasswordResetForm = () => {
    const { token } = useParams();
    const { showError, showSuccess } = useToastError();
    const { formData, handleChange } = useForm({ newPassword: '' });

    const mutation = useMutation({
        mutationFn: (data) => resetPassword(token, data),
        onSuccess: () => {
            showSuccess('Password reset successful');
            window.location.href = '/login';
        },
        onError: (error) => showError(error, 'Reset failed'),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="w-full max-w-md p-6 bg-white rounded shadow">
                <h2 className="text-2xl font-bold mb-6">Reset Password</h2>
                <FormField
                    label="New Password"
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                />
                <Button type="submit" disabled={mutation.isLoading} className="w-full">
                    {mutation.isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
                <div className="mt-4 text-center">
                    <Link to="/login" className="text-blue-600">Back to Login</Link>
                </div>
            </form>
        </div>
    );
};

export default PasswordResetForm;