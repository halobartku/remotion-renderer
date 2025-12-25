import React, { useRef, useLayoutEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { THEME } from './theme';

type PsychCharacterProps = {
    type: 'silhouette_man' | 'crowd_sheep' | 'panopticon_eye';
    color?: string;
    count?: number; // For crowd
};

export const PsychCharacter: React.FC<PsychCharacterProps> = ({
    type = 'silhouette_man',
    color = THEME.colors.white,
    count = 20
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        // --- SILHOUETTE MAN ---
        if (type === 'silhouette_man') {
            tl.current.from('.man-shape', { opacity: 0, y: 50, duration: 1, ease: 'power2.out' });
            tl.current.from('.shadow', { scale: 0, opacity: 0, duration: 1 }, 0);
            // Breathe
            tl.current.to('.man-shape', { scale: 1.02, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        }

        // --- CROWD / SHEEP ---
        else if (type === 'crowd_sheep') {
            tl.current.from('.sheep', {
                opacity: 0,
                y: 20,
                stagger: { amount: 1, from: 'random' },
                duration: 0.5,
                ease: 'back.out'
            });
            // Idle bobbing
            tl.current.to('.sheep', {
                y: '-=10',
                duration: 1,
                stagger: { amount: 2, from: 'random', repeat: -1, yoyo: true },
                ease: 'sine.inOut'
            });
        }

        // --- PANOPTICON EYE ---
        else if (type === 'panopticon_eye') {
            tl.current.from('.eye-ball', { scale: 0, rotation: -180, duration: 1.5, ease: 'elastic.out(1, 0.5)' });
            tl.current.from('.eye-outline', { strokeDashoffset: 1000, duration: 2, ease: 'power2.inOut' }, 0);

            // Look around
            const pupil = tl.current;
            pupil.to('.pupil', { x: 30, duration: 0.5, delay: 1 });
            pupil.to('.pupil', { x: -30, duration: 0.5, delay: 0.5 });
            pupil.to('.pupil', { x: 0, y: -20, duration: 0.5, delay: 0.5 });
            pupil.to('.pupil', { x: 0, y: 0, duration: 0.5 });
            pupil.to('.blink-lid', { height: 200, duration: 0.1, repeat: 1, yoyo: true, delay: 0.5 }); // Blink
        }

    }, { scope: container, dependencies: [type, count] });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    // ASSETS (Simplified SVGs)
    const ManSVG = () => (
        <svg viewBox="0 0 100 200" style={{ height: '80%', overflow: 'visible' }}>
            <ellipse className="shadow" cx="50" cy="190" rx="40" ry="10" fill="rgba(0,0,0,0.5)" />
            <path className="man-shape" d="M50,20 C40,20 35,30 35,40 C35,50 40,55 50,55 C60,55 65,50 65,40 C65,30 60,20 50,20 M35,60 L65,60 L70,120 L55,120 L55,180 L45,180 L45,120 L30,120 L35,60" fill={color} />
        </svg>
    );

    const SheepSVG = ({ i }: { i: number }) => (
        <div key={i} className="sheep" style={{ width: 40, height: 40, background: color, borderRadius: '50%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 5, left: -5, width: 15, height: 20, background: THEME.colors.gray[800], borderRadius: '10px' }} /> {/* Head */}
        </div>
    );

    const EyeSVG = () => (
        <svg viewBox="0 0 200 200" style={{ width: 400, height: 400 }}>
            {/* Outline */}
            <path className="eye-outline" d="M 20 100 Q 100 20 180 100 Q 100 180 20 100" fill="none" stroke={color} strokeWidth="5" strokeDasharray="500" />

            {/* Ball/Pupil Group */}
            <g className="eye-ball">
                <circle cx="100" cy="100" r="40" fill={color} opacity="0.2" />
                <circle className="pupil" cx="100" cy="100" r="15" fill={color} />
            </g>

            {/* Blink Mask using clipPath or just overlay rect for simple blink */}
            <rect className="blink-lid" x="0" y="0" width="200" height="0" fill={THEME.colors.gray[900]} />
        </svg>
    );

    return (
        <div ref={container} style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {type === 'silhouette_man' && <ManSVG />}
            {type === 'crowd_sheep' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', width: '600px', justifyContent: 'center', gap: '20px' }}>
                    {Array.from({ length: Math.min(count, 50) }).map((_, i) => <SheepSVG key={i} i={i} />)}
                </div>
            )}
            {type === 'panopticon_eye' && <EyeSVG />}
        </div>
    );
};
