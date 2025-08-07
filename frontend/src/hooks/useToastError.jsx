import { toast } from 'sonner';

const useToastError = () => {
    // Map technical error messages to user-friendly messages
    const getFormalErrorMessage = (error, defaultMessage) => {
        // If we have a specific default message, use it
        if (defaultMessage) {
            return defaultMessage;
        }

        // Handle server response errors
        if (error?.response?.data?.message) {
            const serverMessage = error.response.data.message;
            
            // Map common server error messages to formal user-friendly messages
            const errorMappings = {
                'Invalid credentials': 'The email or password you entered is incorrect. Please try again.',
                'User not found': 'No account found with the provided email address.',
                'Email already exists': 'An account with this email address already exists.',
                'Invalid email': 'Please enter a valid email address.',
                'Password too short': 'Password must be at least 6 characters long.',
                'Unauthorized': 'You are not authorized to perform this action. Please log in again.',
                'Forbidden': 'You do not have permission to access this resource.',
                'Not found': 'The requested resource was not found.',
                'Validation failed': 'Please check your input and try again.',
                'File too large': 'The file size exceeds the maximum allowed limit.',
                'Invalid file type': 'The file type is not supported. Please use a different file.',
                'Network error': 'Unable to connect to the server. Please check your internet connection.',
                'Server error': 'An unexpected error occurred. Please try again later.',
                'Timeout': 'The request took too long to complete. Please try again.',
                'Too many requests': 'Too many requests. Please wait a moment before trying again.'
            };

            return errorMappings[serverMessage] || serverMessage;
        }

        // Handle network errors
        if (error?.message) {
            const errorMessage = error.message.toLowerCase();
            
            if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
                return 'Unable to connect to the server. Please check your internet connection and try again.';
            }
            
            if (errorMessage.includes('timeout')) {
                return 'The request took too long to complete. Please try again.';
            }
            
            if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
                return 'Your session has expired. Please log in again.';
            }
            
            if (errorMessage.includes('forbidden') || errorMessage.includes('403')) {
                return 'You do not have permission to perform this action.';
            }
            
            if (errorMessage.includes('not found') || errorMessage.includes('404')) {
                return 'The requested resource was not found.';
            }
            
            if (errorMessage.includes('server error') || errorMessage.includes('500')) {
                return 'An unexpected error occurred on the server. Please try again later.';
            }
        }

        // Default fallback message
        return 'An unexpected error occurred. Please try again.';
    };

    const showError = (error, defaultMessage) => {
        const formalMessage = getFormalErrorMessage(error, defaultMessage);
        
        toast.error(formalMessage, {
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