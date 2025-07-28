import React, { useEffect, useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approveDocument, rejectDocument } from '@/api/approver-api';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Info, Loader2 } from 'lucide-react';
import { getStaticUrl } from '@/utils/get-static-url';
import { Document, Page } from 'react-pdf';
import Preview from './Preview';
import { cn } from '@/lib/utils';
import useToastError from '@/hooks/useToastError';

// Import centralized PDF configuration
import '@/utils/pdf-config';

// Status configuration for reusability
const STATUS_CONFIG = {
    draft: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
    rejected: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
    submitted: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
    approved: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
    're-scanned approved': { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
    default: { bg: 'bg-gray-200', text: 'text-gray-800', dot: 'bg-gray-500' },
};

const ReviewDocumentCard = React.memo(({ document, refetch }) => {
    const {
        id,
        fileName,
        filePath,
        patientMRN,
        status,
        scannedAt,
        comment,
        employeeId,
        uploadedAt,
        scanner,
        uploader,
        reviewedAt,
        approver,
    } = document;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
    const [rejectComment, setRejectComment] = useState('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { showError, showSuccess } = useToastError();
    const queryClient = useQueryClient();
    const isPdf = filePath?.toLowerCase().endsWith('.pdf');

    // Handle overlay click to close preview
    const handleOverlayClick = useCallback((e) => {
        if (e.target === e.currentTarget) setIsPreviewOpen(false);
    }, []);

    // Handle escape key for closing preview and dialogs
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setIsPreviewOpen(false);
                setIsDialogOpen(false);
                setIsInfoDialogOpen(false);
            }
        };
        if (isPreviewOpen || isDialogOpen || isInfoDialogOpen) {
            window.addEventListener('keydown', handleEscape);
        }
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isPreviewOpen, isDialogOpen, isInfoDialogOpen]);

    // Handle PDF/image load success
    const onLoadSuccess = useCallback(() => {
        setIsLoading(false);
    }, []);

    // Handle PDF/image load error
    const onLoadError = useCallback(
        (error) => {
            setIsLoading(false);
            showError('Failed to load document preview');
            console.error(error);
        },
        [showError]
    );

    // Approve mutation
    const approveMutation = useMutation({
        mutationFn: () => approveDocument(document.id),
        onSuccess: () => {
            showSuccess(`${fileName} approved successfully.`);
            queryClient.invalidateQueries(['approver-scanned-docs']);
            refetch?.();
        },
        onError: (error) => {
            showError(`Failed to approve document: ${error.message}`);
            console.error(error);
        },
    });

    // Reject mutation
    const rejectMutation = useMutation({
        mutationFn: () => rejectDocument(document.id, { rejectComment }),
        onSuccess: () => {
            showSuccess(`${fileName} rejected successfully.`);
            setIsDialogOpen(false);
            setRejectComment('');
            queryClient.invalidateQueries(['approver-scanned-docs']);
            refetch?.();
        },
        onError: (error) => {
            showError(`Failed to reject document: ${error.message}`);
            setIsDialogOpen(false);
            console.error(error);
        },
    });

    // Handle approve action
    const handleApprove = useCallback(() => {
        approveMutation.mutate();
    }, [approveMutation]);

    // Handle reject action
    const handleReject = useCallback(() => {
        if (!rejectComment.trim()) {
            showError('Please provide a reason for rejection');
            return;
        }
        rejectMutation.mutate();
    }, [rejectComment, rejectMutation, showError]);

    // Get status styles
    const statusStyles = STATUS_CONFIG[status] || STATUS_CONFIG.default;

    return (
        <Card className="w-full max-w-sm relative shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-blue-500" aria-hidden="true" />
                    <span className="truncate" title={fileName}>
                        {fileName}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
                <div className="space-y-3">
                    {/* Preview Section */}
                    <div className="relative w-full h-48 overflow-hidden rounded-lg mb-2 border border-gray-200">
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                                <span className="ml-2 text-gray-500">Loading...</span>
                            </div>
                        )}
                        {isPdf ? (
                            <Document
                                file={getStaticUrl(filePath)}
                                onLoadSuccess={onLoadSuccess}
                                onLoadError={onLoadError}
                                loading={null}
                            >
                                <Page
                                    pageNumber={1}
                                    width={300}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    className="w-full h-full object-cover"
                                />
                            </Document>
                        ) : (
                            <img
                                src={getStaticUrl(filePath)}
                                alt={fileName}
                                className="w-full h-48 object-cover rounded-lg"
                                onLoad={onLoadSuccess}
                                onError={onLoadError}
                            />
                        )}
                    </div>

                    {/* Document Info */}
                    <div className="space-y-1.5 text-sm text-gray-600">
                        <p>
                            <span className="font-medium">Patient MRN:</span>{' '}
                            <span className="font-mono">{patientMRN}</span>
                        </p>
                        <p className="flex items-center gap-2">
                            <span className="font-medium">Status:</span>
                            <span
                                className={cn(
                                    'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                                    statusStyles.bg,
                                    statusStyles.text
                                )}
                            >
                                <span className={cn('w-2 h-2 rounded-full', statusStyles.dot)}></span>
                                {status}
                            </span>
                        </p>
                        <p>
                            <span className="font-medium">Scanned At:</span>{' '}
                            {new Date(scannedAt).toLocaleString()}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        <Button
                            variant="outline"
                            className="h-10"
                            onClick={() => setIsPreviewOpen(true)}
                            aria-label={`Preview ${fileName}`}
                        >
                            Preview
                        </Button>

                        <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="h-10"
                                    aria-label={`View details for ${fileName}`}
                                >
                                    <Info className="h-4 w-4 mr-2" /> Info
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="text-lg font-semibold">
                                        Document Details
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 text-sm text-gray-600">
                                    <div>
                                        <h4 className="font-medium text-gray-800 border-b pb-1 mb-2">
                                            General
                                        </h4>
                                        <p>
                                            <span className="font-medium">Document ID:</span>{' '}
                                            <span className="font-mono">{id}</span>
                                        </p>
                                        <p>
                                            <span className="font-medium">File Name:</span>{' '}
                                            <span className="truncate" title={fileName}>
                                                {fileName}
                                            </span>
                                        </p>
                                        <p>
                                            <span className="font-medium">Patient MRN:</span>{' '}
                                            <span className="font-mono">{patientMRN}</span>
                                        </p>
                                    </div>
                                    {comment && (
                                        <div>
                                            <h4 className="font-medium text-gray-800 border-b pb-1 mb-2">
                                                Comments
                                            </h4>
                                            <p className="text-gray-700">{comment}</p>
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="font-medium text-gray-800 border-b pb-1 mb-2">
                                            Scanner Details
                                        </h4>
                                        <p>
                                            <span className="font-medium">Employee ID:</span>{' '}
                                            <span className="font-mono">{employeeId}</span>
                                        </p>
                                        <p>
                                            <span className="font-medium">Name:</span>{' '}
                                            {scanner?.fullName || 'N/A'}
                                        </p>
                                        <p>
                                            <span className="font-medium">Department:</span>{' '}
                                            {scanner?.department || 'N/A'}
                                        </p>
                                        <p>
                                            <span className="font-medium">Email:</span>{' '}
                                            <a
                                                href={`mailto:${scanner?.email}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {scanner?.email || 'N/A'}
                                            </a>
                                        </p>
                                        <p>
                                            <span className="font-medium">Scanned At:</span>{' '}
                                            {new Date(scannedAt).toLocaleString()}
                                        </p>
                                    </div>
                                    {uploader && (
                                        <div>
                                            <h4 className="font-medium text-gray-800 border-b pb-1 mb-2">
                                                Uploader Details
                                            </h4>
                                            <p>
                                                <span className="font-medium">Employee ID:</span>{' '}
                                                <span className="font-mono">{uploader.employeeId || 'N/A'}</span>
                                            </p>
                                            <p>
                                                <span className="font-medium">Name:</span>{' '}
                                                {uploader.fullName || 'N/A'}
                                            </p>
                                            <p>
                                                <span className="font-medium">Department:</span>{' '}
                                                {uploader.department || 'N/A'}
                                            </p>
                                            <p>
                                                <span className="font-medium">Email:</span>{' '}
                                                <a
                                                    href={`mailto:${uploader.email}`}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {uploader.email || 'N/A'}
                                                </a>
                                            </p>
                                            {uploadedAt && (
                                                <p>
                                                    <span className="font-medium">Uploaded At:</span>{' '}
                                                    {new Date(uploadedAt).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    {approver && (
                                        <div>
                                            <h4 className="font-medium text-gray-800 border-b pb-1 mb-2">
                                                Approver Details
                                            </h4>
                                            <p>
                                                <span className="font-medium">Employee ID:</span>{' '}
                                                <span className="font-mono">{approver.employeeId || 'N/A'}</span>
                                            </p>
                                            <p>
                                                <span className="font-medium">Name:</span>{' '}
                                                {approver.fullName || 'N/A'}
                                            </p>
                                            <p>
                                                <span className="font-medium">Department:</span>{' '}
                                                {approver.department || 'N/A'}
                                            </p>
                                            <p>
                                                <span className="font-medium">Email:</span>{' '}
                                                <a
                                                    href={`mailto:${approver.email}`}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {approver.email || 'N/A'}
                                                </a>
                                            </p>
                                            {reviewedAt && (
                                                <p>
                                                    <span className="font-medium">Reviewed At:</span>{' '}
                                                    {new Date(reviewedAt).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Approve/Reject Buttons */}
                    {status === 'submitted' && (
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <Button
                                onClick={handleApprove}
                                disabled={approveMutation.isPending || rejectMutation.isPending}
                                className="h-10 bg-green-600 hover:bg-green-700 text-white"
                                aria-label={`Approve ${fileName}`}
                            >
                                {approveMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Approving...
                                    </>
                                ) : (
                                    'Approve'
                                )}
                            </Button>
                            <Button
                                onClick={() => setIsDialogOpen(true)}
                                disabled={approveMutation.isPending || rejectMutation.isPending}
                                variant="destructive"
                                className="h-10"
                                aria-label={`Reject ${fileName}`}
                            >
                                {rejectMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Rejecting...
                                    </>
                                ) : (
                                    'Reject'
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>

            {/* Preview Modal */}
            {isPreviewOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                    onClick={handleOverlayClick}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Preview ${fileName}`}
                >
                    <div className="relative w-[90vw] md:w-[60vw] h-[90vh] overflow-auto bg-white rounded-lg shadow-xl">
                        <button
                            className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 transition-colors"
                            onClick={() => setIsPreviewOpen(false)}
                            aria-label="Close preview"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                        <Preview filePath={getStaticUrl(filePath)} />
                    </div>
                </div>
            )}

            {/* Reject Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reject Document: {fileName}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <Input
                            value={rejectComment}
                            onChange={(e) => setRejectComment(e.target.value)}
                            placeholder="Enter reason for rejection"
                            className="w-full"
                            aria-label="Reason for rejection"
                        />
                        {!rejectComment.trim() && (
                            <p className="text-sm text-red-500">Please provide a reason for rejection</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setIsDialogOpen(false)}
                            disabled={rejectMutation.isPending}
                            aria-label="Cancel rejection"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReject}
                            disabled={rejectMutation.isPending || !rejectComment.trim()}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            aria-label="Submit rejection"
                        >
                            {rejectMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Rejection'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
});

export default ReviewDocumentCard;