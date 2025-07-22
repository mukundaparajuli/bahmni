import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Trash2 } from "lucide-react";
import { getStaticUrl } from "@/utils/get-static-url";
import { Document, Page, pdfjs } from "react-pdf";
import Preview from "./Preview";

// Set the worker source for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

const ScannedDocumentCard = ({ document, deleteButton, onDelete }) => {
    const { fileName, filePath, patientMRN, status, scannedAt } = document;
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
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">Status:</span> {status}
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
            </CardContent>
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