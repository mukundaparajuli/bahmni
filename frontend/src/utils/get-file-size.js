export async function getFileSizeFromUrl(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        const size = response.headers.get('Content-Length');
        return size ? parseInt(size, 10) : null;
    } catch (error) {
        console.error('Error fetching file size:', error);
        return null;
    }
}