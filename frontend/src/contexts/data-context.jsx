import React, { createContext, useState, useContext } from 'react';
import useToastError from '@/hooks/useToastError';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const { showError, showSuccess } = useToastError();

    // Centralized state for all datasets
    const [data, setData] = useState({
        departments: [
            { id: 1, value: 'engineering', label: 'Engineering' },
            { id: 2, value: 'hr', label: 'Human Resources' },
            { id: 3, value: 'marketing', label: 'Marketing' },
            { id: 4, value: 'finance', label: 'Finance' },
            { id: 5, value: 'it', label: 'Information Technology' },
        ],
        education: [
            { id: 1, value: 'highschool', label: 'High School' },
            { id: 2, value: 'bachelor', label: "Bachelor's Degree" },
            { id: 3, value: 'master', label: "Master's Degree" },
            { id: 4, value: 'phd', label: 'PhD' },
        ],
        professions: [
            { id: 1, value: 'doctor', label: 'Doctor' },
            { id: 2, value: 'physician', label: 'Physician' },
            { id: 3, value: 'nurse', label: 'Nurse' },
            { id: 4, value: 'pharmacist', label: 'Pharmacist' },
            { id: 5, value: 'researcher', label: 'Researcher' },
            { id: 6, value: 'teacher', label: 'Teacher/Lecturer' },
            { id: 7, value: 'itspecialist', label: 'IT Specialist' },
            { id: 8, value: 'others', label: 'Others' },
        ],
    });

    // State for managing dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Generic function to add an item to a dataset
    const addItem = (type, newItem) => {
        if (!newItem.value.trim() || !newItem.label.trim()) {
            showError(new Error('Please fill in both value and label fields'), 'Validation Error');
            return;
        }

        const exists = data[type].some(
            (item) =>
                item.value.toLowerCase() === newItem.value.toLowerCase() ||
                item.label.toLowerCase() === newItem.label.toLowerCase()
        );

        if (exists) {
            showError(new Error(`${type} already exists`), 'Validation Error');
            return;
        }

        const newId = Math.max(...data[type].map((item) => item.id), 0) + 1;
        const formattedItem = {
            id: newId,
            value: newItem.value.toLowerCase().replace(/\s+/g, '_'),
            label: newItem.label,
        };

        setData((prev) => ({
            ...prev,
            [type]: [...prev[type], formattedItem],
        }));
        showSuccess(`${type} added successfully`);
    };

    // Generic function to edit an item
    const editItem = (type, updatedItem) => {
        if (!updatedItem.value.trim() || !updatedItem.label.trim()) {
            showError(new Error('Please fill in both value and label fields'), 'Validation Error');
            return;
        }

        const exists = data[type].some(
            (item) =>
                item.id !== updatedItem.id &&
                (item.value.toLowerCase() === updatedItem.value.toLowerCase() ||
                    item.label.toLowerCase() === updatedItem.label.toLowerCase())
        );

        if (exists) {
            showError(new Error(`${type} already exists`), 'Validation Error');
            return;
        }

        setData((prev) => ({
            ...prev,
            [type]: prev[type].map((item) => (item.id === updatedItem.id ? updatedItem : item)),
        }));
        showSuccess(`${type} updated successfully`);
    };

    // Generic function to delete an item
    const deleteItem = (type, id) => {
        // Store the item to delete and open the dialog
        setItemToDelete({ type, id });
        setDialogOpen(true);
    };

    // Handle deletion confirmation
    const confirmDelete = () => {
        if (!itemToDelete) return;

        const { type, id } = itemToDelete;
        setData((prev) => ({
            ...prev,
            [type]: prev[type].filter((item) => item.id !== id),
        }));
        showSuccess(`${type} deleted successfully`);
        setDialogOpen(false);
        setItemToDelete(null);
    };

    // Handle dialog cancel
    const cancelDelete = () => {
        setDialogOpen(false);
        setItemToDelete(null);
    };

    return (
        <DataContext.Provider value={{ data, addItem, editItem, deleteItem }}>
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