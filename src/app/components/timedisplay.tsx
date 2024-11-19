import React from 'react';

interface TimeDisplayProps {
    epochTime: number;
}

export const TimeDisplay: React.FC<TimeDisplayProps> = ({ epochTime }) => {
    const date = new Date(epochTime * 1000); // Convert seconds to milliseconds
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    return (
        <div style={{fontSize: '.7rem'}}>
            {formattedDate} @ {formattedTime}
        </div>
    );
};

export default TimeDisplay;
