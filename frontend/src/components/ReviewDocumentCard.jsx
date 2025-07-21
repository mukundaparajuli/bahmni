import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approveDocument, rejectDocument } from '@/api/approver-api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { getStaticUrl } from '@/utils/get-static-url';
import { Document, Page } from 'react-pdf';
import Preview from './Preview';

const ReviewDocumentCard = ({ document }) => {
    const { fileName, filePath, patientMRN, status, scannedAt } = document;
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [rejectComment, setRejectComment] = useState('');
    const queryClient = useQueryClient();
    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
    const isPdf = filePath?.toLowerCase().endsWith(".pdf");

    // Handle clicks on the overlay (outside the preview content)
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            setIsPreviewOpen(false);
        }
    };

    // Handle Escape key press to close preview
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") {
                setIsPreviewOpen(false);
            }
        };
        if (isPreviewOpen) {
            window.addEventListener("keydown", handleEscape);
        }
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isPreviewOpen]);


    const approveMutation = useMutation({
        mutationFn: () => approveDocument(document._id),
        onSuccess: () => {
            showSuccess(`${document.fileName} approved successfully.`);
            refetch();
        },
        onError: (error) => {
            showError(error, 'Failed to approve document');
        },
    });

    const rejectMutation = useMutation({
        mutationFn: () => rejectDocument(document._id, rejectComment),
        onSuccess: () => {
            showSuccess(`${document.fileName} rejected successfully.`);
            setIsDialogOpen(false);
            setRejectComment('');
            queryClient.invalidateQueries(['approver-scanned-docs']);
        },
        onError: (error) => showError(error, 'Failed to reject document'),
    });

    const handleApprove = () => {
        approveMutation.mutate();
    };

    const handleReject = () => {
        if (!rejectComment.trim()) {
            showError('Please provide a reason for rejection');
            return;
        }
        rejectMutation.mutate();
    };

    return (
        <>
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        {fileName}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {isPdf ? (
                            <div className="w-full h-48 overflow-hidden rounded mb-2">
                                <Document file={getStaticUrl(filePath)}>
                                    <Page
                                        pageNumber={1}
                                        width={300}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                        className="w-full h-full object-cover"
                                    />
                                </Document>
                            </div>
                        ) : (
                            <img
                                src={getStaticUrl(filePath)}
                                alt={fileName}
                                className="w-full h-48 object-cover rounded mb-2"
                            />
                        )}
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
                        <Button
                            variant="outline"
                            className="w-full mt-4"
                            onClick={() => setIsPreviewOpen(true)}
                        >
                            Preview Document
                        </Button>
                        {isPreviewOpen && (
                            <div
                                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                                onClick={handleOverlayClick}
                            >
                                <div className="relative flex justify-center items-center max-w-[60vw] max-h-[90vh] overflow-auto">
                                    <Preview filePath={getStaticUrl(filePath)} />
                                </div>
                            </div>
                        )}
                        <div className="flex gap-2 mt-4">
                            <Button
                                onClick={handleApprove}
                                disabled={approveMutation.isLoading || rejectMutation.isLoading}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                Approve
                            </Button>
                            <Button
                                onClick={() => setIsDialogOpen(true)}
                                disabled={approveMutation.isLoading || rejectMutation.isLoading}
                                variant="destructive"
                                className="flex-1"
                            >
                                Reject
                            </Button>
                        </div>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Reject Document: {fileName}</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <Input
                                    value={rejectComment}
                                    onChange={(e) => setRejectComment(e.target.value)}
                                    placeholder="Enter reason for rejection"
                                    className="w-full"
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsDialogOpen(false)}
                                    disabled={rejectMutation.isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={handleReject}
                                    disabled={rejectMutation.isLoading}
                                >
                                    Submit Rejection
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                </CardContent>
            </Card>
        </>
    );
};


export default ReviewDocumentCard;