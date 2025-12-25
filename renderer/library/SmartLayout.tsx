import React from 'react';
import { AbsoluteFill } from 'remotion';

type SmartLayoutProps = {
    children: React.ReactNode;
    type?: 'fullscreen' | 'split_vertical' | 'split_horizontal' | 'grid_2x2';
    gap?: number;
    padding?: number;
    background?: string;
};

export const SmartLayout: React.FC<SmartLayoutProps> = ({
    children,
    type = 'fullscreen',
    gap = 20,
    padding = 40,
    background = '#111827' // slate-900 default
}) => {

    const childrenArray = React.Children.toArray(children);

    const containerStyle: React.CSSProperties = {
        backgroundColor: background,
        width: '100%',
        height: '100%',
        padding: padding,
        boxSizing: 'border-box',
        display: 'flex',
        gap: gap,
    };

    // Layout Logic
    if (type === 'split_vertical') {
        containerStyle.flexDirection = 'row';
    } else if (type === 'split_horizontal') {
        containerStyle.flexDirection = 'column';
    } else if (type === 'grid_2x2') {
        containerStyle.display = 'grid';
        containerStyle.gridTemplateColumns = '1fr 1fr';
        containerStyle.gridTemplateRows = '1fr 1fr';
    } else {
        containerStyle.justifyContent = 'center';
        containerStyle.alignItems = 'center';
    }

    return (
        <AbsoluteFill style={{ ...containerStyle, fontFamily: 'sans-serif' }}>
            {childrenArray.map((child, i) => (
                <div key={i} style={{
                    flex: 1,
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255,255,255,0.02)', // Subtle inner container
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    {child}
                </div>
            ))}
        </AbsoluteFill>
    );
};
