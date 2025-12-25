import React, { useRef, useLayoutEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { THEME } from './theme';

type ArrowSweepProps = {
    color?: string;
    message?: string;
};

export const ArrowSweep: React.FC<ArrowSweepProps> = ({
    color = THEME.colors.gold,
    message
}) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();
    const container = useRef(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        // Arrow shape definition
        // We'll use clip-path to reveal

        // 1. Bar Sweeps Across
        tl.current.fromTo('.sweep-bar',
            { x: -width * 1.5, skewX: -20 },
            { x: width * 1.5, duration: 1.5, ease: 'power4.inOut' }
        );

        // 2. Text Reveal (if message)
        if (message) {
            tl.current.from('.sweep-text', {
                opacity: 0, scale: 2, duration: 0.2
            }, 0.7); // Mid-sweep
            tl.current.to('.sweep-text', {
                opacity: 0, scale: 0, duration: 0.2
            }, 0.9);
        }

    }, { scope: container });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    return (
        <div ref={container} style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100,
            overflow: 'hidden'
        }}>
            {/* The Sweeping Element */}
            <div className="sweep-bar" style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%',
                background: color,
                transform: 'skewX(-20deg)', // Initial skew
                // Use a gradient or shape for "Arrow" look
                clipPath: 'polygon(20% 0%, 100% 0%, 80% 100%, 0% 100%)'
            }} />

            {/* Optional Text */}
            {message && (
                <div className="sweep-text" style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    ...THEME.typography.header, fontSize: 80,
                    color: THEME.colors.obsidian, // Contrast against sweep color
                    whiteSpace: 'nowrap'
                }}>
                    {message}
                </div>
            )}
        </div>
    );
};
