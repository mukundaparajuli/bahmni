import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Edit, Plus } from 'lucide-react';
import { useData } from '@/contexts/data-context';

const ManageProfessions = () => {
    const { data, addItem, editItem, deleteItem } = useData();
    const [newProfession, setNewProfession] = useState({ value: '', label: '' });
    const [editingProfession, setEditingProfession] = useState(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const handleAdd = () => {
        addItem('professions', newProfession);
        setNewProfession({ value: '', label: '' });
        setIsAddDialogOpen(false);
    };

    const handleEdit = () => {
        editItem('professions', editingProfession);
        setEditingProfession(null);
        setIsEditDialogOpen(false);
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
                                    onChange={(e) => setNewProfession({ ...newProfession, value: e.target.value })}
                                    placeholder="e.g., doctor"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Label</label>
                                <Input
                                    value={newProfession.label}
                                    onChange={(e) => setNewProfession({ ...newProfession, label: e.target.value })}
                                    placeholder="e.g., Doctor"
                                />
                            </div>
                            <Button onClick={handleAdd} className="w-full">
                                Add Profession
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {data.professions.map((profession) => (
                    <Card key={profession.id}>
                        <CardContent className="flex justify-between items-center p-4">
                            <div>
                                <h3 className="font-semibold">{profession.label}</h3>
                                <p className="text-sm text-gray-500">Value: {profession.value}</p>
                            </div>
                            <div className="flex gap-2">
                                <Dialog
                                    open={isEditDialogOpen && editingProfession?.id === profession.id}
                                    onOpenChange={(open) => {
                                        setIsEditDialogOpen(open);
                                        if (!open) setEditingProfession(null);
                                    }}
                                >
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setEditingProfession({ ...profession })}
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
                                                    onChange={(e) =>
                                                        setEditingProfession({ ...editingProfession, value: e.target.value })
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Label</label>
                                                <Input
                                                    value={editingProfession?.label || ''}
                                                    onChange={(e) =>
                                                        setEditingProfession({ ...editingProfession, label: e.target.value })
                                                    }
                                                />
                                            </div>
                                            <Button onClick={handleEdit} className="w-full">
                                                Update Profession
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => deleteItem('professions', profession.id)}
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