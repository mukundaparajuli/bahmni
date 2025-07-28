import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Edit, Plus } from 'lucide-react';
import useToastError from '@/hooks/useToastError';

const ManageProfessions = () => {
    const [professions, setProfessions] = useState([
        { id: 1, value: 'doctor', label: 'Doctor' },
        { id: 2, value: 'physician', label: 'Physician' },
        { id: 3, value: 'nurse', label: 'Nurse' },
        { id: 4, value: 'pharmacist', label: 'Pharmacist' },
        { id: 5, value: 'researcher', label: 'Researcher' },
        { id: 6, value: 'teacher', label: 'Teacher/Lecturer' },
        { id: 7, value: 'itspecialist', label: 'IT Specialist' },
        { id: 8, value: 'others', label: 'Others' },
    ]);
    const [newProfession, setNewProfession] = useState({ value: '', label: '' });
    const [editingProfession, setEditingProfession] = useState(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const { showError, showSuccess } = useToastError();

    const handleAddProfession = () => {
        if (!newProfession.value.trim() || !newProfession.label.trim()) {
            showError(new Error('Please fill in both value and label fields'), 'Validation Error');
            return;
        }

        const exists = professions.some(prof => 
            prof.value.toLowerCase() === newProfession.value.toLowerCase() || 
            prof.label.toLowerCase() === newProfession.label.toLowerCase()
        );

        if (exists) {
            showError(new Error('Profession already exists'), 'Validation Error');
            return;
        }

        const newProf = {
            id: Math.max(...professions.map(p => p.id)) + 1,
            value: newProfession.value.toLowerCase().replace(/\s+/g, '_'),
            label: newProfession.label
        };

        setProfessions([...professions, newProf]);
        setNewProfession({ value: '', label: '' });
        setIsAddDialogOpen(false);
        showSuccess('Profession added successfully');
    };

    const handleEditProfession = () => {
        if (!editingProfession.value.trim() || !editingProfession.label.trim()) {
            showError(new Error('Please fill in both value and label fields'), 'Validation Error');
            return;
        }

        const exists = professions.some(prof => 
            prof.id !== editingProfession.id && (
                prof.value.toLowerCase() === editingProfession.value.toLowerCase() || 
                prof.label.toLowerCase() === editingProfession.label.toLowerCase()
            )
        );

        if (exists) {
            showError(new Error('Profession already exists'), 'Validation Error');
            return;
        }

        setProfessions(professions.map(prof => 
            prof.id === editingProfession.id ? editingProfession : prof
        ));
        setEditingProfession(null);
        setIsEditDialogOpen(false);
        showSuccess('Profession updated successfully');
    };

    const handleDeleteProfession = (id) => {
        if (window.confirm('Are you sure you want to delete this profession?')) {
            setProfessions(professions.filter(prof => prof.id !== id));
            showSuccess('Profession deleted successfully');
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Professions</h1>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Profession
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Profession</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Value</label>
                                <Input
                                    value={newProfession.value}
                                    onChange={(e) => setNewProfession({...newProfession, value: e.target.value})}
                                    placeholder="e.g., doctor"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Label</label>
                                <Input
                                    value={newProfession.label}
                                    onChange={(e) => setNewProfession({...newProfession, label: e.target.value})}
                                    placeholder="e.g., Doctor"
                                />
                            </div>
                            <Button onClick={handleAddProfession} className="w-full">
                                Add Profession
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {professions.map((profession) => (
                    <Card key={profession.id}>
                        <CardContent className="flex justify-between items-center p-4">
                            <div>
                                <h3 className="font-semibold">{profession.label}</h3>
                                <p className="text-sm text-gray-500">Value: {profession.value}</p>
                            </div>
                            <div className="flex gap-2">
                                <Dialog open={isEditDialogOpen && editingProfession?.id === profession.id} 
                                       onOpenChange={(open) => {
                                           setIsEditDialogOpen(open);
                                           if (!open) setEditingProfession(null);
                                       }}>
                                    <DialogTrigger asChild>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setEditingProfession({...profession})}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Edit Profession</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Value</label>
                                                <Input
                                                    value={editingProfession?.value || ''}
                                                    onChange={(e) => setEditingProfession({
                                                        ...editingProfession, 
                                                        value: e.target.value
                                                    })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Label</label>
                                                <Input
                                                    value={editingProfession?.label || ''}
                                                    onChange={(e) => setEditingProfession({
                                                        ...editingProfession, 
                                                        label: e.target.value
                                                    })}
                                                />
                                            </div>
                                            <Button onClick={handleEditProfession} className="w-full">
                                                Update Profession
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDeleteProfession(profession.id)}
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

export default ManageProfessions;