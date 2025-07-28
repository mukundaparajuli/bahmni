import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Edit, Plus } from 'lucide-react';
import { useData } from '@/contexts/data-context';

const ManageDepartments = () => {
    const { data, addItem, editItem, deleteItem } = useData();
    const [newDepartment, setNewDepartment] = useState({ value: '', label: '' });
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const handleAdd = () => {
        addItem('departments', newDepartment);
        setNewDepartment({ value: '', label: '' });
        setIsAddDialogOpen(false);
    };

    const handleEdit = () => {
        editItem('departments', editingDepartment);
        setEditingDepartment(null);
        setIsEditDialogOpen(false);
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Departments</h1>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Department
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Department</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Value</label>
                                <Input
                                    value={newDepartment.value}
                                    onChange={(e) => setNewDepartment({ ...newDepartment, value: e.target.value })}
                                    placeholder="e.g., engineering"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Label</label>
                                <Input
                                    value={newDepartment.label}
                                    onChange={(e) => setNewDepartment({ ...newDepartment, label: e.target.value })}
                                    placeholder="e.g., Engineering"
                                />
                            </div>
                            <Button onClick={handleAdd} className="w-full">
                                Add Department
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {data.departments.map((department) => (
                    <Card key={department.id}>
                        <CardContent className="flex justify-between items-center p-4">
                            <div>
                                <h3 className="font-semibold">{department.label}</h3>
                                <p className="text-sm text-gray-500">Value: {department.value}</p>
                            </div>
                            <div className="flex gap-2">
                                <Dialog
                                    open={isEditDialogOpen && editingDepartment?.id === department.id}
                                    onOpenChange={(open) => {
                                        setIsEditDialogOpen(open);
                                        if (!open) setEditingDepartment(null);
                                    }}
                                >
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" onClick={() => setEditingDepartment({ ...department })}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Edit Department</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Value</label>
                                                <Input
                                                    value={editingDepartment?.value || ''}
                                                    onChange={(e) =>
                                                        setEditingDepartment({ ...editingDepartment, value: e.target.value })
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Label</label>
                                                <Input
                                                    value={editingDepartment?.label || ''}
                                                    onChange={(e) =>
                                                        setEditingDepartment({ ...editingDepartment, label: e.target.value })
                                                    }
                                                />
                                            </div>
                                            <Button onClick={handleEdit} className="w-full">
                                                Update Department
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <Button variant="outline" size="sm" onClick={() => deleteItem('departments', department.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ManageDepartments;