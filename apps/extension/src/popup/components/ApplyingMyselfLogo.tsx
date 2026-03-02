import React from 'react';

interface ApplyingMyselfLogoProps {
    className?: string;
    size?: number;
}

export const ApplyingMyselfLogo: React.FC<ApplyingMyselfLogoProps> = ({
    className = "",
    size = 24
}) => {
    // Use chrome.runtime.getURL to get the proper path to the SVG file
    const logoUrl = chrome.runtime.getURL('icons/logo.png');

    return (
        <div className={`inline-flex ${className}`} style={{ width: size, height: size }}>
            <img
                src={logoUrl}
                alt="Applying Myself Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
        </div>
    );
};

export default ApplyingMyselfLogo; 