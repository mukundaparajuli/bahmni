import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { getStaticUrl } from '@/utils/get-static-url';

const ScannedDocumentCard = ({ document }) => {
    const { fileName, filePath, patientMRN, status, scannedAt } = document;
    console.log(getStaticUrl(filePath));
    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    {fileName}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <img src={getStaticUrl(filePath)} alt={fileName} className="w-full h-48 object-cover rounded-md mb-2" />
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">Patient MRN:</span> {patientMRN}
                    </p>
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">Status:</span> {status}
                    </p>
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">Scanned At:</span>{' '}
                        {new Date(scannedAt).toLocaleString()}
                    </p>
                </div>
                <Button variant="outline" className="mt-4 w-full">
                    View Document
                </Button>
            </CardContent>
        </Card>
    );
};

export default ScannedDocumentCard;