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
import { Loader2, X, Search } from 'lucide-react';
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
            <div className="text-center text-red-500 p-4" role="alert">
                Error: {error.message}
            </div>
        );
    }

    const documents = data?.data?.data?.data || [];
    const totalPages = data?.data?.data?.totalPages || 1;

    return (
        <div className="p-4 w-full max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold">My Scanned Documents</h1>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                        <SearchBar
                            onSearch={onSearch}
                            placeholder="Search documents..."
                            ref={searchInputRef}
                        />
                    </div>
                    {searchTerm && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={clearSearch}
                            aria-label="Clear search"
                            title="Clear search"
                            className="flex-shrink-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {isLoading || isFetching ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {documents.length > 0 ? (
                            documents.map((doc) => (
                                <ScannedDocumentCard
                                    key={doc.id}
                                    document={doc}
                                    isScanner
                                    onDelete={handleDelete}
                                />
                            ))
                        ) : (
                            <div className="text-center py-12 col-span-full">
                                <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mb-4">
                                    <Search className="h-8 w-8 text-gray-400" />
                                </div>
                                <p className="text-lg text-gray-600 mb-4">
                                    {searchTerm
                                        ? 'No documents found matching your search.'
                                        : 'You have no scanned documents yet.'}
                                </p>
                                {!searchTerm && (
                                    <Button
                                        className="mt-2"
                                        onClick={() => (window.location.href = '/scan')}
                                        size="lg"
                                    >
                                        Scan a New Document
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-6 overflow-x-auto">
                            <Pagination className="justify-center">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                            className={cn(
                                                "select-none",
                                                page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                                            )}
                                        />
                                    </PaginationItem>

                                    {[...Array(totalPages)].map((_, index) => {
                                        const pageNumber = index + 1;
                                        // Show limited page numbers on mobile
                                        if (totalPages > 5 && (pageNumber < page - 1 || pageNumber > page + 1) &&
                                            pageNumber !== 1 && pageNumber !== totalPages) {
                                            if (pageNumber === page - 2 || pageNumber === page + 2) {
                                                return (
                                                    <PaginationItem key={`ellipsis-${pageNumber}`}>
                                                        <span className="px-2">...</span>
                                                    </PaginationItem>
                                                );
                                            }
                                            return null;
                                        }

                                        return (
                                            <PaginationItem key={pageNumber}>
                                                <PaginationLink
                                                    onClick={() => setPage(pageNumber)}
                                                    isActive={page === pageNumber}
                                                    className="cursor-pointer"
                                                >
                                                    {pageNumber}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    })}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                            className={cn(
                                                "select-none",
                                                page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                                            )}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)]">
                    <DialogHeader>
                        <DialogTitle>Confirm Document Deletion</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600">
                        Are you sure you want to delete this document? This action cannot be undone.
                    </p>
                    <div className="flex flex-col-reverse sm:flex-row gap-2 mt-4 justify-end">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={deleteMutation.isLoading}
                            className="mt-2 sm:mt-0"
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