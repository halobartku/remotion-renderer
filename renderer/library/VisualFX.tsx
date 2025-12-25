import React, { useRef, useLayoutEffect } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { THEME } from './theme';

type VisualFXProps = {
    type: 'grid' | 'vignette' | 'glitch' | 'spotlight' | 'finance_gradient';
    color?: string;
    intensity?: number;
};

export const VisualFX: React.FC<VisualFXProps> = ({
    type = 'grid',
    color = THEME.colors.white,
    intensity = 0.5
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const fxRef = useRef<HTMLDivElement>(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        if (type === 'grid') {
            // Moving grid
            tl.current.to(fxRef.current, { backgroundPosition: '0px 100px', duration: 2, ease: 'none', repeat: -1 });
        }
        else if (type === 'glitch') {
            // Random clip path jumps
            const jumps = 20;
            for (let i = 0; i < jumps; i++) {
                tl.current.set(fxRef.current, {
                    clipPath: `inset(${Math.random() * 20}% 0 ${Math.random() * 20}% 0)`,
                    x: (Math.random() - 0.5) * 20
                }, i * (1 / 10)); // rapid fire
            }
            tl.current.set(fxRef.current, { clipPath: 'inset(0% 0 0% 0)', x: 0 });
        }

    }, { scope: container, dependencies: [type] });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    // FX STYLES
    const getStyle = (): React.CSSProperties => {
        if (type === 'grid') {
            return {
                backgroundImage: `linear-gradient(${color}22 1px, transparent 1px), linear-gradient(90deg, ${color}22 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
                width: '100%', height: '200%', // Taller for movement
                position: 'absolute', top: -50,
                transform: 'perspective(500px) rotateX(60deg)'
            };
        }
        if (type === 'vignette') {
            return {
                background: `radial-gradient(circle, transparent 50%, ${THEME.colors.obsidian} 150%)`,
                opacity: intensity
            };
        }
        if (type === 'finance_gradient') {
            return {
                background: `linear-gradient(135deg, ${THEME.colors.gray[900]} 0%, ${THEME.colors.obsidian} 100%)`, // Slate to Obsidian roughly
                opacity: 1
            };
        }
        return {};
    };

    return (
        <AbsoluteFill ref={container} style={{ pointerEvents: 'none', overflow: 'hidden' }}>
            <div ref={fxRef} style={{ width: '100%', height: '100%', ...getStyle() }}>
                {/* Glitch overlay content would go here if needed */}
            </div>
        </AbsoluteFill>
    );
};
