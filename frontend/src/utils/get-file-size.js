export async function getFileSizeFromUrl(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        const size = response.headers.get('Content-Length');
        if (size) {
            const bytes = parseInt(size, 10);
            const mb = bytes / (1024 * 1024); // convert bytes to MB
            return parseFloat(mb.toFixed(2));

        }
        return null;
    } catch (error) {
        console.error('Error fetching file size:', error);
        return null;
    }
}