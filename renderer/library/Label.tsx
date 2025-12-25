import React from 'react';
import { THEME } from './theme';

type LabelProps = {
    text: string;
    variant?: 'axis' | 'category' | 'value' | 'timestamp';
    color?: string;
    align?: 'left' | 'center' | 'right';
};

export const Label: React.FC<LabelProps> = ({
    text,
    variant = 'value',
    color, // Default depends on variant
    align = 'left'
}) => {

    const getStyle = (): React.CSSProperties => {
        const base: React.CSSProperties = {
            fontFamily: THEME.typography.mono.fontFamily,
            textAlign: align,
            lineHeight: 1
        };

        switch (variant) {
            case 'axis':
                return {
                    ...base,
                    fontSize: 12,
                    fontWeight: 500,
                    color: color || THEME.colors.gray[500]
                };
            case 'category':
                return {
                    ...base,
                    fontFamily: THEME.typography.fontFamily, // Sans for categories
                    fontSize: 14,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: color || THEME.colors.gray[300]
                };
            case 'timestamp':
                return {
                    ...base,
                    fontSize: 10,
                    color: color || THEME.colors.gray[600],
                    letterSpacing: '0.05em'
                };
            case 'value':
            default:
                return {
                    ...base,
                    fontSize: 14,
                    fontWeight: 600,
                    color: color || THEME.colors.white
                };
        }
    };

    return (
        <div style={getStyle()}>
            {text}
        </div>
    );
};
