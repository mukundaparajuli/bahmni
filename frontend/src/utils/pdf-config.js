import { pdfjs } from 'react-pdf';

// Centralized PDF.js worker configuration
// This ensures all components use the same worker configuration
export const configurePDFWorker = () => {
  // Only configure if not already configured
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.js",
      import.meta.url
    ).toString();
    
    console.log('PDF.js worker configured:', pdfjs.GlobalWorkerOptions.workerSrc);
  }
};

// Auto-configure when this module is imported
configurePDFWorker();