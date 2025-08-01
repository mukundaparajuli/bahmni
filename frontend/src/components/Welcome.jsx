import React from 'react';

const Welcome = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md text-center">
                <h2 className="text-2xl font-semibold text-green-600 mb-4">
                    🎉 Congratulations!
                </h2>
                <p className="text-gray-700 text-base mb-2">
                    You have successfully registered for the <strong>Bahmni Scanner</strong>.
                </p>
                <p className="text-sm text-gray-500">
                    You will be notified through your email once your registration is completed.
                </p>
            </div>
        </div>
    );
};

export default Welcome;
