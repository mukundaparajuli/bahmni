import React from 'react'
import ScannedDocumentCard from './ScannedDocumentCard';
import { useQuery } from '@tanstack/react-query';
import { getAllMyApprovedDocuments } from '@/api/approver-api';

const ApprovedSection = () => {

    const { data, isPending, isError } = useQuery({
        queryKey: ['approver-approved-docs'],
        queryFn: getAllMyApprovedDocuments
    });
    return (
        <div>
            <h1 className='text-2xl font-bold mb-4'>Approved Documents</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.data?.data?.data?.map((doc) => (
                    <ScannedDocumentCard key={doc.id} document={doc} />
                ))}
            </div>
        </div>
    )
}

export default ApprovedSection;