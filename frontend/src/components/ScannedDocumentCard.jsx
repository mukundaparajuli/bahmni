import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, Trash2, Info, Loader2 } from "lucide-react";
import { getStaticUrl } from "@/utils/get-static-url";
import { Document, Page } from "react-pdf";
import { useNavigate } from "react-router-dom";
import { updateStatus } from "@/api/scanner-api";
import Preview from "./Preview";
import { cn } from "@/lib/utils";
import useToastError from "@/hooks/useToastError";

// Import centralized PDF configuration
import "@/utils/pdf-config";
import { getFileSizeFromUrl } from "@/utils/get-file-size";

// Status configuration for reusability
const STATUS_CONFIG = {
    draft: { bg: "bg-yellow-100", text: "text-yellow-800", dot: "bg-yellow-500" },
    rejected: { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500" },
    submitted: { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500" },
    approved: { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500" },
    're-scanned approved': { bg: "bg-purple-100", text: "text-purple-800", dot: "bg-purple-500" },
    default: { bg: "bg-gray-200", text: "text-gray-800", dot: "bg-gray-500" },
};


const ScannedDocumentCard = React.memo(
    ({ document, deleteButton, onDelete, isScanner, isApprover }) => {
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

        const [isPreviewOpen, setIsPreviewOpen] = useState(false);
        const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
        const [isLoading, setIsLoading] = useState(true);
        const [isSubmitting, setIsSubmitting] = useState(false);
        const navigate = useNavigate();
        const isPdf = filePath?.toLowerCase().endsWith(".pdf");

        const [fileSize, setFileSize] = useState(null);

        useEffect(() => {
            const fetchFileSize = async () => {
                if (!filePath) return;
                const size = await getFileSizeFromUrl(getStaticUrl(filePath));
                setFileSize(size);
            };
            fetchFileSize();
        }, [filePath]);


        // Handle status update with loading state and toast notifications
        const handleStatus = useCallback(async () => {
            setIsSubmitting(true);
            try {
                await updateStatus(id);
                showSuccess("Document submitted successfully");
            } catch (error) {
                console.error(error);
                showError("Could not update the document");
            } finally {
                setIsSubmitting(false);
            }
        }, [id, showSuccess, showError]);

        // Handle rescan/resubmit navigation
        const handleRescanOrResubmit = useCallback(() => {
            navigate("/rescan", { state: { id, fileName, filePath, uploadedAt } });
        }, [id, fileName, filePath, uploadedAt, navigate]);

        // Handle preview overlay click
        const handleOverlayClick = useCallback((e) => {
            if (e.target === e.currentTarget) setIsPreviewOpen(false);
        }, []);

        // Handle escape key for closing preview and dialog
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

        // Handle PDF/image load success
        const onLoadSuccess = useCallback(() => {
            setIsLoading(false);
        }, []);

        // Handle PDF/image load error
        const onLoadError = useCallback((error) => {
            setIsLoading(false);
            showError("Failed to load document preview");
            console.error(error);
        }, [showError]);

        // Get status styles
        const statusStyles = STATUS_CONFIG[status] || STATUS_CONFIG.default;

        return (
            <Card className="w-full max-w-md relative shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg overflow-hidden">
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
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">File Size:</span>{" "}
                            {fileSize !== null ? `${(fileSize / 1024).toFixed(2)} KB` : "Loading..."}
                        </p>


                        {/* Basic Document Info */}
                        <div className="space-y-1.5 text-sm text-gray-600">
                            <p>
                                <span className="font-medium">Patient MRN:</span>{" "}
                                <span className="font-mono">{patientMRN}</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <span className="font-medium">Status:</span>
                                <span
                                    className={cn(
                                        "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                                        statusStyles.bg,
                                        statusStyles.text
                                    )}
                                >
                                    <span className={cn("w-2 h-2 rounded-full", statusStyles.dot)}></span>
                                    {status}
                                </span>
                                {(status === "draft" || status === "rejected") && (
                                    <button
                                        className="underline text-blue-600 hover:text-blue-800 text-sm ml-2 transition-colors"
                                        onClick={handleRescanOrResubmit}
                                        aria-label={`Rescan or resubmit ${fileName}`}
                                    >
                                        Rescan/Resubmit
                                    </button>
                                )}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <Button
                                variant="outline"
                                className="flex-1 h-10"
                                onClick={() => setIsPreviewOpen(true)}
                                aria-label={`Preview ${fileName}`}
                            >
                                Preview
                            </Button>
                            <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-10"
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
                                                <span className="font-medium">Document ID:</span>{" "}
                                                <span className="font-mono">{id}</span>
                                            </p>
                                            <p>
                                                <span className="font-medium">File Name:</span>{" "}
                                                <span className="truncate" title={fileName}>
                                                    {fileName}
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
                                                {scanner?.department || "N/A"}
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
                                                    {uploader.department || "N/A"}
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
                                                    {approver.department || "N/A"}
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

                        {isScanner && status === "draft" && (
                            <Button
                                onClick={handleStatus}
                                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white h-10"
                                aria-label="Submit document"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Submit Document"
                                )}
                            </Button>
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
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
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

                {/* Delete Button */}
                {deleteButton && (
                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={onDelete}
                        title="Delete Document"
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700"
                        aria-label={`Delete ${fileName}`}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </Card>
        );
    }
);

export default ScannedDocumentCard;