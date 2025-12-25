import React, { useRef, useLayoutEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

type RetroGamingProps = {
    type: 'pixel_coins' | 'health_bar' | 'game_over_screen';
    score?: number;
    text?: string;
};

export const RetroGaming: React.FC<RetroGamingProps> = ({
    type = 'pixel_coins',
    score = 100,
    text = "GAME OVER"
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        // --- PIXEL COINS (Bouncing) ---
        if (type === 'pixel_coins') {
            tl.current.from('.pixel-coin', {
                y: -50,
                opacity: 0,
                stagger: 0.1,
                duration: 0.5,
                ease: 'bounce.out'
            });
            tl.current.to('.pixel-coin', {
                color: '#fff', // Flash
                duration: 0.1,
                repeat: 3,
                yoyo: true
            }, 0.5);
        }

        // --- HEALTH BAR (Damage) ---
        else if (type === 'health_bar') {
            tl.current.item = gsap.to('.fill', { width: `${score}%`, duration: 1, ease: 'steps(10)' });
            tl.current.to('.shake-container', { x: 5, duration: 0.1, repeat: 5, yoyo: true }, 0);
        }

        // --- GAME OVER (Drop in) ---
        else if (type === 'game_over_screen') {
            tl.current.from('.game-text', { y: -500, duration: 1, ease: 'bounce.out' });
            tl.current.from('.try-again', { opacity: 0, duration: 0.5, ease: 'steps(2)' }, 1.5);
        }

    }, { scope: container, dependencies: [type, score] });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    // STYLES
    const pixelFont = { fontFamily: '"Courier New", monospace', fontWeight: 'bold', imageRendering: 'pixelated' as const };

    return (
        <div ref={container} style={{
            width: '100%', height: '100%',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            ...pixelFont
        }}>
            {type === 'pixel_coins' && (
                <div style={{ display: 'flex', gap: '20px' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="pixel-coin" style={{
                            width: 60, height: 60, background: '#facc15', border: '5px solid #000',
                            boxShadow: 'inset -5px -5px 0 rgba(0,0,0,0.2)',
                            borderRadius: '50%'
                        }} />
                    ))}
                </div>
            )}

            {type === 'health_bar' && (
                <div className="shake-container" style={{ width: 600 }}>
                    <div style={{ marginBottom: '10px', fontSize: '30px', color: '#fff' }}>HP: {score}/100</div>
                    <div style={{
                        width: '100%', height: 40, border: '5px solid #fff', background: '#333',
                        position: 'relative'
                    }}>
                        <div className="fill" style={{
                            width: '100%', height: '100%', background: score < 30 ? '#ef4444' : '#10b981',
                            transition: 'background 0.3s'
                        }} />
                    </div>
                </div>
            )}

            {type === 'game_over_screen' && (
                <div style={{ flexDirection: 'column', alignItems: 'center', display: 'flex' }}>
                    <h1 className="game-text" style={{ fontSize: '100px', color: '#ef4444', textShadow: '5px 5px 0 #000' }}>
                        {text}
                    </h1>
                    <div className="try-again" style={{ fontSize: '40px', color: '#fff', marginTop: '20px' }}>
                        INSERT COIN
                    </div>
                </div>
            )}
        </div>
    );
};
