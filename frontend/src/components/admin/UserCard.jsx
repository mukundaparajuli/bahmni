import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ROLES } from '@/utils/constants';

const UserCard = ({ user, handleReview, handleStatusToggle, handleRoleUpdate, rejectionReason, setRejectionReason }) => {
    return (
        <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <p className="text-sm"><strong>Name:</strong> {user.fullName}</p>
                    <p className="text-sm"><strong>Email:</strong> {user.email}</p>
                    <p className="text-sm"><strong>Status:</strong> {user.isActive ? 'Active' : 'Inactive'}</p>
                    <p className="text-sm"><strong>Registration:</strong> {user.registrationStatus}</p>
                    <div className="flex flex-wrap gap-1">
                        <strong className="text-sm">Roles:</strong>
                        {user.roles.length > 0 ? (
                            user.roles.map((role) => (
                                <Badge key={role} variant="secondary" className="text-xs">
                                    {role}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-sm text-gray-500">No roles assigned</span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {user.isSelfRegistered && user.registrationStatus === 'Pending' && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size="sm" className="w-full sm:w-auto">
                                    Review Registration
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Review Registration</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4">
                                    <Button onClick={() => handleReview(user._id, 'Approved')} size="sm">
                                        Approve
                                    </Button>
                                    <div>
                                        <Label htmlFor="rejectionReason">Rejection Reason</Label>
                                        <Input
                                            id="rejectionReason"
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                        />
                                        <Button
                                            onClick={() => handleReview(user._id, 'Rejected')}
                                            disabled={!rejectionReason}
                                            className="mt-2"
                                            size="sm"
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                    <Button
                        onClick={() => handleStatusToggle(user._id, !user.isActive)}
                    >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                {user.roles.length > 0 ? 'Edit Roles' : 'Assign Roles'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56">
                            <div className="grid gap-4">
                                {Object.values(ROLES).map((role) => (
                                    <div key={role} className="flex items-center gap-2">
                                        <Checkbox
                                            id={`${user._id}-${role}`}
                                            checked={user.roles.includes(role)}
                                            onCheckedChange={(checked) => {
                                                const newRoles = checked
                                                    ? [...user.roles, role]
                                                    : user.roles.filter((r) => r !== role);
                                                handleRoleUpdate(user._id, newRoles);
                                            }}
                                        />
                                        <Label htmlFor={`${user._id}-${role}`}>{role}</Label>
                                    </div>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    );
};

export default UserCard;