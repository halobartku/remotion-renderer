import React, { useRef, useLayoutEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import { THEME } from './theme';

type AssetShowcaseProps = {
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    stats?: { label: string; value: string }[];
    color?: string;
};

export const AssetShowcase: React.FC<AssetShowcaseProps> = ({
    title = "ELON MUSK",
    subtitle = "Technoking",
    imageUrl, // If undefined, displays placeholder
    stats = [
        { label: "NET WORTH", value: "$250B" },
        { label: "RISK", value: "EXTREME" },
        { label: "INNOVATION", value: "99" }
    ],
    color = THEME.colors.gold
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        // 3D Flip In
        tl.current.from(cardRef.current, {
            rotationY: 90,
            opacity: 0,
            scale: 0.8,
            duration: 1.5,
            ease: "power4.out"
        });

        // Stats Slide In
        tl.current.from('.stat-row', {
            x: -20,
            opacity: 0,
            stagger: 0.2,
            duration: 0.5
        }, 0.5);

        // Constant Floating
        tl.current.to(cardRef.current, {
            y: -15,
            rotationX: 5,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

    }, { scope: container, dependencies: [title, stats] });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    return (
        <div ref={container} style={{
            width: '100%', height: '100%',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            perspective: 1000,
            fontFamily: THEME.typography.fontFamily
        }}>
            <div ref={cardRef} style={{
                width: 400, height: 650,
                background: `linear-gradient(135deg, ${THEME.colors.gray[800]} 0%, ${THEME.colors.obsidian} 100%)`,
                borderRadius: '20px',
                border: `2px solid ${color}`,
                boxShadow: `0 0 50px ${color}44`,
                overflow: 'hidden',
                position: 'relative'
            }}>
                {/* Image Area */}
                <div style={{ width: '100%', height: '50%', background: THEME.colors.gray[700], position: 'relative' }}>
                    {imageUrl ? (
                        <img src={imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '50px' }}>
                            👤
                        </div>
                    )}
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, width: '100%', height: '50%',
                        background: `linear-gradient(to top, ${THEME.colors.obsidian}, transparent)`
                    }} />
                </div>

                {/* Content */}
                <div style={{ padding: '30px', color: THEME.colors.white }}>
                    <h1 style={{ ...THEME.typography.header, margin: 0, textTransform: 'uppercase', fontSize: '32px', color: color }}>{title}</h1>
                    <h3 style={{ ...THEME.typography.subHeader, margin: '0 0 20px 0', opacity: 0.7, fontWeight: 400, fontSize: 18 }}>{subtitle}</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {stats.map((stat, i) => (
                            <div key={i} className="stat-row" style={{
                                display: 'flex', justifyContent: 'space-between',
                                borderBottom: `1px solid ${THEME.colors.border}`, paddingBottom: '5px'
                            }}>
                                <span style={{ fontSize: '14px', opacity: 0.6, fontFamily: THEME.typography.mono.fontFamily }}>{stat.label}</span>
                                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{stat.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
