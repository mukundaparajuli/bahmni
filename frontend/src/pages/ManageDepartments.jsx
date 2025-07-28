import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Edit, Plus } from 'lucide-react';
import useToastError from '@/hooks/useToastError';

const ManageDepartments = () => {
    const [departments, setDepartments] = useState([
        { id: 1, value: 'engineering', label: 'Engineering' },
        { id: 2, value: 'hr', label: 'Human Resources' },
        { id: 3, value: 'marketing', label: 'Marketing' },
        { id: 4, value: 'finance', label: 'Finance' },
        { id: 5, value: 'it', label: 'Information Technology' },
    ]);
    const [newDepartment, setNewDepartment] = useState({ value: '', label: '' });
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const { showError, showSuccess } = useToastError();

    const handleAddDepartment = () => {
        if (!newDepartment.value.trim() || !newDepartment.label.trim()) {
            showError(new Error('Please fill in both value and label fields'), 'Validation Error');
            return;
        }

        const exists = departments.some(dept => 
            dept.value.toLowerCase() === newDepartment.value.toLowerCase() || 
            dept.label.toLowerCase() === newDepartment.label.toLowerCase()
        );

        if (exists) {
            showError(new Error('Department already exists'), 'Validation Error');
            return;
        }

        const newDept = {
            id: Math.max(...departments.map(d => d.id)) + 1,
            value: newDepartment.value.toLowerCase().replace(/\s+/g, '_'),
            label: newDepartment.label
        };

        setDepartments([...departments, newDept]);
        setNewDepartment({ value: '', label: '' });
        setIsAddDialogOpen(false);
        showSuccess('Department added successfully');
    };

    const handleEditDepartment = () => {
        if (!editingDepartment.value.trim() || !editingDepartment.label.trim()) {
            showError(new Error('Please fill in both value and label fields'), 'Validation Error');
            return;
        }

        const exists = departments.some(dept => 
            dept.id !== editingDepartment.id && (
                dept.value.toLowerCase() === editingDepartment.value.toLowerCase() || 
                dept.label.toLowerCase() === editingDepartment.label.toLowerCase()
            )
        );

        if (exists) {
            showError(new Error('Department already exists'), 'Validation Error');
            return;
        }

        setDepartments(departments.map(dept => 
            dept.id === editingDepartment.id ? editingDepartment : dept
        ));
        setEditingDepartment(null);
        setIsEditDialogOpen(false);
        showSuccess('Department updated successfully');
    };

    const handleDeleteDepartment = (id) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            setDepartments(departments.filter(dept => dept.id !== id));
            showSuccess('Department deleted successfully');
        }
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
                                    onChange={(e) => setNewDepartment({...newDepartment, value: e.target.value})}
                                    placeholder="e.g., engineering"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Label</label>
                                <Input
                                    value={newDepartment.label}
                                    onChange={(e) => setNewDepartment({...newDepartment, label: e.target.value})}
                                    placeholder="e.g., Engineering"
                                />
                            </div>
                            <Button onClick={handleAddDepartment} className="w-full">
                                Add Department
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {departments.map((department) => (
                    <Card key={department.id}>
                        <CardContent className="flex justify-between items-center p-4">
                            <div>
                                <h3 className="font-semibold">{department.label}</h3>
                                <p className="text-sm text-gray-500">Value: {department.value}</p>
                            </div>
                            <div className="flex gap-2">
                                <Dialog open={isEditDialogOpen && editingDepartment?.id === department.id} 
                                       onOpenChange={(open) => {
                                           setIsEditDialogOpen(open);
                                           if (!open) setEditingDepartment(null);
                                       }}>
                                    <DialogTrigger asChild>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setEditingDepartment({...department})}
                                        >
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
                                                    onChange={(e) => setEditingDepartment({
                                                        ...editingDepartment, 
                                                        value: e.target.value
                                                    })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Label</label>
                                                <Input
                                                    value={editingDepartment?.label || ''}
                                                    onChange={(e) => setEditingDepartment({
                                                        ...editingDepartment, 
                                                        label: e.target.value
                                                    })}
                                                />
                                            </div>
                                            <Button onClick={handleEditDepartment} className="w-full">
                                                Update Department
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDeleteDepartment(department.id)}
                                >
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