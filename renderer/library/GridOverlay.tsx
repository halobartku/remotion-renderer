import React from 'react';
import { THEME } from './theme';

type GridOverlayProps = {
    opacity?: number;
    size?: number;
    color?: string;
};

export const GridOverlay: React.FC<GridOverlayProps> = ({
    opacity = 0.1,
    size = 40,
    color = THEME.colors.gray[500]
}) => {
    return (
        <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            zIndex: 0,
            opacity: opacity,
            backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
            backgroundSize: `${size}px ${size}px`
        }} />
    );
};
