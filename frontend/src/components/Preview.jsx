import React from "react";
import PDFPreviewer from "./pdf_show/Document";

const Preview = ({ filePath }) => {
    console.log("Previewing file:", filePath);
    const isPdf = filePath?.toLowerCase().endsWith(".pdf");
    console.log("Is PDF:", isPdf);

    return (
        <div className="w-[60vw] h-[90vh] flex justify-center items-center">
            {isPdf ? (
                <PDFPreviewer filePath={filePath} />
            ) : (
                <img src={filePath} alt="Preview" className="max-w-full max-h-[80vh] object-contain" />
            )}
        </div>
    );
};

export default Preview;