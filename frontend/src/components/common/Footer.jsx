import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-4 mt-auto">
            <div className="container mx-auto px-4 text-center">
                <p className="text-sm">
                    © {new Date().getFullYear()} Bahmni Scanner. All rights reserved.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    Patient Chart Scanner System
                </p>
            </div>
        </footer>
    );
};

export default Footer;