import React from 'react';
import { THEME } from './theme';

type GlowProps = {
    color?: string;
    radius?: number;
    opacity?: number;
    center?: boolean;
};

export const Glow: React.FC<GlowProps> = ({
    color = THEME.colors.emerald,
    radius = 300,
    opacity = 0.3,
    center = true
}) => {
    return (
        <div style={{
            position: 'absolute',
            top: center ? '50%' : '0',
            left: center ? '50%' : '0',
            width: radius, height: radius,
            transform: center ? 'translate(-50%, -50%)' : 'none',
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            opacity: opacity,
            pointerEvents: 'none',
            zIndex: 0,
            filter: 'blur(40px)'
        }} />
    );
};
