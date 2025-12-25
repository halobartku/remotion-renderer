import React, { useRef, useLayoutEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import { THEME } from './theme';

type ComparisonRigProps = {
    type: 'versus_cards' | 'tug_of_war' | 'tier_list';
    leftLabel?: string;
    rightLabel?: string;
    leftScore?: number; // 0-100
    rightScore?: number; // 0-100
};

export const ComparisonRig: React.FC<ComparisonRigProps> = ({
    type = 'versus_cards',
    leftLabel = "BULLS",
    rightLabel = "BEARS",
    leftScore = 50,
    rightScore = 50
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const leftRef = useRef(null);
    const rightRef = useRef(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        // --- VERSUS CARDS (Slam in) ---
        if (type === 'versus_cards') {
            tl.current.from(leftRef.current, { x: -500, opacity: 0, rotation: -20, duration: 1, ease: 'back.out' });
            tl.current.from(rightRef.current, { x: 500, opacity: 0, rotation: 20, duration: 1, ease: 'back.out' }, 0.2);
            // VS Icon Pop
            tl.current.from('.vs-icon', { scale: 0, rotation: 360, duration: 0.5, ease: 'elastic.out' }, 0.8);
        }

        // --- TUG OF WAR (Bar Push) ---
        else if (type === 'tug_of_war') {
            const total = leftScore + rightScore;
            const leftPercent = (leftScore / total) * 100;

            tl.current.from('.tug-bar-fill', { width: '50%', duration: 1.5, ease: 'power2.inOut' });
            tl.current.to('.tug-bar-fill', { width: `${leftPercent}%`, duration: 2, ease: 'power4.out' }, 0);

            // Text count up
            tl.current.from('.score-left', { textContent: 0, duration: 2, snap: { textContent: 1 } }, 0);
        }

    }, { scope: container, dependencies: [type, leftScore, rightScore] });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    // RENDER HELPERS
    const renderVersusCards = () => (
        <div style={{ display: 'flex', gap: '100px', alignItems: 'center', fontFamily: THEME.typography.fontFamily }}>
            <div ref={leftRef} style={{
                width: 400, height: 600, background: THEME.colors.emerald, color: THEME.colors.white,
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                borderRadius: '20px', boxShadow: `0 20px 50px ${THEME.colors.emerald}66`,
                border: `4px solid ${THEME.colors.white}`
            }}>
                <h1 style={{ ...THEME.typography.header, fontSize: '60px' }}>{leftLabel}</h1>
                <h2 style={{ ...THEME.typography.header, fontSize: '120px' }}>{leftScore}</h2>
            </div>

            <div className="vs-icon" style={{
                fontSize: '80px', fontWeight: '900', color: THEME.colors.white,
                textShadow: `0 0 20px ${THEME.colors.obsidian}`, zIndex: 10, fontFamily: THEME.typography.fontFamily
            }}>VS</div>

            <div ref={rightRef} style={{
                width: 400, height: 600, background: THEME.colors.rose, color: THEME.colors.white,
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                borderRadius: '20px', boxShadow: `0 20px 50px ${THEME.colors.rose}66`,
                border: `4px solid ${THEME.colors.white}`
            }}>
                <h1 style={{ ...THEME.typography.header, fontSize: '60px' }}>{rightLabel}</h1>
                <h2 style={{ ...THEME.typography.header, fontSize: '120px' }}>{rightScore}</h2>
            </div>
        </div>
    );

    const renderTugOfWar = () => (
        <div style={{ width: '80%', display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: THEME.typography.header.fontFamily }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '40px', fontWeight: 'bold', color: THEME.colors.white }}>
                <span className="score-left" style={{ color: THEME.colors.emerald }}>{leftLabel} {leftScore}%</span>
                <span className="score-right" style={{ color: THEME.colors.rose }}>{rightLabel} {rightScore}%</span>
            </div>

            <div style={{ width: '100%', height: '80px', background: THEME.colors.gray[700], borderRadius: '40px', overflow: 'hidden', border: `4px solid ${THEME.colors.white}`, position: 'relative' }}>
                {/* Left Side (Green) */}
                <div className="tug-bar-fill" style={{
                    height: '100%', width: '50%', background: THEME.colors.emerald,
                    boxShadow: `0 0 30px ${THEME.colors.emerald}`,
                    position: 'absolute', left: 0, top: 0
                }} />
                {/* Right background is effectively Red if we style container or just use negative space. keeping simple. */}
                <div style={{ position: 'absolute', right: 0, top: 0, width: '100%', height: '100%', background: THEME.colors.rose, zIndex: -1 }} />

                {/* Center Marker */}
                <div style={{ position: 'absolute', left: '50%', top: 0, height: '100%', width: '4px', background: THEME.colors.white }} />
            </div>
        </div>
    );

    return (
        <div ref={container} style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {type === 'versus_cards' && renderVersusCards()}
            {type === 'tug_of_war' && renderTugOfWar()}
        </div>
    );
};
