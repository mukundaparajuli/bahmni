import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Edit, Plus } from 'lucide-react';
import useToastError from '@/hooks/useToastError';

const ManageEducation = () => {
    const [educationLevels, setEducationLevels] = useState([
        { id: 1, value: 'highschool', label: 'High School' },
        { id: 2, value: 'bachelor', label: 'Bachelor\'s Degree' },
        { id: 3, value: 'master', label: 'Master\'s Degree' },
        { id: 4, value: 'phd', label: 'PhD' },
    ]);
    const [newEducation, setNewEducation] = useState({ value: '', label: '' });
    const [editingEducation, setEditingEducation] = useState(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const { showError, showSuccess } = useToastError();

    const handleAddEducation = () => {
        if (!newEducation.value.trim() || !newEducation.label.trim()) {
            showError(new Error('Please fill in both value and label fields'), 'Validation Error');
            return;
        }

        const exists = educationLevels.some(edu => 
            edu.value.toLowerCase() === newEducation.value.toLowerCase() || 
            edu.label.toLowerCase() === newEducation.label.toLowerCase()
        );

        if (exists) {
            showError(new Error('Education level already exists'), 'Validation Error');
            return;
        }

        const newEdu = {
            id: Math.max(...educationLevels.map(e => e.id)) + 1,
            value: newEducation.value.toLowerCase().replace(/\s+/g, '_'),
            label: newEducation.label
        };

        setEducationLevels([...educationLevels, newEdu]);
        setNewEducation({ value: '', label: '' });
        setIsAddDialogOpen(false);
        showSuccess('Education level added successfully');
    };

    const handleEditEducation = () => {
        if (!editingEducation.value.trim() || !editingEducation.label.trim()) {
            showError(new Error('Please fill in both value and label fields'), 'Validation Error');
            return;
        }

        const exists = educationLevels.some(edu => 
            edu.id !== editingEducation.id && (
                edu.value.toLowerCase() === editingEducation.value.toLowerCase() || 
                edu.label.toLowerCase() === editingEducation.label.toLowerCase()
            )
        );

        if (exists) {
            showError(new Error('Education level already exists'), 'Validation Error');
            return;
        }

        setEducationLevels(educationLevels.map(edu => 
            edu.id === editingEducation.id ? editingEducation : edu
        ));
        setEditingEducation(null);
        setIsEditDialogOpen(false);
        showSuccess('Education level updated successfully');
    };

    const handleDeleteEducation = (id) => {
        if (window.confirm('Are you sure you want to delete this education level?')) {
            setEducationLevels(educationLevels.filter(edu => edu.id !== id));
            showSuccess('Education level deleted successfully');
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Education Levels</h1>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Education Level
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Education Level</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Value</label>
                                <Input
                                    value={newEducation.value}
                                    onChange={(e) => setNewEducation({...newEducation, value: e.target.value})}
                                    placeholder="e.g., bachelor"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Label</label>
                                <Input
                                    value={newEducation.label}
                                    onChange={(e) => setNewEducation({...newEducation, label: e.target.value})}
                                    placeholder="e.g., Bachelor's Degree"
                                />
                            </div>
                            <Button onClick={handleAddEducation} className="w-full">
                                Add Education Level
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {educationLevels.map((education) => (
                    <Card key={education.id}>
                        <CardContent className="flex justify-between items-center p-4">
                            <div>
                                <h3 className="font-semibold">{education.label}</h3>
                                <p className="text-sm text-gray-500">Value: {education.value}</p>
                            </div>
                            <div className="flex gap-2">
                                <Dialog open={isEditDialogOpen && editingEducation?.id === education.id} 
                                       onOpenChange={(open) => {
                                           setIsEditDialogOpen(open);
                                           if (!open) setEditingEducation(null);
                                       }}>
                                    <DialogTrigger asChild>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setEditingEducation({...education})}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Edit Education Level</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Value</label>
                                                <Input
                                                    value={editingEducation?.value || ''}
                                                    onChange={(e) => setEditingEducation({
                                                        ...editingEducation, 
                                                        value: e.target.value
                                                    })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Label</label>
                                                <Input
                                                    value={editingEducation?.label || ''}
                                                    onChange={(e) => setEditingEducation({
                                                        ...editingEducation, 
                                                        label: e.target.value
                                                    })}
                                                />
                                            </div>
                                            <Button onClick={handleEditEducation} className="w-full">
                                                Update Education Level
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDeleteEducation(education.id)}
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

export default ManageEducation;