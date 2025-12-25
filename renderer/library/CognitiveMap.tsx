import React, { useRef, useLayoutEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

type CognitiveMapProps = {
    type: 'brain_wireframe' | 'pyramid_maslow' | 'iceberg' | 'synapse_spark';
    color?: string;
    activeLayer?: number; // 0-5 for Pyramid/Iceberg highlight
};

export const CognitiveMap: React.FC<CognitiveMapProps> = ({
    type = 'brain_wireframe',
    color = '#60a5fa',
    activeLayer = -1
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const elementRef = useRef<HTMLDivElement>(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        // --- BRAIN WIREFRAME (Scanning) ---
        if (type === 'brain_wireframe') {
            tl.current.to(elementRef.current, {
                rotationY: 360,
                duration: 8,
                ease: 'none',
                repeat: -1
            });
            // Pulse effect
            tl.current.to(elementRef.current, {
                filter: 'drop-shadow(0 0 15px rgba(96, 165, 250, 0.8))',
                duration: 1,
                yoyo: true,
                repeat: -1
            }, 0);
        }

        // --- PYRAMID (Maslow) ---
        else if (type === 'pyramid_maslow') {
            const layers = elementRef.current?.children;
            if (layers) {
                // Animate hierarchy building up
                tl.current.from(layers, {
                    scaleX: 0, opacity: 0, stagger: 0.2, duration: 1, ease: 'back.out'
                });

                if (activeLayer >= 0 && activeLayer < layers.length) {
                    tl.current.to(layers[layers.length - 1 - activeLayer], {
                        backgroundColor: '#f59e0b', scale: 1.1, duration: 0.5
                    }, 1.5);
                }
            }
        }

        // --- ICEBERG (Subconscious) ---
        else if (type === 'iceberg') {
            const waterLevel = elementRef.current?.querySelector('.water-level');
            const hiddenPart = elementRef.current?.querySelector('.hidden-part');

            tl.current.from(elementRef.current, { y: 100, opacity: 0, duration: 1.5, ease: 'power3.out' });
            if (hiddenPart) {
                tl.current.from(hiddenPart, { opacity: 0.5, duration: 2 }, 0.5);
            }
        }

    }, { scope: container, dependencies: [type, activeLayer] });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    // RENDER HELPERS
    const renderBrain = () => (
        <div ref={elementRef} style={{
            width: 300, height: 300,
            border: `2px solid ${color}`, borderRadius: '40% 60% 50% 50% / 50% 60% 40% 50%',
            position: 'relative',
            background: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${color}22 10px, ${color}22 11px)`,
            boxShadow: `inset 0 0 50px ${color}44`,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div style={{ position: 'absolute', top: '30%', left: '30%', width: 20, height: 20, background: '#fff', borderRadius: '50%', boxShadow: '0 0 20px #fff' }} />
            <span style={{ color: '#fff', fontFamily: 'monospace', textShadow: `0 0 10px ${color}` }}>CORTEX</span>
        </div>
    );

    const renderPyramid = () => (
        <div ref={elementRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            {/* Pyramid Layers (Top to Bottom) */}
            <div style={{ width: 60, height: 40, background: color, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', marginBottom: '-5px' }} />
            <div style={{ width: 120, height: 40, background: color, opacity: 0.9 }} />
            <div style={{ width: 180, height: 40, background: color, opacity: 0.8 }} />
            <div style={{ width: 240, height: 40, background: color, opacity: 0.7 }} />
            <div style={{ width: 300, height: 40, background: color, opacity: 0.6 }} />
        </div>
    );

    const renderIceberg = () => (
        <div ref={elementRef} style={{ position: 'relative', width: 400, height: 500, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Visible Tip */}
            <div style={{
                width: 150, height: 100, background: '#e0f2fe',
                clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
                zIndex: 10
            }} />

            {/* Water Line */}
            <div className="water-level" style={{ width: '600px', height: '4px', background: '#3b82f6', margin: '10px 0', zIndex: 20 }} />

            {/* Hidden Mass */}
            <div className="hidden-part" style={{
                width: 350, height: 350, background: '#1e3a8a',
                clipPath: 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)',
                opacity: 0.8,
                display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#60a5fa', fontWeight: 'bold'
            }}>
                SUBCONSCIOUS
            </div>
        </div>
    );

    return (
        <div ref={container} style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {type === 'brain_wireframe' && renderBrain()}
            {type === 'pyramid_maslow' && renderPyramid()}
            {type === 'iceberg' && renderIceberg()}
        </div>
    );
};
