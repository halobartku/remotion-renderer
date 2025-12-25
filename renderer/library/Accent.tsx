import React from 'react';
import { THEME } from './theme';

type AccentProps = {
    type?: 'line' | 'corner' | 'dot';
    color?: string;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
};

export const Accent: React.FC<AccentProps> = ({
    type = 'line',
    color = THEME.colors.gold,
    position = 'top-left'
}) => {
    const getStyle = (): React.CSSProperties => {
        const base: React.CSSProperties = { position: 'absolute', pointerEvents: 'none', background: color };

        // Position logic
        if (position.includes('top')) base.top = 20;
        if (position.includes('bottom')) base.bottom = 20;
        if (position.includes('left')) base.left = 20;
        if (position.includes('right')) base.right = 20;

        // Shape logic
        if (type === 'corner') {
            base.width = 40;
            base.height = 40;
            base.background = 'transparent';
            base.border = `4px solid ${color}`;

            // Mask borders based on corner
            if (position === 'top-left') { base.borderRight = 'none'; base.borderBottom = 'none'; }
            if (position === 'top-right') { base.borderLeft = 'none'; base.borderBottom = 'none'; }
            if (position === 'bottom-left') { base.borderRight = 'none'; base.borderTop = 'none'; }
            if (position === 'bottom-right') { base.borderLeft = 'none'; base.borderTop = 'none'; }
        } else if (type === 'dot') {
            base.width = 12;
            base.height = 12;
            base.borderRadius = '50%';
        } else { // line
            base.width = 100;
            base.height = 4;
        }

        return base;
    };

    return <div style={getStyle()} />;
};
