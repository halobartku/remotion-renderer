import React from 'react';

type FullBleedProps = {
    children: React.ReactNode;
};

export const FullBleed: React.FC<FullBleedProps> = ({
    children
}) => {
    return (
        <div style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden' // Ensure it doesn't break layout
        }}>
            {children}
        </div>
    );
};
