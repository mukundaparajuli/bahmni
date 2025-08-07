import React from 'react'
import ScannedDocumentCard from './ScannedDocumentCard';
import { useQuery } from '@tanstack/react-query';
import { getAllMyApprovedDocuments } from '@/api/approver-api';

const ApprovedSection = () => {
    const { data, isPending, isError, error } = useQuery({
        queryKey: ['approver-approved-docs'],
        queryFn: getAllMyApprovedDocuments
    });
    const docs = data?.data?.data?.data || [];

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
        <div>
            <h1 className='text-2xl font-bold mb-4'>Approved Documents</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {docs.map((doc) => (
                    <ScannedDocumentCard key={doc.id} document={doc} />
                ))}
            </div>
        </div>
    )
}

export default ApprovedSection;