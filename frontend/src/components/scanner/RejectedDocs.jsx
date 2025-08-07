import React from 'react'
import ScannedDocumentCard from '../ScannedDocumentCard';
import { useQuery } from '@tanstack/react-query';
import { getAllMyRejectedDocuments } from '@/api/scanner-api';

const RejectedDocs = () => {
    const { data, isPending, isError, error } = useQuery({
        queryKey: ['scanner-rejected-docs'],
        queryFn: getAllMyRejectedDocuments,
        enabled: true,
    });

    // Defensive: get the docs array or empty array
    const docs = data?.data?.data || [];
    console.log(docs);

    if (isPending) {
        return <div className='text-center text-gray-500'>Loading...</div>;
    }

    if (isError) {
        // Try to get a backend error message, fallback to generic
        const errorMsg = error?.response?.data?.message || "Failed to load rejected documents.";
        return <div className='text-center text-red-500'>{errorMsg}</div>;
    }

    if (docs.length === 0) {
        return <div className='text-center text-gray-500'>No rejected documents found</div>;
    }

    return (
        <div>
            <h1 className='text-2xl font-bold mb-4'>Rejected Documents</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {docs.map((doc) => (
                    <ScannedDocumentCard key={doc.id} document={doc} isScanner />
                ))}
            </div>
        </div>
    );
}

export default RejectedDocs