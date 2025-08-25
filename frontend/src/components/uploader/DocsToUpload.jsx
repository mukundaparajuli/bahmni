import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllApprovedDocuments } from '@/api/uploader-api';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination';
import ScannedDocumentCard from '../ScannedDocumentCard';

const DocsToUpload = () => {
    const [page, setPage] = useState(1);
    const limit = 16;

    const { data, isPending, isError, error, refetch } = useQuery({
        queryKey: ['docs-to-upload', page],
        queryFn: () => getAllApprovedDocuments({ page, limit }),
    });

    const docs = data?.data?.data?.data || [];
    const totalPages = data?.data?.data?.totalPages || 1;

    if (isPending) {
        return <div className='text-center text-gray-500'>Loading...</div>;
    }

    if (isError) {
        const errorMsg = error?.response?.data?.message || "Failed to load approved documents.";
        return <div className='text-center text-red-500'>{errorMsg}</div>;
    }

    if (docs.length === 0) {
        return <div className='text-center text-gray-500'>No approved documents found</div>;
    }

    return (
        <div className="p-4 w-full">
            <h1 className='text-2xl font-bold mb-4'>Approved Documents</h1>
            <div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {docs.map((doc) => (
                        <ScannedDocumentCard key={doc.id} document={doc} isUploader refetch={refetch} />
                    ))}
                </div>
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
        </div>
    );
};

export default DocsToUpload;