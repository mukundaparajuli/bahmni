import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ROLES } from '@/utils/constants';
import { getStaticUrl } from '@/utils/get-static-url';

const UserCard = ({ user, handleReview, handleStatusToggle, handleRoleUpdate, rejectionReason, setRejectionReason }) => {
    console.log('UserCard rendered for:', user);
    return (
        <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    {/* User Info */}
                    {user.photo && (
                        <img src={getStaticUrl(user.photo)} alt={`${user.fullName}'s Photo`} className="w-16 h-16 rounded-full border object-cover" />
                    )}
                    <p className="text-sm"><strong>Name:</strong> {user.fullName}</p>
                    <p className="text-sm"><strong>Email:</strong> {user.email}</p>
                    <p className="text-sm"><strong>Employee ID:</strong> {user.employeeId || 'N/A'}</p>
                    {user.employeeIdPhoto && (
                        <img src={user.employeeIdPhoto} alt="Employee ID" className="w-32 h-20 rounded border object-cover" />
                    )}
                    <p className="text-sm"><strong>Department:</strong> {user.department || 'N/A'}</p>
                    <p className="text-sm"><strong>Profession:</strong> {user.profession || 'N/A'}</p>
                    <p className="text-sm"><strong>Education:</strong> {user.education || 'N/A'}</p>
                    <p className="text-sm"><strong>Status:</strong> {user.isActive ? 'Active' : 'Inactive'}</p>
                    <p className="text-sm"><strong>Registration:</strong> {user.registrationStatus}</p>
                    <p className="text-sm"><strong>Account Created:</strong> {new Date(user.createdAt).toLocaleString()}</p>

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
                                    <Button onClick={() => handleReview(user.id, 'Approved')} size="sm">
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
                                            onClick={() => handleReview(user.id, 'Rejected')}
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
                        onClick={() => handleStatusToggle(user.id, !user.isActive)}
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
                                            id={`${user.id}-${role}`}
                                            checked={user.roles.includes(role)}
                                            onCheckedChange={(checked) => {
                                                const newRoles = checked
                                                    ? [...user.roles, role]
                                                    : user.roles.filter((r) => r !== role);
                                                handleRoleUpdate(user.id, newRoles);
                                            }}
                                        />
                                        <Label htmlFor={`${user.id}-${role}`}>{role}</Label>
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