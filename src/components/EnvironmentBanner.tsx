import React from 'react';
import CONFIG from '@/config';

const EnvironmentBanner: React.FC = () => {
    // Only show banner for non-production environments
    if (CONFIG.ENVIRONMENT === 'production') {
        return null;
    }

    const getBannerStyle = () => {
        switch (CONFIG.ENVIRONMENT) {
            case 'development':
                return {
                    backgroundColor: '#fbbf24', // amber-400
                    color: '#92400e', // amber-800
                    borderColor: '#f59e0b', // amber-500
                };
            case 'staging':
                return {
                    backgroundColor: '#60a5fa', // blue-400
                    color: '#1e40af', // blue-800
                    borderColor: '#3b82f6', // blue-500
                };
            default:
                return {
                    backgroundColor: '#f3f4f6', // gray-100
                    color: '#374151', // gray-700
                    borderColor: '#d1d5db', // gray-300
                };
        }
    };

    const style = getBannerStyle();

    return (
        <div
            style={{
                ...style,
                padding: '4px 8px',
                fontSize: '10px',
                fontWeight: '600',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: `1px solid ${style.borderColor}`,
                position: 'sticky',
                top: 0,
                zIndex: 1000,
            }}
        >
            {CONFIG.ENVIRONMENT} Environment
        </div>
    );
};

export default EnvironmentBanner; 