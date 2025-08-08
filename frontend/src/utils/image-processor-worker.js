export const createImageProcessorWorker = () => {
    const workerCode = `
    self.onmessage = function(e) {
      const { imageData, quality, maxWidth, index } = e.data;
      
      try {
        const canvas = new OffscreenCanvas(maxWidth, Math.round(maxWidth * (297/210)));
        const ctx = canvas.getContext('2d');
        
        const img = new Image();
        img.onload = function() {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          canvas.convertToBlob({ type: 'image/jpeg', quality: quality })
            .then(blob => {
              const reader = new FileReader();
              reader.onload = () => {
                self.postMessage({
                  index,
                  result: reader.result,
                  size: blob.size,
                  success: true
                });
              };
              reader.onerror = () => {
                self.postMessage({
                  index,
                  error: 'Failed to read processed image',
                  success: false
                });
              };
              reader.readAsDataURL(blob);
            })
            .catch(error => {
              self.postMessage({
                index,
                error: error.message,
                success: false
              });
            });
        };
        img.onerror = function() {
          self.postMessage({
            index,
            error: 'Failed to load image',
            success: false
          });
        };
        img.src = imageData;
      } catch (error) {
        self.postMessage({
          index,
          error: error.message,
          success: false
        });
      }
    };
  `;

    return new Worker(URL.createObjectURL(new Blob([workerCode], { type: 'application/javascript' })));
};

export const calculateOptimalQuality = (imageCount) => {
    if (imageCount > 30) return 0.60;
    if (imageCount > 20) return 0.70;
    if (imageCount > 12) return 0.75;
    if (imageCount > 6) return 0.82;
    return 0.88;
};

export const calculateOptimalWidth = (imageCount) => {
    if (imageCount > 30) return 900;
    if (imageCount > 20) return 1100;
    if (imageCount > 12) return 1300;
    if (imageCount > 6) return 1500;
    return 1700;
};

export const estimatePdfSize = (imageCount, calculateOptimalQuality, calculateOptimalWidth) => {
    const baseOverheadMB = 0.5;
    const quality = calculateOptimalQuality(imageCount);
    const width = calculateOptimalWidth(imageCount);
    const height = width * (297 / 210);

    // Rough JPEG size estimation
    const avgImageSizeMB = (width * height * 3 * quality * 0.8) / (1024 * 1024);
    return baseOverheadMB + (imageCount * avgImageSizeMB);
};

export const processImageOptimized = async (imgSrc, index, totalImages, imageWorker) => {
    return new Promise((resolve) => {
        const quality = calculateOptimalQuality(totalImages);
        const maxWidth = calculateOptimalWidth(totalImages);

        if (imageWorker) {
            const handleWorkerMessage = (e) => {
                if (e.data.index === index) {
                    imageWorker.removeEventListener('message', handleWorkerMessage);
                    if (e.data.success) {
                        resolve({
                            imgSrc: e.data.result,
                            actualSize: e.data.size,
                            index
                        });
                    } else {
                        console.warn(`Worker failed for image ${index}, falling back to main thread:`, e.data.error);
                        processImageMainThread(imgSrc, index, quality, maxWidth).then(resolve);
                    }
                }
            };

            imageWorker.addEventListener('message', handleWorkerMessage);
            imageWorker.postMessage({
                imageData: imgSrc,
                quality,
                maxWidth,
                index
            });
        } else {
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                    processImageMainThread(imgSrc, index, quality, maxWidth).then(resolve);
                });
            } else {
                setTimeout(() => {
                    processImageMainThread(imgSrc, index, quality, maxWidth).then(resolve);
                }, 0);
            }
        }
    });
};

const processImageMainThread = async (imgSrc, index, quality, maxWidth) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            if ('createImageBitmap' in window) {
                createImageBitmap(img).then((bitmap) => {
                    processWithImageBitmap(bitmap, index, quality, maxWidth, resolve);
                }).catch(() => {
                    processWithCanvas(img, index, quality, maxWidth, resolve);
                });
            } else {
                processWithCanvas(img, index, quality, maxWidth, resolve);
            }
        };
        img.onerror = () => {
            resolve({
                imgSrc: imgSrc,
                actualSize: 0,
                index,
                error: 'Failed to process image'
            });
        };
        img.src = imgSrc;
    });
};

const processWithImageBitmap = (bitmap, index, quality, maxWidth, resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = maxWidth;
    canvas.height = Math.round(maxWidth * (297 / 210));

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
        if (blob) {
            const reader = new FileReader();
            reader.onload = () => {
                resolve({
                    imgSrc: reader.result,
                    actualSize: blob.size,
                    index
                });
            };
            reader.readAsDataURL(blob);
        } else {
            resolve({
                imgSrc: canvas.toDataURL('image/jpeg', quality),
                actualSize: 0,
                index
            });
        }

        bitmap.close();
        canvas.width = 0;
        canvas.height = 0;
    }, 'image/jpeg', quality);
};

const processWithCanvas = (img, index, quality, maxWidth, resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = maxWidth;
    canvas.height = Math.round(maxWidth * (297 / 210));

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
        if (blob) {
            const reader = new FileReader();
            reader.onload = () => {
                resolve({
                    imgSrc: reader.result,
                    actualSize: blob.size,
                    index
                });
                canvas.width = 0;
                canvas.height = 0;
            };
            reader.readAsDataURL(blob);
        } else {
            resolve({
                imgSrc: canvas.toDataURL('image/jpeg', quality),
                actualSize: 0,
                index
            });
            canvas.width = 0;
            canvas.height = 0;
        }
    }, 'image/jpeg', quality);
};

export const processImagesInBatches = async (images, batchSize = 3, imageWorker, setProcessingProgress, setProcessingStep) => {
    const results = [];
    const totalBatches = Math.ceil(images.length / batchSize);

    for (let i = 0; i < totalBatches; i++) {
        const batch = images.slice(i * batchSize, (i + 1) * batchSize);
        const batchPromises = batch.map((imgSrc, batchIndex) =>
            processImageOptimized(imgSrc, i * batchSize + batchIndex, images.length, imageWorker)
        );

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        const progress = ((i + 1) / totalBatches) * 50;
        setProcessingProgress(progress);
        setProcessingStep(`Processing images: batch ${i + 1}/${totalBatches}`);

        if (i < totalBatches - 1) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }

    return results;
};