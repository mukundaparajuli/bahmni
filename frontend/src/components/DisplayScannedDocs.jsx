import {
    getAllMyScannedDocs,
    deleteScannedDoc,
    searchClerkDocuments,
} from '@/api/scanner-api';
import {
    useQuery,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import React, {
    useState,
    useCallback,
    useRef,
} from 'react';
import ScannedDocumentCard from './ScannedDocumentCard';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import useToastError from '@/hooks/useToastError';
import { Loader2, X } from 'lucide-react';
import SearchBar from './common/SearchBar';

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
    PaginationLink,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

const DisplayScannedDocs = () => {
    const queryClient = useQueryClient();
    const { showError, showSuccess } = useToastError();

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedDocId, setSelectedDocId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const limit = 9;

    const searchInputRef = useRef(null);

    const { data, isLoading, error, isFetching } = useQuery({
        queryKey: ['scanned-docs', searchTerm, page],
        queryFn: async () => {
            const params = { page, limit };
            const result = searchTerm
                ? await searchClerkDocuments({ searchTerm, ...params })
                : await getAllMyScannedDocs(params);
            return result;
        },
        keepPreviousData: true,
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
            showError(error, 'Failed to delete document');
        },
    });

    const handleDelete = useCallback((docId) => {
        setSelectedDocId(docId);
        setIsDeleteDialogOpen(true);
    }, []);

    const confirmDelete = useCallback(() => {
        if (selectedDocId) {
            deleteMutation.mutate(selectedDocId);
        }
    }, [selectedDocId, deleteMutation]);

    const onSearch = useCallback((term) => {
        setSearchTerm(term.trim());
        setPage(1);
    }, []);

    const clearSearch = useCallback(() => {
        setSearchTerm('');
        setPage(1);
        if (searchInputRef.current) {
            searchInputRef.current.value = '';
        }
    }, []);

    if (error) {
        showError(
            error,
            error.statusCode === 400
                ? 'Please enter a search term'
                : 'Failed to fetch documents'
        );
        return (
            <div className="text-center text-red-500" role="alert">
                Error: {error.message}
            </div>
        );
    }

    const documents = data?.data?.data?.data || [];
    const totalPages = data?.data?.data?.totalPages || 1;

    return (
        <div className="p-4 w-full">
            <h1 className="text-2xl font-bold mb-6">My Scanned Documents</h1>

            <div className="mb-6 flex items-center gap-2">
                <SearchBar onSearch={onSearch} placeholder="Search documents..." />
                {searchTerm && (
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={clearSearch}
                        aria-label="Clear search"
                        title="Clear search"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {isLoading || isFetching ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {documents.length > 0 ? (
                            documents.map((doc) => (
                                <ScannedDocumentCard key={doc.id} document={doc} />
                            ))
                        ) : (
                            <div className="text-center py-12 col-span-full">
                                <p className="text-lg text-gray-600">
                                    {searchTerm
                                        ? 'No documents found matching your search.'
                                        : 'You have no scanned documents yet.'}
                                </p>
                                {!searchTerm && (
                                    <Button className="mt-4" onClick={() => (window.location.href = '/scan')}>
                                        Scan a New Document
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <Pagination className="mt-6 flex justify-center">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                        className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>

                                {[...Array(totalPages)].map((_, index) => {
                                    const pageNumber = index + 1;
                                    return (
                                        <PaginationItem key={pageNumber}>
                                            <PaginationLink
                                                onClick={() => setPage(pageNumber)}
                                                isActive={page === pageNumber}
                                            >
                                                {pageNumber}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                })}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                        className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </>
            )}

            {/* Delete Confirmation Dialog */}
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
