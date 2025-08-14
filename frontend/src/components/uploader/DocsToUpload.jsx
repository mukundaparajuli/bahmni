import React from 'react'
import { useQuery } from '@tanstack/react-query';
import { getAllApprovedDocuments } from '@/api/uploader-api';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination';
import { Loader2 } from 'lucide-react';
import ScannedDocumentCard from '../ScannedDocumentCard';

const DocsToUpload = () => {
    const { data, isPending, isError, error } = useQuery({
        queryKey: ['docs-to-upload'],
        queryFn: getAllApprovedDocuments
    });
    const docs = data?.data?.data?.data || [];
    const totalPages = data?.data?.data?.totalPages;

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
                    {docs.length > 0 && (
                        docs.map((doc) => (
                            <ScannedDocumentCard key={doc.id} document={doc} isUploader />
                        ))
                    )}
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
    )
}


export default DocsToUpload;