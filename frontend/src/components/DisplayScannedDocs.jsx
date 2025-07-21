import { getAllMyScannedDocs } from '@/api/scanner-api';
import { useQuery } from '@tanstack/react-query';
import React from 'react'
import ScannedDocumentCard from './ScannedDocumentCard';

const DisplayScannedDocs = () => {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['scanned-docs'],
        queryFn: getAllMyScannedDocs
    });
    isLoading && <div>Loading...</div>;

    console.log(data);
    return (
        <div>
            <h1 className='text-2xl font-bold mb-4'>My Scanned Documents</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {data?.data?.data?.map((doc) => (
                    <ScannedDocumentCard key={doc._id} document={doc} />
                ))}
            </div>
        </div>
    )
}

export default DisplayScannedDocs