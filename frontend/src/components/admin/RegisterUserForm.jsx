import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { registerUser } from '@/api';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import useForm from '@/hooks/useForm';
import useToastError from '@/hooks/useToastError';
import FormField from '@/components/common/form-field';
import { ROLES } from '@/utils/constants';
import { useOptions } from '@/hooks/useOptions';

const RegisterUserForm = ({ onClose }) => {
    const { showError, showSuccess } = useToastError();
    const { options, loading: optionsLoading } = useOptions();
    const { formData, handleChange } = useForm({
        employeeId: '',
        fullName: '',
        email: '',
        departmentId: '',
        educationId: '',
        professionId: '',
        password: '',
    });
    const [selectedRoles, setSelectedRoles] = useState([]);

    const mutation = useMutation({
        mutationFn: () => {
            const data = { ...formData, roles: selectedRoles };
            return registerUser(data);
        },
        onSuccess: () => {
            showSuccess('User registered successfully');
            onClose();
        },
        onError: (error) => showError(error, 'User registration failed'),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedRoles.length === 0) {
            showError(null, 'At least one role is required');
            return;
        }
        mutation.mutate();
    };

    const handleRoleChange = (role, checked) => {
        setSelectedRoles((prev) =>
            checked ? [...prev, role] : prev.filter((r) => r !== role)
        );
    };

    const fields = [
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
            placeholder: 'Select your education level',
            options: [
                { value: 'highschool', label: 'High School' },
                { value: 'bachelor', label: 'Bachelor’s Degree' },
                { value: 'master', label: 'Master’s Degree' },
                { value: 'phd', label: 'PhD' },
            ],
        },
        {
            id: 'professionId',
            label: 'Profession',
            type: 'select',
            placeholder: 'Select your profession',
            options: [
                { value: 'engineer', label: 'Engineer' },
                { value: 'manager', label: 'Manager' },
                { value: 'analyst', label: 'Analyst' },
                { value: 'developer', label: 'Developer' },
                { value: 'designer', label: 'Designer' },
            ],
        },
        { id: 'password', label: 'Password', type: 'password', placeholder: 'Enter your password' },
    ];

    return (
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

            <div>
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

            <Button type="submit" disabled={mutation.isLoading} className="w-full">
                {mutation.isLoading ? 'Submitting...' : 'Submit'}
            </Button>

        </form>
    );
};

export default RegisterUserForm;
