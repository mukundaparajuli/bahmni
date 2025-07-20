import { createContext, useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login } from '@/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const queryClient = useQueryClient();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

    const loginMutation = useMutation({
        mutationFn: login,
        onSuccess: ({ data }) => {
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            setUser(data.data.user);
        },
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