import React, { useRef, useLayoutEffect } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

type DocumentaryOverlayProps = {
    type: 'rec_mode' | 'film_grain' | 'vhs_glitch' | 'timecode' | 'news_ticker_overlay';
    text?: string; // For lower third or custom text
};

export const DocumentaryOverlay: React.FC<DocumentaryOverlayProps> = ({
    type = 'rec_mode',
    text = "LIVE FOOTAGE"
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        if (type === 'rec_mode') {
            // Blink the red dot
            tl.current.to('.rec-dot', { opacity: 0, duration: 0.5, repeat: -1, yoyo: true, ease: 'steps(1)' });
        }
        else if (type === 'vhs_glitch') {
            // Move scanlines
            tl.current.to('.scanline', { top: '100%', duration: 4, ease: 'none', repeat: -1 });
            // Random noise jumps
            tl.current.to('.vhs-container', { x: 5, duration: 0.1, repeat: -1, yoyo: true, ease: 'steps(1)' });
        }

    }, { scope: container, dependencies: [type] });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    // RENDER HELPERS
    const renderRecMode = () => (
        <AbsoluteFill style={{ border: '2px solid rgba(255,255,255,0.3)', margin: '20px', width: 'calc(100% - 40px)', height: 'calc(100% - 40px)' }}>
            <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="rec-dot" style={{ width: 20, height: 20, borderRadius: '50%', background: '#ef4444' }} />
                <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: '24px', fontWeight: 'bold' }}>REC</span>
            </div>
            <div style={{ position: 'absolute', bottom: 20, right: 20, color: '#fff', fontFamily: 'monospace' }}>
                {text}
            </div>
            {/* Crosshairs */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: 40, height: 2, background: 'rgba(255,255,255,0.5)', transform: 'translate(-50%, -50%)' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: 2, height: 40, background: 'rgba(255,255,255,0.5)', transform: 'translate(-50%, -50%)' }} />
        </AbsoluteFill>
    );

    const renderFilmGrain = () => (
        <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'overlay', opacity: 0.15 }}>
            <svg width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'>
                <filter id='noiseFilter'>
                    <feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch' />
                </filter>
                <rect width='100%' height='100%' filter='url(#noiseFilter)' />
            </svg>
        </AbsoluteFill>
    );

    const renderVhsGlitch = () => (
        <AbsoluteFill className="vhs-container" style={{ pointerEvents: 'none', mixBlendMode: 'color-dodge', overflow: 'hidden' }}>
            <div className="scanline" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '5px', background: 'rgba(255,255,255,0.5)', boxShadow: '0 0 10px rgba(255,255,255,0.5)' }} />
            <div style={{
                position: 'absolute', bottom: 40, left: 40,
                fontFamily: 'monospace', fontSize: '32px', color: '#fff', textShadow: '2px 0 red, -2px 0 blue'
            }}>
                PLAY {'>'}
            </div>
        </AbsoluteFill>
    );

    return (
        <div ref={container} style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
            {type === 'rec_mode' && renderRecMode()}
            {type === 'film_grain' && renderFilmGrain()}
            {type === 'vhs_glitch' && renderVhsGlitch()}
        </div>
    );
};
