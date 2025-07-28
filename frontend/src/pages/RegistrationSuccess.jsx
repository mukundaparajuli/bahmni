import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RegistrationSuccess = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white rounded shadow text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h1 className="text-2xl font-bold mb-4 text-gray-800">Registration Submitted Successfully</h1>
                <p className="text-gray-600 mb-6">
                    Your account is pending approval. You will be notified once it's activated.
                </p>
                <Link to="/login">
                    <Button className="w-full">
                        Go to Login
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default RegistrationSuccess;