import React, { useRef, useLayoutEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { THEME } from './theme';

type CinematicTitleProps = {
    text: string;
    styleType?: 'glitch_modern' | 'elegant_serif' | 'bold_impact';
    size?: number;
    color?: string;
};

export const CinematicTitle: React.FC<CinematicTitleProps> = ({
    text = "THE GREAT RESET",
    styleType = 'glitch_modern',
    size = 120,
    color = THEME.colors.white
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    // Split text into letters manually for animation
    const letters = text.split('');

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        // --- GLITCH MODERN ---
        if (styleType === 'glitch_modern') {
            tl.current.from('.char', {
                opacity: 0,
                x: 50,
                duration: 0.1,
                stagger: { amount: 0.5, from: "random" },
            });
            // Glitch shake
            tl.current.to('.char', {
                x: (i) => (Math.random() - 0.5) * 10,
                y: (i) => (Math.random() - 0.5) * 10,
                duration: 0.05,
                repeat: 10,
                yoyo: true,
                color: THEME.colors.rose
            }, 0.2);
            tl.current.to('.char', { x: 0, y: 0, color: color }, 1);
        }

        // --- ELEGANT SERIF ---
        else if (styleType === 'elegant_serif') {
            tl.current.from('.char', {
                opacity: 0,
                filter: 'blur(20px)',
                y: 20,
                duration: 1.5,
                stagger: 0.05,
                ease: 'power3.out'
            });
            tl.current.from(container.current, { scale: 1.1, duration: 5, ease: 'sine.out' }, 0);
        }

        // --- BOLD IMPACT ---
        else if (styleType === 'bold_impact') {
            tl.current.from('.char', {
                scale: 3,
                opacity: 0,
                rotationX: -90,
                transformOrigin: '50% 100%',
                duration: 0.8,
                stagger: 0.1,
                ease: 'back.out(1.7)'
            });
        }

    }, { scope: container, dependencies: [text, styleType] });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    // STYLES
    const getFont = () => {
        if (styleType === 'elegant_serif') return '"Playfair Display", serif';
        if (styleType === 'glitch_modern') return THEME.typography.mono.fontFamily;
        return THEME.typography.fontFamily; // Bold Impact
    };

    return (
        <div ref={container} style={{
            width: '100%', height: '100%',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            flexDirection: 'column',
            fontFamily: getFont(),
            textTransform: 'uppercase',
            color: color
        }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                {letters.map((char, i) => (
                    <span key={i} className="char" style={{
                        fontSize: `${size}px`,
                        fontWeight: styleType === 'bold_impact' ? 900 : 400,
                        display: 'inline-block',
                        textShadow: styleType === 'glitch_modern' ? `2px 0 ${THEME.colors.rose}, -2px 0 ${THEME.colors.blue}` : 'none',
                        whiteSpace: char === ' ' ? 'pre' : 'normal'
                    }}>
                        {char}
                    </span>
                ))}
            </div>

            {styleType === 'elegant_serif' && (
                <div style={{ marginTop: '20px', letterSpacing: '5px', fontSize: '20px', opacity: 0.8, fontFamily: THEME.typography.fontFamily }}>
                    PRESENTS
                </div>
            )}
        </div>
    );
};
