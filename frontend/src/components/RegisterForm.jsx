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

    const fields = [
        { id: 'employeeId', label: 'Employee ID', type: 'text', placeholder: 'Enter your employee ID' },
        { id: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Enter your full name' },
        {
            id: 'department',
            label: 'Department',
            type: 'select',
            placeholder: 'Select your department',
            options: [
                { value: 'engineering', label: 'Engineering' },
                { value: 'hr', label: 'Human Resources' },
                { value: 'marketing', label: 'Marketing' },
                { value: 'finance', label: 'Finance' },
                { value: 'it', label: 'Information Technology' },
            ],
        },
        { id: 'email', label: 'Email', type: 'email', placeholder: 'Enter your email' },
        {
            id: 'education',
            label: 'Education',
            type: 'select',
            placeholder: 'Select your education level',
            options: [
                { value: 'highschool', label: 'High School' },
                { value: 'bachelor', label: 'Bachelor’s Degree' },
                { value: 'master', label: 'Master’s Degree' },
                { value: 'phd', label: 'PhD' },
            ],
        },
        {
            id: 'profession',
            label: 'Profession',
            type: 'select',
            placeholder: 'Select your profession',
            options: [
                { value: 'doctor', label: 'Doctor' },
                { value: 'physician', label: 'Physician' },
                { value: 'nurse', label: 'Nurse' },
                { value: 'Pharmacist', label: 'Pharmacist' },
                { value: 'Researcher', label: 'Researcher' },
                { value: 'Teacher', label: 'Teacher/Lecturer' },
                { value: 'ITspecialist', label: 'ITspecialist' },
                { value: 'others', label: 'Others' }
            ],
        },
        { id: 'password', label: 'Password', type: 'password', placeholder: 'Enter your password' },
    ];

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="w-full max-w-md p-6 bg-white rounded shadow">
                <h2 className="text-2xl font-bold mb-6">Register</h2>
                {fields.map((field) => (
                    <FormField
                        key={field.id}
                        label={field.label}
                        id={field.id}
                        type={field.type}
                        name={field.id}
                        value={formData[field.id]}
                        onChange={handleChange}
                        required
                        placeholder={field.placeholder}
                        options={field.options}
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