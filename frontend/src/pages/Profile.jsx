import React, { useContext, useState } from 'react';
import { AuthContext } from '@/contexts/auth-context';
import { useMutation } from '@tanstack/react-query';
import { updateUser } from '@/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import useToastError from '@/hooks/useToastError';
import FormField from '@/components/common/form-field';
import useForm from '@/hooks/useForm';
import { getStaticUrl } from '@/utils/get-static-url';


const Profile = () => {
    const { user, setUser } = useContext(AuthContext);
    const { showError, showSuccess } = useToastError();
    const { formData, handleChange, handleFileChange, errors, setErrors } = useForm({
        fullName: user?.fullName || '',
        email: user?.email || '',
        department: user?.department || '',
        employeeId: user?.employeeId || '',
        password: '',
        photo: null,
    });
    const [formErrors, setFormErrors] = useState({});
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const mutation = useMutation({
        mutationFn: (data) => updateUser(user._id, data),
        onSuccess: ({ data }) => {
            localStorage.setItem('user', JSON.stringify(data.data));
            setUser(data.data);
            showSuccess('Profile updated successfully');
            setIsConfirmOpen(false);
        },
        onError: (error) => {
            console.log(error)
            showError(error, 'Profile update failed')
        }
    });

    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullName) newErrors.fullName = 'Full name is required';
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email';
        }
        if (!formData.department) newErrors.department = 'Department is required';
        if (!formData.employeeId) newErrors.employeeId = 'Employee ID is required';
        if (formData.password && formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (formData.photo && !['image/jpeg', 'image/png'].includes(formData.photo.type)) {
            newErrors.photo = 'Only JPEG or PNG images are allowed';
        }
        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsConfirmOpen(true);
    };

    const confirmUpdate = () => {
        const payload = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value && key !== 'password') payload.append(key, value);
        });
        if (formData.password) payload.append('password', formData.password);
        mutation.mutate(payload);
    };


    if (!user) return <div className="container mx-auto p-6 text-center">Please log in to view your profile.</div>;

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <h2 className="text-2xl font-bold mb-6 text-center">User Profile</h2>
            <form onSubmit={onSubmit} className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 bg-white p-6 rounded-lg shadow-md">
                <div className="col-span-2 flex justify-center mb-4">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={formData.photo || getStaticUrl(user.photo)} alt={user.fullName} />
                        <AvatarFallback className="bg-gray-600 text-white text-2xl">
                            {user.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>
                <div className="col-span-1">
                    <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                    <FormField
                        id="fullName"
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="mt-1"
                    />
                    {formErrors.fullName && <p className="text-red-600 text-sm mt-1">{formErrors.fullName}</p>}
                </div>
                <div className="col-span-1">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <FormField
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="mt-1"
                    />
                    {formErrors.email && <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>}
                </div>
                <div className="col-span-1">
                    <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                    <FormField
                        id="department"
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                        className="mt-1"
                    />
                    {formErrors.department && <p className="text-red-600 text-sm mt-1">{formErrors.department}</p>}
                </div>
                <div className="col-span-1">
                    <Label htmlFor="employeeId" className="text-sm font-medium">Employee ID</Label>
                    <FormField
                        id="employeeId"
                        type="text"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        required
                        className="mt-1"
                    />
                    {formErrors.employeeId && <p className="text-red-600 text-sm mt-1">{formErrors.employeeId}</p>}
                </div>
                <div className="col-span-2">
                    <Label htmlFor="password" className="text-sm font-medium">New Password (optional)</Label>
                    <FormField
                        id="password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="mt-1"
                    />
                    {formErrors.password && <p className="text-red-600 text-sm mt-1">{formErrors.password}</p>}
                </div>
                <div className="col-span-2">
                    <Label htmlFor="photo" className="text-sm font-medium">Profile Photo (optional)</Label>
                    <FormField
                        id="photo"
                        type="file"
                        name="photo"
                        onChange={(e) => handleFileChange(e, 'photo')}
                        accept="image/jpeg,image/png"
                        className="mt-1"
                    />
                    {formErrors.photo && <p className="text-red-600 text-sm mt-1">{formErrors.photo}</p>}
                </div>
                <div className="col-span-2 space-y-2">
                    <p className="text-sm"><strong>Roles:</strong> {user.roles.join(', ') || 'None'}</p>
                    <p className="text-sm"><strong>Status:</strong> {user.isActive ? 'Active' : 'Inactive'}</p>
                    <Button type="submit" disabled={mutation.isLoading} className="w-full mt-4">
                        {mutation.isLoading ? 'Updating...' : 'Update Profile'}
                    </Button>
                </div>
            </form>
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirm Profile Update</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600">Are you sure you want to update your profile?</p>
                    <div className="flex gap-2 mt-4 justify-end">
                        <Button
                            variant="outline"
                            onClick={() => setIsConfirmOpen(false)}
                            disabled={mutation.isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmUpdate}
                            disabled={mutation.isLoading}
                        >
                            Confirm
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Profile;