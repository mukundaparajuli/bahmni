import React from 'react'
import ScannedDocumentCard from './ScannedDocumentCard';
import { useQuery } from '@tanstack/react-query';
import { getAllMyRejectedDocuments } from '@/api/approver-api';

const RejectedSection = () => {
    const { data, isPending, isError } = useQuery({
        queryKey: ['approver-rejected-docs'],
        queryFn: getAllMyRejectedDocuments
    });
    return (
        <div>
            <h1 className='text-2xl font-bold mb-4'>Rejected Documents</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {data?.data?.data?.map((doc) => (
                    <ScannedDocumentCard key={doc._id} document={doc} />
                ))}
            </div>
        </div>
    )
}

export default RejectedSection