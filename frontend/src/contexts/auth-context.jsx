import { createContext, useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login } from '@/api';
import { useNavigate } from 'react-router-dom';
import useToastError from '@/hooks/useToastError';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showError } = useToastError();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

    const loginMutation = useMutation({
        mutationFn: login,
        onSuccess: ({ data }) => {
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            setUser(data.data.user);
            navigate('/');
        },
        onError: (error) => showError(error, 'Login could not be completed. Please check your credentials and try again.'),
    });

    const logoutMutation = useMutation({
        mutationFn: () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            queryClient.clear();
            window.location.href = '/login';
        },
    });

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                login: loginMutation.mutate,
                logout: logoutMutation.mutate,
                isLoading: loginMutation.isLoading || logoutMutation.isLoading,
                error: loginMutation.error || logoutMutation.error,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};