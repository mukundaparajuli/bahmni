import jsPDF from 'jspdf';

export const generatePDF = async (processedImages, setProcessingProgress, setProcessingStep) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
    });

    const A4_RATIO = 210 / 297;

    for (let i = 0; i < processedImages.length; i++) {
        if (i > 0) doc.addPage();

        const img = processedImages[i];
        const margin = 10;
        const maxWidth = 190;
        const maxHeight = 277;

        const imgRatio = img.width / img.height || A4_RATIO;
        const pageRatio = maxWidth / maxHeight;

        let finalWidth, finalHeight, x, y;

        if (imgRatio > pageRatio) {
            finalWidth = maxWidth;
            finalHeight = finalWidth / imgRatio;
            x = margin;
            y = (297 - finalHeight) / 2;
        } else {
            finalHeight = maxHeight;
            finalWidth = finalHeight * imgRatio;
            x = (210 - finalWidth) / 2;
            y = margin;
        }

        doc.addImage(
            img.imgSrc,
            'JPEG',
            x,
            y,
            finalWidth,
            finalHeight,
            `img_${i}`,
            'FAST'
        );

        const progress = 60 + ((i + 1) / processedImages.length) * 25;
        setProcessingProgress(progress);
        setProcessingStep(`Adding image ${i + 1}/${processedImages.length} to PDF...`);

        if (i % 3 === 0 && i > 0) {
            await new Promise(resolve => setTimeout(resolve, 5));
        }
    }

    setProcessingProgress(90);
    setProcessingStep('Finalizing PDF...');

    return doc.output('arraybuffer');
};

export const generateEmergencyPDF = async (images) => {
    return new Promise((resolve) => {
        const emergencyDoc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true,
        });

        const processImage = (imgSrc, index, callback) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                const maxWidth = 800;
                const maxHeight = Math.round(maxWidth * (297 / 210));

                canvas.width = maxWidth;
                canvas.height = maxHeight;

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'medium';
                ctx.drawImage(img, 0, 0, maxWidth, maxHeight);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const reader = new FileReader();
                        reader.onload = () => {
                            callback(reader.result);
                            canvas.width = 0;
                            canvas.height = 0;
                        };
                        reader.readAsDataURL(blob);
                    } else {
                        callback(canvas.toDataURL('image/jpeg', 0.5));
                        canvas.width = 0;
                        canvas.height = 0;
                    }
                }, 'image/jpeg', 0.5);
            };
            img.src = imgSrc;
        };

        let processedCount = 0;
        const emergencyImages = [];

        const processNextImage = (index) => {
            if (index >= images.length) {
                // All images processed, now create PDF
                emergencyImages.forEach((imgSrc, index) => {
                    if (index > 0) emergencyDoc.addPage();

                    const margin = 15;
                    const width = 180;
                    const height = 252;

                    emergencyDoc.addImage(
                        imgSrc,
                        'JPEG',
                        margin,
                        margin,
                        width,
                        height,
                        `emergency_img_${index}`,
                        'FAST'
                    );
                });

                resolve(emergencyDoc.output('arraybuffer'));
                return;
            }

            processImage(images[index], index, (result) => {
                emergencyImages.push(result);
                processNextImage(index + 1);
            });
        };

        processNextImage(0);
    });
};