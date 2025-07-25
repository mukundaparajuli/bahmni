import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Trash2 } from "lucide-react";
import { getStaticUrl } from "@/utils/get-static-url";
import { Document, Page, pdfjs } from "react-pdf";
import PDFPreviewerIframe from "./pdf_show/Document";
import { useNavigate } from "react-router-dom";
import { updateStatus } from "@/api/scanner-api";
import Preview from "./Preview";

// Set the worker source for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

const ScannedDocumentCard = ({ document, deleteButton, onDelete }) => {
    const {
        id,
        fileName,
        filePath,
        patientMRN,
        status,
        scannedAt,
        comment,
        employeeId,
        uploadedAt
    } = document;

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const navigate = useNavigate();
    const isPdf = filePath?.toLowerCase().endsWith(".pdf");

    const handleRescanOrResubmit = () => {
        navigate("/rescan", {
            state: { id, fileName, filePath, uploadedAt },
        });
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) setIsPreviewOpen(false);
    };

    const handleStatus = async () => {
        try {
            await updateStatus(id);
            alert("Document submitted successfully");
        } catch (error) {
            console.error(error);
            alert("Could not update the document");
        }
    };

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") setIsPreviewOpen(false);
        };
        if (isPreviewOpen) window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isPreviewOpen]);

    return (
        <Card className="w-full max-w-md relative">
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

                    {/* ✅ Status with color badge */}
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="font-medium">Status:</span>
                        <span
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                ${status === "draft"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : status === "rejected"
                                        ? "bg-red-100 text-red-800"
                                        : status === "submitted"
                                            ? "bg-green-100 text-green-800"
                                            : status === "approved"
                                                ? "bg-blue-100 text-blue-800"
                                                : "bg-gray-200 text-gray-800"
                                }`}
                        >
                            <span
                                className={`w-2 h-2 rounded-full
                  ${status === "draft"
                                        ? "bg-yellow-500"
                                        : status === "rejected"
                                            ? "bg-red-500"
                                            : status === "submitted"
                                                ? "bg-green-500"
                                                : status === "approved"
                                                    ? "bg-blue-500"
                                                    : "bg-gray-500"
                                    }`}
                            ></span>
                            {status}
                        </span>

                        {(status === "draft" || status === "rejected") && (
                            <button
                                className="underline text-gray-600 hover:text-gray-800 text-sm ml-2"
                                onClick={handleRescanOrResubmit}
                            >
                                Rescan or Resubmit
                            </button>
                        )}
                    </p>

                    {status === "draft" && (
                        <Button
                            onClick={handleStatus}
                            className="mt-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Submit Document
                        </Button>
                    )}

                    <p className="text-sm text-gray-600">
                        <span className="font-medium">Comments:</span> {comment}
                    </p>
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">Employee ID:</span> {employeeId}
                    </p>
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">Scanned At:</span>{" "}
                        {new Date(scannedAt).toLocaleString()}
                    </p>
                </div>

                <div className="mt-4">
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setIsPreviewOpen(true)}
                    >
                        Preview Document
                    </Button>
                </div>

            </CardContent>
            {isPreviewOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                    onClick={handleOverlayClick}
                >
                    <div className="relative flex justify-center items-center w-[60vw] h-[90vh] overflow-auto">
                        <Preview filePath={getStaticUrl(filePath)} />
                    </div>
                </div>
            )}

            {deleteButton && (
                <Button
                    variant="destructive"
                    size="icon"
                    onClick={onDelete}
                    title="Delete Document"
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
        </Card>
    );
};

export default ScannedDocumentCard;
