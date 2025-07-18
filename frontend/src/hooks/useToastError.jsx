import { toast } from 'sonner';

const useToastError = () => {
    const showError = (error, defaultMessage) => {
        toast.error(error?.response?.data?.message || defaultMessage, {
            duration: 5000,
            style: {
                background: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #ef4444',
            },
        });
    };

    const showSuccess = (message) => {
        toast.success(message, {
            duration: 4000,
            style: {
                background: '#d1fae5',
                color: '#065f46',
                border: '1px solid #10b981',
            },
        });
    };

    return { showError, showSuccess };
};

export default useToastError;