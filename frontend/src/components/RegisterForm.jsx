import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { selfRegister } from '@/api';
import { Button } from '@/components/ui/button';
import useForm from '@/hooks/useForm';
import useToastError from '@/hooks/useToastError';
import FormField from '@/components/common/form-field';
import { useState } from 'react';
import { useOptions } from '@/hooks/useOptions';
import { useNavigate } from 'react-router-dom';


const RegisterForm = () => {
    const { showError, showSuccess } = useToastError();
    const { options, loading: optionsLoading } = useOptions();
    const navigate = useNavigate();
    const { formData, handleChange } = useForm({
        employeeId: '',
        fullName: '',
        departmentId: '',
        email: '',
        educationId: '',
        professionId: '',
        password: '',
        employeeIdPhoto: null, // Added for image
    });

    const [previewImage, setPreviewImage] = useState(null);

    const mutation = useMutation({
        mutationFn: selfRegister,
        onSuccess: () => {
            showSuccess('Registration submitted, pending approval');
            navigate('/welcome');
        },
        onError: (error) => {
            if (error?.response?.data?.message) {
                showError(error.response.data.message);
            } else {
                showError(error, 'Registration failed');
            }
        },
    });;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showError('File size should not exceed 5MB');
                return;
            }
            if (!['image/jpeg', 'image/png'].includes(file.type)) {
                showError('Only JPEG and PNG images are allowed');
                return;
            }
            handleChange({ target: { name: 'employeeIdPhoto', value: file } });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            formDataToSend.append(key, value);
        });
        mutation.mutate(formDataToSend);
    };

    const requiredFieldIds = new Set([
        'employeeIdPhoto',
        'employeeId',
        'fullName',
        'departmentId',
        'email',
        'educationId',
        'password',
    ]);

    const fields = [
        {
            id: 'employeeIdPhoto',
            label: 'Employee Image',
            type: 'file',
            accept: 'image/jpeg,image/png',
            onChange: handleImageChange,
        },
        { id: 'employeeId', label: 'Employee ID', type: 'text', placeholder: 'Enter your employee ID' },
        { id: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Enter your full name' },
        {
            id: 'departmentId',
            label: 'Department',
            type: 'select',
            placeholder: optionsLoading ? 'Loading departments...' : 'Select your department',
            options: options.departments,
            disabled: optionsLoading,
        },
        { id: 'email', label: 'Email', type: 'email', placeholder: 'Enter your email' },
        {
            id: 'educationId',
            label: 'Education',
            type: 'select',
            placeholder: optionsLoading ? 'Loading education options...' : 'Select your education level',
            options: options.educations,
            disabled: optionsLoading,
        },
        {
            id: 'professionId',
            label: 'Profession',
            type: 'select',
            placeholder: optionsLoading ? 'Loading professions...' : 'Select your profession',
            options: options.professions,
            disabled: optionsLoading,
        },
        { id: 'password', label: 'Password', type: 'password', placeholder: 'Enter your password' },
    ];

    return (
        <form onSubmit={handleSubmit}>
            <p className="text-sm text-gray-500 mb-4">* denotes required fields</p>
            {fields.map((field) => {
                const isRequired = requiredFieldIds.has(field.id);
                const label = isRequired ? `${field.label} *` : field.label;

                return (
                    <div key={field.id} className="mb-4">
                        <FormField
                            label={label}
                            id={field.id}
                            type={field.type}
                            name={field.id}
                            value={field.type === 'file' ? undefined : formData[field.id]}
                            onChange={field.type === 'file' ? field.onChange : handleChange}
                            required={isRequired}
                            placeholder={field.placeholder}
                            options={field.options}
                            accept={field.accept}
                            disabled={field.disabled}
                        />
                        {field.id === 'employeeIdPhoto' && previewImage && (
                            <div className="mt-2">
                                <img
                                    src={previewImage}
                                    alt="Employee preview"
                                    className="w-32 h-32 object-cover rounded"
                                />
                            </div>
                        )}
                    </div>
                );
            })}
            <Button type="submit" disabled={mutation.isLoading} className="w-full">
                {mutation.isLoading ? 'Submitting...' : 'Submit'}
            </Button>
            <div className="mt-4 text-center">
                <Link to="/login" className="text-blue-600">Already registered? Login</Link>
            </div>
        </form>
    );
};

export default RegisterForm;
