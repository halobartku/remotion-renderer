import React, { useRef, useLayoutEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

type MicroInteractionProps = {
    type: 'cursor_click' | 'finger_tap' | 'reaction_hearts';
    position?: { x: number; y: number }; // Percentage 0-100
};

export const MicroInteraction: React.FC<MicroInteractionProps> = ({
    type = 'cursor_click',
    position = { x: 50, y: 50 }
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        // --- CURSOR CLICK ---
        if (type === 'cursor_click') {
            // Move in
            tl.current.from('.cursor-arrow', { x: 100, y: 100, opacity: 0, duration: 0.5, ease: 'power2.out' });
            // Click scale
            tl.current.to('.cursor-arrow', { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1 });
            // Ripple
            tl.current.fromTo('.ripple',
                { scale: 0, opacity: 1 },
                { scale: 2, opacity: 0, duration: 0.6 },
                0.6
            );
        }

        // --- FINGER TAP ---
        else if (type === 'finger_tap') {
            tl.current.from('.finger-dot', { opacity: 0, scale: 2, duration: 0.3 });
            tl.current.to('.finger-dot', { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1 });
            // Pulse ring
            tl.current.fromTo('.pulse-ring',
                { scale: 1, opacity: 1, borderWidth: 5 },
                { scale: 3, opacity: 0, borderWidth: 0, duration: 0.8 },
                0.4
            );
        }

        // --- REACTION HEARTS ---
        else if (type === 'reaction_hearts') {
            tl.current.from('.heart', {
                y: 0,
                x: 0,
                opacity: 0,
                scale: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: 'back.out'
            });
            // Float up and fade
            tl.current.to('.heart', {
                y: -200,
                x: (i) => (Math.random() - 0.5) * 100,
                opacity: 0,
                duration: 2,
                stagger: 0.1,
                ease: 'power1.out'
            }, 0.5);
        }

    }, { scope: container, dependencies: [type, position] });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    // STYLES
    const posStyle: React.CSSProperties = {
        position: 'absolute',
        top: `${position.y}%`,
        left: `${position.x}%`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none'
    };

    return (
        <div ref={container} style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
            <div style={posStyle}>
                {type === 'cursor_click' && (
                    <>
                        <div className="ripple" style={{ width: 40, height: 40, border: '2px solid #fff', borderRadius: '50%', position: 'absolute', top: -10, left: -10 }} />
                        <svg className="cursor-arrow" width="30" height="30" viewBox="0 0 24 24" fill="white" stroke="black" strokeWidth="1">
                            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                        </svg>
                    </>
                )}

                {type === 'finger_tap' && (
                    <>
                        <div className="pulse-ring" style={{ width: 60, height: 60, border: '2px solid #aff', borderRadius: '50%', position: 'absolute', top: -15, left: -15 }} />
                        <div className="finger-dot" style={{ width: 30, height: 30, background: 'rgba(255,255,255,0.5)', borderRadius: '50%' }} />
                    </>
                )}

                {type === 'reaction_hearts' && (
                    <div style={{ position: 'relative' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="heart" style={{ position: 'absolute', fontSize: '40px' }}>❤️</div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
