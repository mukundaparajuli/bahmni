

export const getStaticUrl = (path) => {
    if (!path || typeof path !== 'string' || path.trim() === '') {
        return '';
    }
    const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api$/, '');
    const staticUrl = path.startsWith('http') ? path : `${baseUrl}${path}`;
    return staticUrl;
};