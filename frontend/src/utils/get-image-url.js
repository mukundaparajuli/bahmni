

export const getPhotoUrl = (user) => {
    if (!user?.photo || typeof user.photo !== 'string' || user.photo.trim() === '') {
        return '';
    }
    const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api$/, '');
    const photoUrl = user.photo.startsWith('http') ? user.photo : `${baseUrl}${user.photo}`;
    console.log('Navbar user.photo:', user?.photo, 'Resolved URL:', photoUrl);
    return photoUrl;
};