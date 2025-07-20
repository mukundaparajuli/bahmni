import { useMutation } from '@tanstack/react-query';
import { registerUser } from '@/api';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import useForm from '@/hooks/useForm';
import useToastError from '@/hooks/useToastError';
import FormField from '@/components/common/form-field';
import { ROLES } from '@/utils/constants';
import { useState } from 'react';

const RegisterUserForm = ({ onClose }) => {
    const { showError, showSuccess } = useToastError();
    const { formData, handleChange } = useForm({
        employeeId: '',
        fullName: '',
        email: '',
        department: '',
        education: '',
        profession: '',
        password: '',
    });
    const [selectedRoles, setSelectedRoles] = useState([]);

    const mutation = useMutation({
        mutationFn: () => {
            console.log(formData)
            const data = { ...formData, roles: selectedRoles };
            console.log(data);
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

    return (
        <form onSubmit={handleSubmit} className="grid gap-4">
            <FormField
                label="Employee Id"
                id="employeeId"
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
            />
            <FormField
                label="Full Name"
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
            />
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
                label="Department"
                id="department"
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
            />
            <FormField
                label="Education"
                id="education"
                type="text"
                name="education"
                value={formData.education}
                onChange={handleChange}
                required
            />
            <FormField
                label="Profession"
                id="profession"
                type="text"
                name="profession"
                value={formData.profession}
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
            <Button type="submit" disabled={mutation.isLoading}>
                {mutation.isLoading ? 'Registering...' : 'Register User'}
            </Button>
        </form>
    );
};

export default RegisterUserForm;