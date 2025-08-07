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
import { useOptions } from '@/hooks/useOptions';
import { getStaticUrl } from '@/utils/get-static-url';


const Profile = () => {
    const { user, setUser } = useContext(AuthContext);
    const { showError, showSuccess } = useToastError();
    const { options, loading: optionsLoading } = useOptions();
    const [previewImage, setPreviewImage] = useState(null);
    const [profilePreviewImage, setProfilePreviewImage] = useState(null);

    const { formData, handleChange, handleFileChange, errors, setErrors } = useForm({
        fullName: user?.fullName || '',
        email: user?.email || '',
        departmentId: user?.departmentId?.toString() || '',
        professionId: user?.professionId?.toString() || '',
        educationId: user?.educationId?.toString() || '',
        employeeId: user?.employeeId || '',
        password: '',
        photo: null,
        employeeIdPhoto: null,
    });
    const [formErrors, setFormErrors] = useState({});
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const mutation = useMutation({
        mutationFn: (data) => updateUser(user.id, data),
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

    const handleEmployeeIdPhotoChange = (e) => {
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
            handleFileChange(e, 'employeeIdPhoto');
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleProfilePhotoChange = (e) => {
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
            handleFileChange(e, 'photo');
            setProfilePreviewImage(URL.createObjectURL(file));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullName) newErrors.fullName = 'Full name is required';
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email';
        }
        if (!formData.departmentId) newErrors.departmentId = 'Department is required';
        if (!formData.professionId) newErrors.professionId = 'Profession is required';
        if (!formData.educationId) newErrors.educationId = 'Education is required';
        if (!formData.employeeId) newErrors.employeeId = 'Employee ID is required';
        if (formData.password && formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (formData.photo && !['image/jpeg', 'image/png'].includes(formData.photo.type)) {
            newErrors.photo = 'Only JPEG or PNG images are allowed';
        }
        if (formData.employeeIdPhoto && !['image/jpeg', 'image/png'].includes(formData.employeeIdPhoto.type)) {
            newErrors.employeeIdPhoto = 'Only JPEG or PNG images are allowed';
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
                        <AvatarImage src={profilePreviewImage || getStaticUrl(user.photo)} alt={user.fullName} />
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
                    <Label htmlFor="departmentId" className="text-sm font-medium">Department</Label>
                    <FormField
                        id="departmentId"
                        type="select"
                        name="departmentId"
                        value={formData.departmentId}
                        onChange={handleChange}
                        required
                        placeholder={optionsLoading ? 'Loading departments...' : 'Select your department'}
                        options={options.departments}
                        disabled={optionsLoading}
                        className="mt-1"
                    />
                    {formErrors.departmentId && <p className="text-red-600 text-sm mt-1">{formErrors.departmentId}</p>}
                </div>
                <div className="col-span-1">
                    <Label htmlFor="professionId" className="text-sm font-medium">Profession</Label>
                    <FormField
                        id="professionId"
                        type="select"
                        name="professionId"
                        value={formData.professionId}
                        onChange={handleChange}
                        required
                        placeholder={optionsLoading ? 'Loading professions...' : 'Select your profession'}
                        options={options.professions}
                        disabled={optionsLoading}
                        className="mt-1"
                    />
                    {formErrors.professionId && <p className="text-red-600 text-sm mt-1">{formErrors.professionId}</p>}
                </div>
                <div className="col-span-1">
                    <Label htmlFor="educationId" className="text-sm font-medium">Education</Label>
                    <FormField
                        id="educationId"
                        type="select"
                        name="educationId"
                        value={formData.educationId}
                        onChange={handleChange}
                        required
                        placeholder={optionsLoading ? 'Loading education options...' : 'Select your education level'}
                        options={options.educations}
                        disabled={optionsLoading}
                        className="mt-1"
                    />
                    {formErrors.educationId && <p className="text-red-600 text-sm mt-1">{formErrors.educationId}</p>}
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
                        onChange={handleProfilePhotoChange}
                        accept="image/jpeg,image/png"
                        className="mt-1"
                    />
                    {formErrors.photo && <p className="text-red-600 text-sm mt-1">{formErrors.photo}</p>}
                </div>
                <div className="col-span-2">
                    <Label htmlFor="employeeIdPhoto" className="text-sm font-medium">Employee ID Photo (optional)</Label>
                    <FormField
                        id="employeeIdPhoto"
                        type="file"
                        name="employeeIdPhoto"
                        onChange={handleEmployeeIdPhotoChange}
                        accept="image/jpeg,image/png"
                        className="mt-1"
                    />
                    {formErrors.employeeIdPhoto && <p className="text-red-600 text-sm mt-1">{formErrors.employeeIdPhoto}</p>}
                    {(previewImage || user.employeeIdPhoto) && (
                        <div className="mt-2">
                            <img
                                src={previewImage || getStaticUrl(user.employeeIdPhoto)}
                                alt="Employee ID preview"
                                className="w-32 h-32 object-cover rounded border border-gray-300"
                            />
                        </div>
                    )}
                </div>
                <div className="col-span-2 space-y-2">
                    <p className="text-sm"><strong>Roles:</strong> {user.roles.join(', ') || 'None'}</p>
                    <p className="text-sm"><strong>Status:</strong> {user.isActive ? 'Active' : 'Inactive'}</p>
                    <Button type="submit" disabled={mutation.isLoading || optionsLoading} className="w-full mt-4">
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