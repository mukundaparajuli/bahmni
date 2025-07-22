import { getAllMyScannedDocs, deleteScannedDoc } from '@/api/scanner-api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import ScannedDocumentCard from './ScannedDocumentCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import useToastError from '@/hooks/useToastError';

const DisplayScannedDocs = () => {
    const queryClient = useQueryClient();
    const { showError, showSuccess } = useToastError();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedDocId, setSelectedDocId] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ['scanned-docs'],
        queryFn: getAllMyScannedDocs,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteScannedDoc,
        onSuccess: () => {
            queryClient.invalidateQueries(['scanned-docs']);
            showSuccess('Document deleted successfully');
            setIsDeleteDialogOpen(false);
            setSelectedDocId(null);
        },
        onError: (error) => {
            console.error('Error deleting document:', error);
            showError(error, 'Failed to delete document');
        },
    });

    const handleDelete = (docId) => {
        setSelectedDocId(docId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (selectedDocId) {
            deleteMutation.mutate(selectedDocId);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    console.log(data);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">My Scanned Documents</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.data?.data?.map((doc) => (
                    <ScannedDocumentCard
                        key={doc._id}
                        document={doc}
                        deleteButton={doc.status === 'draft'}
                        onDelete={() => handleDelete(doc._id)}
                    />
                ))}
            </div>
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirm Document Deletion</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600">
                        Are you sure you want to delete this document? This action cannot be undone.
                    </p>
                    <div className="flex gap-2 mt-4 justify-end">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={deleteMutation.isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={deleteMutation.isLoading}
                        >
                            {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DisplayScannedDocs;