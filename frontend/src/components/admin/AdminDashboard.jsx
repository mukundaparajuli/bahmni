import { useQuery, useMutation } from '@tanstack/react-query';
import { getUsers, reviewSelfRegistration, toggleUserStatus, updateUserRoles } from '@/api';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useToastError from '@/hooks/useToastError';
import { useState } from 'react';
import { ROLES } from '@/utils/constants';
import RegisterUserForm from './RegisterUserForm';
import UserCard from './UserCard';

const AdminDashboard = () => {
    const { showError, showSuccess } = useToastError();
    const { data, isLoading, refetch } = useQuery({ queryKey: ['users'], queryFn: getUsers });
    const [rejectionReason, setRejectionReason] = useState('');
    const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);

    const reviewMutation = useMutation({
        mutationFn: reviewSelfRegistration,
        onSuccess: () => {
            showSuccess('Registration reviewed');
            refetch();
        },
        onError: (error) => showError(error, 'Review failed'),
    });

    const statusMutation = useMutation({
        mutationFn: ({ userId, data }) => toggleUserStatus(userId, data),
        onSuccess: () => {
            showSuccess('User status updated');
            refetch();
        },
        onError: (error) => showError(error, 'Status update failed'),
    });

    const rolesMutation = useMutation({
        mutationFn: ({ userId, data }) => updateUserRoles(userId, data),
        onSuccess: () => {
            showSuccess('User roles updated');
            refetch();
        },
        onError: (error) => showError(error, 'Roles update failed'),
    });

    const handleReview = (userId, status) => {
        const data = { userId, status };
        if (status === 'Rejected') {
            data.rejectionReason = rejectionReason;
        }
        reviewMutation.mutate(data);
        setRejectionReason('');
    };

    const handleStatusToggle = (userId, isActive) => {
        statusMutation.mutate({ userId, data: { isActive } });
    };

    const handleRoleUpdate = (userId, selectedRoles) => {
        if (selectedRoles.length === 0) {
            showError(null, 'At least one role is required');
            return;
        }
        rolesMutation.mutate({ userId, data: { roles: selectedRoles } });
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Admin Dashboard</h2>
                <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Register New User</Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Register New User</DialogTitle>
                        </DialogHeader>
                        <RegisterUserForm onClose={() => {
                            setIsRegisterDialogOpen(false);
                            refetch();
                        }} />
                    </DialogContent>
                </Dialog>
            </div>
            <div className="grid gap-4">
                {data?.data?.data?.users?.map((user) => (
                    <UserCard user={user} handleReview={handleReview} handleRoleUpdate={handleRoleUpdate} handleStatusToggle={handleStatusToggle} rejectionReason={rejectionReason} setRejectionReason={setRejectionReason} />
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;