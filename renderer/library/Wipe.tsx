import React, { useRef, useLayoutEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { THEME } from './theme';

type WipeProps = {
    direction?: 'left' | 'right' | 'up' | 'down';
    color?: string;
    duration?: number; // seconds
};

export const Wipe: React.FC<WipeProps> = ({
    direction = 'right',
    color = THEME.colors.obsidian,
    duration = 1
}) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();
    const container = useRef(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        const fromVars: gsap.TweenVars = { ease: 'power3.inOut' };

        switch (direction) {
            case 'right':
                fromVars.width = '0%';
                tl.current.fromTo('.wipe-rect', { width: '0%', left: 0 }, { width: '100%', duration: duration, ...fromVars });
                break;
            case 'left':
                tl.current.fromTo('.wipe-rect', { width: '0%', right: 0 }, { width: '100%', duration: duration, ...fromVars });
                break;
            case 'down':
                tl.current.fromTo('.wipe-rect', { height: '0%', top: 0 }, { height: '100%', duration: duration, ...fromVars });
                break;
            case 'up':
                tl.current.fromTo('.wipe-rect', { height: '0%', bottom: 0 }, { height: '100%', duration: duration, ...fromVars });
                break;
        }

    }, { scope: container, dependencies: [direction] });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    return (
        <div ref={container} style={{
            width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none',
            zIndex: 100 // High z-index for transition
        }}>
            <div className="wipe-rect" style={{
                position: 'absolute',
                background: color,
                width: '100%', height: '100%' // Initial state handled by GSAP
            }} />
        </div>
    );
};
