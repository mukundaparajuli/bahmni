import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AuthLayout = ({ children, title }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-lg mx-auto shadow-lg">
                <CardHeader className="bg-gray-50 border-b">
                    <CardTitle className="text-2xl font-bold text-center text-gray-800">
                        Bahmni Scanner
                    </CardTitle>
                    {title && (
                        <h2 className="text-xl font-semibold text-center text-gray-700 mt-2">
                            {title}
                        </h2>
                    )}
                </CardHeader>
                <CardContent className="p-6">
                    {children}
                </CardContent>
            </Card>
        </div>
    );
};

export default AuthLayout;