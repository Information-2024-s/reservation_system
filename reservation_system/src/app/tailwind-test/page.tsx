import React from 'react';

const TailwindTestPage = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-blue-600">
                Tailwind CSS Test Page
            </h1>
            <p className="mt-4 text-lg text-gray-700">
                If you see this text styled correctly, Tailwind CSS is working!
            </p>
        </div>
    );
};

export default TailwindTestPage;