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
            <div className='flex flex-wrap justify-center gap-4'>
                {data?.data?.data?.map((doc) => (
                    <ScannedDocumentCard key={doc._id} document={doc} />
                ))}
            </div>
        </div>
    )
}

export default ApprovedSection;