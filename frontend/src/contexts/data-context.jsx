import React, { createContext, useState, useContext, useEffect } from 'react';
import useToastError from '@/hooks/useToastError';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
    getAllEducations, createEducation, updateEducation, deleteEducation,
    getAllProfessions, createProfession, updateProfession, deleteProfession,
    getAllDepartments, createDepartment, updateDepartment, deleteDepartment 
} from '@/api/options';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const { showError, showSuccess } = useToastError();

    // Centralized state for all datasets
    const [data, setData] = useState({
        departments: [],
        education: [],
        professions: [],
    });

    // Loading states
    const [loading, setLoading] = useState({
        departments: false,
        education: false,
        professions: false,
    });

    // State for managing dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Load data from backend on mount
    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        await Promise.all([
            loadDepartments(),
            loadEducation(),
            loadProfessions()
        ]);
    };

    const loadDepartments = async () => {
        try {
            setLoading(prev => ({ ...prev, departments: true }));
            const departments = await getAllDepartments();
            setData(prev => ({
                ...prev,
                departments: departments.map(dept => ({
                    id: dept.id,
                    value: dept.name.toLowerCase().replace(/\s+/g, '_'),
                    label: dept.name,
                    description: dept.description,
                    isActive: dept.isActive,
                    _count: dept._count
                }))
            }));
        } catch (error) {
            showError(error, 'Failed to load departments');
        } finally {
            setLoading(prev => ({ ...prev, departments: false }));
        }
    };

    const loadEducation = async () => {
        try {
            setLoading(prev => ({ ...prev, education: true }));
            const education = await getAllEducations();
            setData(prev => ({
                ...prev,
                education: education.map(edu => ({
                    id: edu.id,
                    value: edu.name.toLowerCase().replace(/\s+/g, '_'),
                    label: edu.name,
                    description: edu.description,
                    isActive: edu.isActive,
                    _count: edu._count
                }))
            }));
        } catch (error) {
            showError(error, 'Failed to load education options');
        } finally {
            setLoading(prev => ({ ...prev, education: false }));
        }
    };

    const loadProfessions = async () => {
        try {
            setLoading(prev => ({ ...prev, professions: true }));
            const professions = await getAllProfessions();
            setData(prev => ({
                ...prev,
                professions: professions.map(prof => ({
                    id: prof.id,
                    value: prof.name.toLowerCase().replace(/\s+/g, '_'),
                    label: prof.name,
                    description: prof.description,
                    isActive: prof.isActive,
                    _count: prof._count
                }))
            }));
        } catch (error) {
            showError(error, 'Failed to load professions');
        } finally {
            setLoading(prev => ({ ...prev, professions: false }));
        }
    };

    // Generic function to add an item to a dataset
    const addItem = async (type, newItem) => {
        if (!newItem.label.trim()) {
            showError(new Error('Please fill in the name field'), 'Validation Error');
            return;
        }

        try {
            const apiData = {
                name: newItem.label,
                description: newItem.description || null
            };

            let createdItem;
            switch (type) {
                case 'departments':
                    createdItem = await createDepartment(apiData);
                    await loadDepartments();
                    break;
                case 'education':
                    createdItem = await createEducation(apiData);
                    await loadEducation();
                    break;
                case 'professions':
                    createdItem = await createProfession(apiData);
                    await loadProfessions();
                    break;
                default:
                    throw new Error(`Unknown type: ${type}`);
            }

            showSuccess(`${type.slice(0, -1)} added successfully`);
            return createdItem;
        } catch (error) {
            showError(error, `Failed to add ${type.slice(0, -1)}`);
        }
    };

    // Generic function to edit an item
    const editItem = async (type, updatedItem) => {
        if (!updatedItem.label.trim()) {
            showError(new Error('Please fill in the name field'), 'Validation Error');
            return;
        }

        try {
            const apiData = {
                name: updatedItem.label,
                description: updatedItem.description || null,
                isActive: updatedItem.isActive !== undefined ? updatedItem.isActive : true
            };

            let updated;
            switch (type) {
                case 'departments':
                    updated = await updateDepartment(updatedItem.id, apiData);
                    await loadDepartments();
                    break;
                case 'education':
                    updated = await updateEducation(updatedItem.id, apiData);
                    await loadEducation();
                    break;
                case 'professions':
                    updated = await updateProfession(updatedItem.id, apiData);
                    await loadProfessions();
                    break;
                default:
                    throw new Error(`Unknown type: ${type}`);
            }

            showSuccess(`${type.slice(0, -1)} updated successfully`);
            return updated;
        } catch (error) {
            showError(error, `Failed to update ${type.slice(0, -1)}`);
        }
    };

    // Generic function to delete an item
    const deleteItem = (type, id) => {
        // Store the item to delete and open the dialog
        setItemToDelete({ type, id });
        setDialogOpen(true);
    };

    // Handle deletion confirmation
    const confirmDelete = async () => {
        if (!itemToDelete) return;

        const { type, id } = itemToDelete;
        
        try {
            switch (type) {
                case 'departments':
                    await deleteDepartment(id);
                    await loadDepartments();
                    break;
                case 'education':
                    await deleteEducation(id);
                    await loadEducation();
                    break;
                case 'professions':
                    await deleteProfession(id);
                    await loadProfessions();
                    break;
                default:
                    throw new Error(`Unknown type: ${type}`);
            }

            showSuccess(`${type.slice(0, -1)} deleted successfully`);
        } catch (error) {
            showError(error, `Failed to delete ${type.slice(0, -1)}`);
        } finally {
            setDialogOpen(false);
            setItemToDelete(null);
        }
    };

    // Handle dialog cancel
    const cancelDelete = () => {
        setDialogOpen(false);
        setItemToDelete(null);
    };

    return (
        <DataContext.Provider value={{ 
            data, 
            loading, 
            addItem, 
            editItem, 
            deleteItem, 
            loadAllData,
            loadDepartments,
            loadEducation,
            loadProfessions 
        }}>
            {children}

            {/* Shadcn UI Dialog for Deletion Confirmation */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={cancelDelete}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);