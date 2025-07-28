import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { selfRegister } from '@/api';
import { Button } from '@/components/ui/button';
import useForm from '@/hooks/useForm';
import useToastError from '@/hooks/useToastError';
import FormField from '@/components/common/form-field';
import { useState } from 'react';

const RegisterForm = () => {
    const { showError } = useToastError();
    const navigate = useNavigate();
    const [employeeIdPhoto, setEmployeeIdPhoto] = useState(null);
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
        mutationFn: (data) => {
            const formDataWithPhoto = new FormData();
            Object.keys(data).forEach(key => {
                formDataWithPhoto.append(key, data[key]);
            });
            if (employeeIdPhoto) {
                formDataWithPhoto.append('employeeIdPhoto', employeeIdPhoto);
            }
            return selfRegister(formDataWithPhoto);
        },
        onSuccess: () => {
            navigate('/registration-success');
        },
        onError: (error) => showError(error, 'Registration failed'),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!employeeIdPhoto) {
            showError(new Error('Employee ID card photo is required'), 'Registration failed');
            return;
        }
        mutation.mutate(formData);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEmployeeIdPhoto(file);
        }
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
                { value: 'bachelor', label: 'Bachelor's Degree' },
                { value: 'master', label: 'Master's Degree' },
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
                <h2 className="text-2xl font-bold mb-6 text-center">Registration</h2>
                {fields.map((field) => (
                    <div key={field.id}>
                        <FormField
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
                        {field.id === 'email' && (
                            <p className="text-sm text-orange-600 mt-1 mb-3">
                                Make sure to enter a valid email address. You won't receive registration notifications if your email is incorrect.
                            </p>
                        )}
                    </div>
                ))}
                
                <div className="mb-4">
                    <label htmlFor="employeeIdPhoto" className="block text-sm font-medium text-gray-700 mb-1">
                        Employee ID Card Photo *
                    </label>
                    <input
                        type="file"
                        id="employeeIdPhoto"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {employeeIdPhoto && (
                        <p className="text-sm text-green-600 mt-1">
                            Selected: {employeeIdPhoto.name}
                        </p>
                    )}
                </div>

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