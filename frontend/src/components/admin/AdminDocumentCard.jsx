import { getStaticUrl } from '@/utils/get-static-url'
import { ActivityIcon, FileText, Info, Loader2, RefreshCw, Upload, Replace, Trash2, MoreVertical } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { Document, Page } from 'react-pdf'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu'
import Preview from '../Preview'
import useToastError from '@/hooks/useToastError'
import { cn } from '@/lib/utils'
import { getFileSizeFromUrl } from '@/utils/get-file-size'
import { useNavigate } from 'react-router-dom'

const STATUS_CONFIG = {
    draft: { bg: "bg-yellow-100", text: "text-yellow-800", dot: "bg-yellow-500" },
    rejected: { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500" },
    submitted: { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500" },
    approved: { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500" },
    "re-scanned approved": {
        bg: "bg-purple-100",
        text: "text-purple-800",
        dot: "bg-purple-500",
    },
    default: { bg: "bg-gray-200", text: "text-gray-800", dot: "bg-gray-500" },
};

const AdminDocumentCard = ({
    document,
    onRescan,
    onUpload,
    onReplace,
    onRemove,
    permissions = {
        canRescan: true,
        canUpload: true,
        canReplace: true,
        canRemove: true
    }
}) => {
    const { showError, showSuccess } = useToastError();
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
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isPdf = filePath?.toLowerCase().endsWith(".pdf");
    const [fileSize, setFileSize] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);

    useEffect(() => {
        const fetchFileSize = async () => {
            if (!filePath) return;
            const size = await getFileSizeFromUrl(getStaticUrl(filePath));
            setFileSize(size);
        };
        fetchFileSize();
    }, [filePath]);

    const handleStatus = useCallback(async () => {
        setIsSubmitting(true);
        try {
            const newStatus = status === "draft" ? "submitted" : "rescanned";
            await updateStatus({ id, status: newStatus });
            showSuccess("Document submitted successfully");
        } catch (error) {
            showError("Could not update the document");
        } finally {
            setIsSubmitting(false);
        }
    }, [id, status, showSuccess, showError]);

    const handleRescan = useCallback(async () => {
        try {
            setIsSubmitting(true);
            await onRescan?.(document);
            showSuccess("Document rescanned successfully");
        } catch (error) {
            showError("Failed to rescan document");
        } finally {
            setIsSubmitting(false);
        }
    }, [document, onRescan, showSuccess, showError]);

    const handleUpload = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.jpg,.jpeg,.png';
        input.onchange = async (e) => {
            const file = e.target.files?.[0];
            if (file && onUpload) {
                try {
                    setIsSubmitting(true);
                    await onUpload(file, document);
                    showSuccess("Document uploaded successfully");
                } catch (error) {
                    showError("Failed to upload document");
                } finally {
                    setIsSubmitting(false);
                }
            }
        };
        input.click();
    }, [document, onUpload, showSuccess, showError]);

    const handleReplace = useCallback(() => {
        navigate("/admin/rescan", {
            state: { id, fileName, filePath, uploadedAt, status, patientMRN },
        });
    }, [id, fileName, filePath, uploadedAt, status, patientMRN, navigate]);

    const handleRemove = useCallback(async () => {
        if (window.confirm('Are you sure you want to remove this document? This action cannot be undone.')) {
            try {
                setIsSubmitting(true);
                await onRemove?.(document);
                showSuccess("Document removed successfully");
            } catch (error) {
                showError("Failed to remove document");
            } finally {
                setIsSubmitting(false);
            }
        }
    }, [document, onRemove, showSuccess, showError]);

    const handleOverlayClick = useCallback((e) => {
        if (e.target === e.currentTarget) {
            setIsPreviewOpen(false);
        }
    }, []);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") {
                setIsPreviewOpen(false);
                setIsInfoDialogOpen(false);
            }
        };
        if (isPreviewOpen || isInfoDialogOpen) {
            window.addEventListener("keydown", handleEscape);
        }
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isPreviewOpen, isInfoDialogOpen]);

    const statusStyles = STATUS_CONFIG[status] || STATUS_CONFIG.default;

    const onLoadSuccess = useCallback(() => {
        setIsLoading(false);
    }, []);

    const onLoadError = useCallback(
        (error) => {
            setIsLoading(false);
            showError("Failed to load document preview");
            console.error(error);
        },
        [showError]
    );

    return (
        <div className="w-full max-w-md bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 relative">
            {/* Header with Actions */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" aria-hidden="true" />
                    <h2
                        className="text-lg font-semibold text-gray-900 truncate"
                        title={`${patientMRN}_${fileName}`}
                    >
                        {patientMRN}_{fileName}
                    </h2>
                </div>

                {/* Management Actions Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            disabled={isSubmitting}
                        >
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        {permissions.canRescan && (
                            <DropdownMenuItem
                                onClick={handleRescan}
                                disabled={isSubmitting}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Rescan Document
                            </DropdownMenuItem>
                        )}
                        {permissions.canUpload && (
                            <DropdownMenuItem
                                onClick={handleUpload}
                                disabled={isSubmitting}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Document
                            </DropdownMenuItem>
                        )}
                        {permissions.canReplace && (
                            <DropdownMenuItem
                                onClick={handleReplace}
                                disabled={isSubmitting}
                            >
                                <Replace className="h-4 w-4 mr-2" />
                                Replace Document
                            </DropdownMenuItem>
                        )}

                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Content */}
            <div className="space-y-4">
                {/* Preview Section */}
                <div className="relative w-full h-48 rounded-md overflow-hidden border border-gray-200">
                    {(isLoading || isSubmitting) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                            <span className="ml-2 text-gray-500 text-sm">
                                {isSubmitting ? "Processing..." : "Loading..."}
                            </span>
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
                <div className="space-y-2 text-sm text-gray-600 overflow-hidden">
                    <p>
                        <span className="font-medium">File Size:</span>{" "}
                        {fileSize !== null ? `${fileSize.toFixed(2)} MB` : "Loading..."}
                    </p>
                    <p>
                        <span className="font-medium">Patient MRN:</span>{" "}
                        <span className="font-mono">{patientMRN}</span>
                    </p>
                    <p>
                        <span className="font-medium">File Name:</span>{" "}
                        <span className="font-mono truncate" title={`${patientMRN}_${fileName}`}>
                            {patientMRN}_{fileName}
                        </span>
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
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        variant="outline"
                        className="h-9 text-sm"
                        onClick={() => setIsPreviewOpen(true)}
                        aria-label={`Preview ${fileName}`}
                        disabled={isSubmitting}
                    >
                        Preview
                    </Button>
                    <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="h-9 text-sm"
                                aria-label={`View details for ${fileName}`}
                                disabled={isSubmitting}
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
                                        <span className="font-medium">Document ID:</span>{" "}
                                        <span className="font-mono">{id}</span>
                                    </p>
                                    <p>
                                        <span className="font-medium">File Name:</span>{" "}
                                        <span className="truncate" title={fileName}>
                                            {patientMRN}_{fileName}
                                        </span>
                                    </p>
                                    <p>
                                        <span className="font-medium">Patient MRN:</span>{" "}
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
                                        <span className="font-medium">Employee ID:</span>{" "}
                                        <span className="font-mono">{employeeId}</span>
                                    </p>
                                    <p>
                                        <span className="font-medium">Name:</span>{" "}
                                        {scanner?.fullName || "N/A"}
                                    </p>
                                    <p>
                                        <span className="font-medium">Department:</span>{" "}
                                        {scanner?.department?.name || "N/A"}
                                    </p>
                                    <p>
                                        <span className="font-medium">Email:</span>{" "}
                                        <a
                                            href={`mailto:${scanner?.email}`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {scanner?.email || "N/A"}
                                        </a>
                                    </p>
                                    <p>
                                        <span className="font-medium">Scanned At:</span>{" "}
                                        {new Date(scannedAt).toLocaleString()}
                                    </p>
                                </div>
                                {uploader && (
                                    <div>
                                        <h4 className="font-medium text-gray-800 border-b pb-1 mb-2">
                                            Uploader Details
                                        </h4>
                                        <p>
                                            <span className="font-medium">Employee ID:</span>{" "}
                                            <span className="font-mono">{uploader.employeeId || "N/A"}</span>
                                        </p>
                                        <p>
                                            <span className="font-medium">Name:</span>{" "}
                                            {uploader.fullName || "N/A"}
                                        </p>
                                        <p>
                                            <span className="font-medium">Department:</span>{" "}
                                            {uploader.department?.name || "N/A"}
                                        </p>
                                        <p>
                                            <span className="font-medium">Email:</span>{" "}
                                            <a
                                                href={`mailto:${uploader.email}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {uploader.email || "N/A"}
                                            </a>
                                        </p>
                                        {uploadedAt && (
                                            <p>
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
                                        <p>
                                            <span className="font-medium">Employee ID:</span>{" "}
                                            <span className="font-mono">{approver.employeeId || "N/A"}</span>
                                        </p>
                                        <p>
                                            <span className="font-medium">Name:</span>{" "}
                                            {approver.fullName || "N/A"}
                                        </p>
                                        <p>
                                            <span className="font-medium">Department:</span>{" "}
                                            {approver.department?.name || "N/A"}
                                        </p>
                                        <p>
                                            <span className="font-medium">Email:</span>{" "}
                                            <a
                                                href={`mailto:${approver.email}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {approver.email || "N/A"}
                                            </a>
                                        </p>
                                        {reviewedAt && (
                                            <p>
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
            </div>

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
                            className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 transition-colors z-10"
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
        </div>
    )
}

export default AdminDocumentCard