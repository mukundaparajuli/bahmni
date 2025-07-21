import { getScannedDocuments } from '@/api/approver-api';
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import ReviewDocumentCard from './ReviewDocumentCard';

const ReviewSection = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['approver-scanned-docs'],
        queryFn: getScannedDocuments
    });
    isLoading && <div>Loading...</div>;

    return (
        <div>
            <h1 className='text-2xl font-bold mb-4'>Scanned Documents to Review</h1>
            <div className='flex gap-4 flex-wrap justify-center'>
                {data?.data?.data?.map((doc) => (
                    <ReviewDocumentCard key={doc._id} document={doc} />
                ))}
            </div>
        </div>
    )
}

export default ReviewSection