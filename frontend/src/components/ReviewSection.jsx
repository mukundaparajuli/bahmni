import { getScannedDocuments, searchDocuments } from '@/api/approver-api';
import { useQuery } from '@tanstack/react-query';
import React, { useState, useCallback } from 'react';
import ReviewDocumentCard from './ReviewDocumentCard';
import SearchBar from './common/SearchBar';

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
    PaginationLink,
} from '@/components/ui/pagination';

const ReviewSection = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const limit = 9;

    // Fetch documents based on searchQuery and page
    const { data, isLoading, error } = useQuery({
        queryKey: ['approver-scanned-docs', searchQuery, page],
        queryFn: async () => {
            const params = { page, limit };
            if (searchQuery) {
                return await searchDocuments({ query: searchQuery, ...params });
            } else {
                return await getScannedDocuments(params);
            }
        },
        keepPreviousData: true,
    });

    // Handle search, reset to page 1 on new query
    const onSearch = useCallback((query) => {
        setSearchQuery(query.trim());
        setPage(1);
    }, []);

    // Extract documents and total pages safely from API response
    // Assuming your API response shape:
    // { data: { data: documentsArray, page, total, totalPages } }
    const documents = data?.data?.data?.data || [];
    const totalPages = data?.data?.data?.totalPages || 1;

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return (
            <div className="text-center text-red-500" role="alert">
                Error loading documents
            </div>
        );
    }

    return (
        <div className='w-full p-4'>
            <h1 className="text-2xl font-bold mb-4 w-full">Scanned Documents to Review</h1>

            <SearchBar onSearch={onSearch} placeholder="Search documents..." />

            <div className="flex w-full gap-4 flex-wrap justify-center mt-6">
                {documents.length > 0 ? (
                    documents.map((doc) => (
                        <ReviewDocumentCard key={doc.id} document={doc} />
                    ))
                ) : (
                    <div>No documents found</div>
                )}
            </div>

            {/* Pagination */}
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
        </div>
    );
};

export default ReviewSection;
