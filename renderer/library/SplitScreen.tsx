import React from 'react';
import { THEME } from './theme';

type SplitScreenProps = {
    left: React.ReactNode;
    right: React.ReactNode;
    divider?: boolean;
    ratio?: number; // 0.5 = 50/50
};

export const SplitScreen: React.FC<SplitScreenProps> = ({
    left,
    right,
    divider = true,
    ratio = 0.5
}) => {
    return (
        <div style={{
            width: '100%', height: '100%', display: 'flex',
            background: THEME.colors.obsidian
        }}>
            {/* Left Panel */}
            <div style={{
                flex: ratio, position: 'relative', overflow: 'hidden',
                borderRight: divider ? `1px solid ${THEME.colors.gray[800]}` : 'none'
            }}>
                {left}
            </div>

            {/* Right Panel */}
            <div style={{
                flex: 1 - ratio, position: 'relative', overflow: 'hidden'
            }}>
                {right}
            </div>

            {/* Centered Divider Graphic (Optional) */}
            {divider && (
                <div style={{
                    position: 'absolute', left: `${ratio * 100}%`, top: '50%', transform: 'translate(-50%, -50%)',
                    height: '80%', width: 1, background: THEME.colors.gray[700],
                    zIndex: 10
                }} />
            )}
        </div>
    );
};
