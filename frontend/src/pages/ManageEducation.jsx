import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Edit, Plus } from 'lucide-react';
import { useData } from '@/contexts/data-context';

const ManageEducation = () => {
    const { data, addItem, editItem, deleteItem } = useData();
    const [newEducation, setNewEducation] = useState({ value: '', label: '' });
    const [editingEducation, setEditingEducation] = useState(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const handleAdd = () => {
        addItem('education', newEducation);
        setNewEducation({ value: '', label: '' });
        setIsAddDialogOpen(false);
    };

    const handleEdit = () => {
        editItem('education', editingEducation);
        setEditingEducation(null);
        setIsEditDialogOpen(false);
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
                                    onChange={(e) => setNewEducation({ ...newEducation, value: e.target.value })}
                                    placeholder="e.g., bachelor"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Label</label>
                                <Input
                                    value={newEducation.label}
                                    onChange={(e) => setNewEducation({ ...newEducation, label: e.target.value })}
                                    placeholder="e.g., Bachelor's Degree"
                                />
                            </div>
                            <Button onClick={handleAdd} className="w-full">
                                Add Education Level
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {data.education.map((education) => (
                    <Card key={education.id}>
                        <CardContent className="flex justify-between items-center p-4">
                            <div>
                                <h3 className="font-semibold">{education.label}</h3>
                                <p className="text-sm text-gray-500">Value: {education.value}</p>
                            </div>
                            <div className="flex gap-2">
                                <Dialog
                                    open={isEditDialogOpen && editingEducation?.id === education.id}
                                    onOpenChange={(open) => {
                                        setIsEditDialogOpen(open);
                                        if (!open) setEditingEducation(null);
                                    }}
                                >
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setEditingEducation({ ...education })}
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
                                                    onChange={(e) =>
                                                        setEditingEducation({ ...editingEducation, value: e.target.value })
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Label</label>
                                                <Input
                                                    value={editingEducation?.label || ''}
                                                    onChange={(e) =>
                                                        setEditingEducation({ ...editingEducation, label: e.target.value })
                                                    }
                                                />
                                            </div>
                                            <Button onClick={handleEdit} className="w-full">
                                                Update Education Level
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => deleteItem('education', education.id)}
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