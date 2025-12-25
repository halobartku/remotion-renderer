import React, { useRef, useLayoutEffect } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

type NarrativeTransitionProps = {
    type: 'ink_blot' | 'shutter_snap' | 'slide_wipe';
    color?: string;
    inOrOut?: 'in' | 'out'; // Animate In (Reveal) or Out (Cover)
};

export const NarrativeTransition: React.FC<NarrativeTransitionProps> = ({
    type = 'slide_wipe',
    color = '#000',
    inOrOut = 'out'
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        // --- SLIDE WIPE ---
        if (type === 'slide_wipe') {
            if (inOrOut === 'out') {
                // Cover screen
                tl.current.fromTo('.slide-panel',
                    { x: '100%' },
                    { x: '0%', duration: 0.8, ease: 'power4.inOut', stagger: 0.1 }
                );
            } else {
                // Reveal screen
                tl.current.fromTo('.slide-panel',
                    { x: '0%' },
                    { x: '-100%', duration: 0.8, ease: 'power4.inOut', stagger: 0.1 }
                );
            }
        }

        // --- SHUTTER SNAP ---
        else if (type === 'shutter_snap') {
            const blades = ['.blade-top', '.blade-bottom'];
            if (inOrOut === 'out') {
                tl.current.to(blades, { height: '50%', duration: 0.3, ease: 'power2.in' });
            } else {
                tl.current.fromTo(blades, { height: '50%' }, { height: '0%', duration: 0.3, ease: 'power2.out' });
            }
        }

        // --- INK BLOT (Simple Scale) ---
        else if (type === 'ink_blot') {
            if (inOrOut === 'out') {
                tl.current.fromTo('.ink-circle',
                    { scale: 0 },
                    { scale: 4, duration: 1, ease: 'rough' }
                );
            } else {
                tl.current.fromTo('.ink-circle',
                    { scale: 4 },
                    { scale: 0, duration: 1, ease: 'rough' }
                );
            }
        }

    }, { scope: container, dependencies: [type, inOrOut] });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    return (
        <AbsoluteFill ref={container} style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>

            {type === 'slide_wipe' && (
                <>
                    <div className="slide-panel" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '33.33%', background: color }} />
                    <div className="slide-panel" style={{ position: 'absolute', top: '33.33%', left: 0, width: '100%', height: '33.33%', background: color }} />
                    <div className="slide-panel" style={{ position: 'absolute', top: '66.66%', left: 0, width: '100%', height: '33.34%', background: color }} />
                </>
            )}

            {type === 'shutter_snap' && (
                <>
                    <div className="blade-top" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '0%', background: '#111' }} />
                    <div className="blade-bottom" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '0%', background: '#111' }} />
                </>
            )}

            {type === 'ink_blot' && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                    <div className="ink-circle" style={{ width: '600px', height: '600px', background: color, borderRadius: '50%', filter: 'blur(20px) contrast(10)' }} />
                </div>
            )}

        </AbsoluteFill>
    );
};
