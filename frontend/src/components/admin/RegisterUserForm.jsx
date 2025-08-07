import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { registerUser, selfRegister } from '@/api';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import useForm from '@/hooks/useForm';
import useToastError from '@/hooks/useToastError';
import FormField from '@/components/common/form-field';
import { useState, useEffect } from 'react';
import { useOptions } from '@/hooks/useOptions';
import { ROLES } from '@/utils/constants';

const RegisterUserForm = ({ onClose }) => {
    const { showError, showSuccess } = useToastError();
    const { options, loading: optionsLoading } = useOptions();
    const { formData, handleChange } = useForm({
        employeeId: '',
        fullName: '',
        departmentId: '',
        email: '',
        educationId: '',
        professionId: '',
        password: '',
        employeeIdPhoto: null,
    });
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);

    const mutation = useMutation({
        mutationFn: () => {
            if (selectedRoles.length === 0) {
                throw new Error('At least one role is required');
            }
            const formDataToSend = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                formDataToSend.append(key, value);
            });
            formDataToSend.append('roles', JSON.stringify(selectedRoles));
            return registerUser(formDataToSend);
        },
        onSuccess: () => {
            showSuccess('Registration submitted');
            onClose();
        },
        onError: (error) => showError(error, 'User registration could not be completed. Please check the information and try again.'),
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showError('The file size exceeds the maximum allowed limit of 5MB. Please select a smaller file.');
                return;
            }
            if (!['image/jpeg', 'image/png'].includes(file.type)) {
                showError('Only JPEG and PNG image formats are supported. Please select a different file.');
                return;
            }
            handleChange({ target: { name: 'employeeIdPhoto', value: file } });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleRoleChange = (role, checked) => {
        setSelectedRoles((prev) =>
            checked ? [...prev, role] : prev.filter((r) => r !== role)
        );
    };

    const isFormValid = () => {
        return (
            formData.employeeId &&
            formData.fullName &&
            formData.departmentId &&
            formData.email &&
            formData.educationId &&
            formData.professionId &&
            formData.password &&
            formData.employeeIdPhoto &&
            selectedRoles.length > 0
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate();
    };

    useEffect(() => {
        return () => {
            if (previewImage) URL.revokeObjectURL(previewImage);
        };
    }, [previewImage]);

    const fields = [
        {
            id: 'employeeIdPhoto',
            label: 'Employee Image',
            type: 'file',
            accept: 'image/jpeg,image/png',
            name: 'employeeIdPhoto',
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
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="w-full max-w-md p-6 ">
            <h2 className="text-2xl font-bold mb-6">Register</h2>

            {fields.map((field) => (
                <div key={field.id} className="mb-4">
                    <FormField
                        label={field.label}
                        id={field.id}
                        type={field.type}
                        name={field.id}
                        value={field.type === 'file' ? undefined : formData[field.id]}
                        onChange={field.type === 'file' ? field.onChange : handleChange}
                        required
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
            ))}

            <div className="mb-4">
                <Label>Roles</Label>
                <div className="grid gap-2 m-2">
                    {Object.values(ROLES).map((role) => (
                        <div key={role} className="flex items-center gap-2">
                            <Checkbox
                                id={`role-${role}`}
                                checked={selectedRoles.includes(role)}
                                onCheckedChange={(checked) => handleRoleChange(role, checked)}
                            />
                            <Label htmlFor={`role-${role}`}>{role}</Label>
                        </div>
                    ))}
                </div>
            </div>

            <Button type="submit" disabled={mutation.isLoading || !isFormValid()} className="w-full">
                {mutation.isLoading ? 'Submitting...' : 'Submit'}
            </Button>

            <div className="mt-4 text-center">
                <Link to="/login" className="text-blue-600">Already registered? Login</Link>
            </div>
        </form>
    );
};

export default RegisterUserForm;