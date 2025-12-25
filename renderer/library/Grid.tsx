import React from 'react';
import { THEME } from './theme';

type GridProps = {
    children: React.ReactNode;
    cols?: number;
    gap?: number;
    padding?: number;
};

export const Grid: React.FC<GridProps> = ({
    children,
    cols = 2,
    gap = 20,
    padding = 20
}) => {
    return (
        <div style={{
            width: '100%', height: '100%',
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: gap,
            padding: padding,
            boxSizing: 'border-box'
        }}>
            {children}
        </div>
    );
};
