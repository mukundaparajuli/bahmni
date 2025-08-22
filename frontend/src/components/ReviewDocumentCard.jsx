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
import { FileText, Info, Loader2 } from 'lucide-react';
import { getStaticUrl } from '@/utils/get-static-url';
import { Document, Page } from 'react-pdf';
import Preview from './Preview';
import { cn } from '@/lib/utils';
import useToastError from '@/hooks/useToastError';
import '@/utils/pdf-config';
import { getFileSizeFromUrl } from '@/utils/get-file-size';

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
    const [fileSize, setFileSize] = useState(null);

    useEffect(() => {
        const fetchFileSize = async () => {
            if (!filePath) return;
            const size = await getFileSizeFromUrl(getStaticUrl(filePath));
            setFileSize(size);
        };
        fetchFileSize();
    }, [filePath]);

    const handleOverlayClick = useCallback((e) => {
        if (e.target === e.currentTarget) setIsPreviewOpen(false);
    }, []);

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

    const onLoadSuccess = useCallback(() => {
        setIsLoading(false);
    }, []);

    const onLoadError = useCallback(
        (error) => {
            setIsLoading(false);
            showError('Failed to load document preview');
            console.error(error);
        },
        [showError]
    );

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

    const handleApprove = useCallback(() => {
        approveMutation.mutate();
    }, [approveMutation]);

    const handleReject = useCallback(() => {
        if (!rejectComment.trim()) {
            showError('Please provide a reason for rejection');
            return;
        }
        rejectMutation.mutate();
    }, [rejectComment, rejectMutation, showError]);

    const statusStyles = STATUS_CONFIG[status] || STATUS_CONFIG.default;

    return (
        <div className="w-full max-w-md bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" aria-hidden="true" />
                <h2
                    className="text-base font-semibold text-gray-900 truncate"
                    title={`${patientMRN}_${fileName}`}
                >
                    {patientMRN}_{fileName}
                </h2>
            </div>

            {/* Preview Section */}
            <div className="relative w-full h-48 rounded-md overflow-hidden border border-gray-200 mb-4 flex justify-center items-center">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                        <span className="ml-2 text-gray-500 text-sm">Loading...</span>
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
                        className="w-full h-48 object-cover rounded-md"
                        onLoad={onLoadSuccess}
                        onError={onLoadError}
                    />
                )}
            </div>

            {/* Document Info */}
            <div className="space-y-1 text-sm text-gray-600 overflow-hidden mb-4">
                <p className="truncate">
                    <span className="font-medium">File Size:</span>{" "}
                    {fileSize !== null ? `${fileSize.toFixed(2)} MB` : "Loading..."}
                </p>
                <p className="truncate">
                    <span className="font-medium">Patient MRN:</span>{" "}
                    <span className="font-mono">{patientMRN}</span>
                </p>
                <p className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">Status:</span>
                    <span
                        className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium capitalize",
                            statusStyles.bg,
                            statusStyles.text
                        )}
                    >
                        <span className={cn("w-2 h-2 rounded-full", statusStyles.dot)} />
                        {status}
                    </span>
                </p>
                <p className="truncate">
                    <span className="font-medium">Scanned At:</span>{" "}
                    {new Date(scannedAt).toLocaleString()}
                </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                <Button
                    variant="outline"
                    className="h-8 text-xs truncate"
                    onClick={() => setIsPreviewOpen(true)}
                    aria-label={`Preview ${fileName}`}
                >
                    Preview
                </Button>
                <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="h-8 text-xs truncate"
                            aria-label={`View details for ${fileName}`}
                        >
                            <Info className="h-3 w-3 mr-1 flex-shrink-0" /> Info
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
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
                                <p className="truncate">
                                    <span className="font-medium">Document ID:</span>{" "}
                                    <span className="font-mono">{id}</span>
                                </p>
                                <p className="truncate">
                                    <span className="font-medium">File Name:</span>{" "}
                                    <span className="truncate" title={fileName}>
                                        {patientMRN}_{fileName}
                                    </span>
                                </p>
                                <p className="truncate">
                                    <span className="font-medium">Patient MRN:</span>{" "}
                                    <span className="font-mono">{patientMRN}</span>
                                </p>
                            </div>
                            {comment && (
                                <div>
                                    <h4 className="font-medium text-gray-800 border-b pb-1 mb-2">
                                        Comments
                                    </h4>
                                    <p className="text-gray-700 break-words">{comment}</p>
                                </div>
                            )}
                            <div>
                                <h4 className="font-medium text-gray-800 border-b pb-1 mb-2">
                                    Scanner Details
                                </h4>
                                <p className="truncate">
                                    <span className="font-medium">Employee ID:</span>{" "}
                                    <span className="font-mono">{employeeId}</span>
                                </p>
                                <p className="truncate">
                                    <span className="font-medium">Name:</span>{" "}
                                    {scanner?.fullName || 'N/A'}
                                </p>
                                <p className="truncate">
                                    <span className="font-medium">Department:</span>{" "}
                                    {scanner?.department?.name || 'N/A'}
                                </p>
                                <p className="truncate">
                                    <span className="font-medium">Email:</span>{" "}
                                    <a
                                        href={`mailto:${scanner?.email}`}
                                        className="text-blue-600 hover:underline truncate"
                                    >
                                        {scanner?.email || 'N/A'}
                                    </a>
                                </p>
                                <p className="truncate">
                                    <span className="font-medium">Scanned At:</span>{" "}
                                    {new Date(scannedAt).toLocaleString()}
                                </p>
                            </div>
                            {uploader && (
                                <div>
                                    <h4 className="font-medium text-gray-800 border-b pb-1 mb-2">
                                        Uploader Details
                                    </h4>
                                    <p className="truncate">
                                        <span className="font-medium">Employee ID:</span>{" "}
                                        <span className="font-mono">{uploader.employeeId || 'N/A'}</span>
                                    </p>
                                    <p className="truncate">
                                        <span className="font-medium">Name:</span>{" "}
                                        {uploader.fullName || 'N/A'}
                                    </p>
                                    <p className="truncate">
                                        <span className="font-medium">Department:</span>{" "}
                                        {uploader.department?.name || 'N/A'}
                                    </p>
                                    <p className="truncate">
                                        <span className="font-medium">Email:</span>{" "}
                                        <a
                                            href={`mailto:${uploader.email}`}
                                            className="text-blue-600 hover:underline truncate"
                                        >
                                            {uploader.email || 'N/A'}
                                        </a>
                                    </p>
                                    {uploadedAt && (
                                        <p className="truncate">
                                            <span className="font-medium">Uploaded At:</span>{" "}
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
                                    <p className="truncate">
                                        <span className="font-medium">Employee ID:</span>{" "}
                                        <span className="font-mono">{approver.employeeId || 'N/A'}</span>
                                    </p>
                                    <p className="truncate">
                                        <span className="font-medium">Name:</span>{" "}
                                        {approver.fullName || 'N/A'}
                                    </p>
                                    <p className="truncate">
                                        <span className="font-medium">Department:</span>{" "}
                                        {uploader?.department?.name || 'N/A'}
                                    </p>
                                    <p className="truncate">
                                        <span className="font-medium">Email:</span>{" "}
                                        <a
                                            href={`mailto:${approver.email}`}
                                            className="text-blue-600 hover:underline truncate"
                                        >
                                            {approver.email || 'N/A'}
                                        </a>
                                    </p>
                                    {reviewedAt && (
                                        <p className="truncate">
                                            <span className="font-medium">Reviewed At:</span>{" "}
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
            {(status === 'submitted' || status === 'rescanned') && (
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        onClick={handleApprove}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                        className="h-8 bg-green-600 hover:bg-green-700 text-white text-xs truncate"
                        aria-label={`Approve ${fileName}`}
                    >
                        {approveMutation.isPending ? (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin mr-1 flex-shrink-0" />
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
                        className="h-8 text-xs truncate"
                        aria-label={`Reject ${fileName}`}
                    >
                        {rejectMutation.isPending ? (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin mr-1 flex-shrink-0" />
                                Rejecting...
                            </>
                        ) : (
                            'Reject'
                        )}
                    </Button>
                </div>
            )}

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
        </div>
    );
});

export default ReviewDocumentCard;