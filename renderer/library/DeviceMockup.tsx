import React, { useRef, useLayoutEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

type DeviceMockupProps = {
    type: 'iphone_15' | 'macbook_pro';
    children?: React.ReactNode;
};

export const DeviceMockup: React.FC<DeviceMockupProps> = ({
    type = 'iphone_15',
    children
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const deviceRef = useRef<HTMLDivElement>(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        // Float Animation
        tl.current.to(deviceRef.current, {
            y: -20, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut'
        });

        // Slight Rotation
        tl.current.fromTo(deviceRef.current,
            { rotationY: -10 },
            { rotationY: 10, duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut' },
            0
        );

    }, { scope: container, dependencies: [type] });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    // HELPERS
    const renderIphone = () => (
        <div style={{
            width: 380, height: 780,
            background: '#000', borderRadius: '50px',
            border: '8px solid #333',
            boxShadow: '0 50px 100px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.2)',
            position: 'relative', overflow: 'hidden',
            transformStyle: 'preserve-3d'
        }}>
            {/* Notch */}
            <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', width: 120, height: 35, background: '#000', borderRadius: '20px', zIndex: 20 }} />

            {/* Screen Content */}
            <div style={{ width: '100%', height: '100%', overflow: 'hidden', background: '#fff' }}>
                {children || <div style={{ width: '100%', height: '100%', background: '#1e293b', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>APP CONTENT</div>}
            </div>

            {/* Reflection */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 40%)', zIndex: 10, pointerEvents: 'none' }} />
        </div>
    );

    const renderMacbook = () => (
        <div style={{
            width: 900, height: 600,
            position: 'relative', transformStyle: 'preserve-3d'
        }}>
            {/* Lid/Screen */}
            <div style={{
                width: '100%', height: 550,
                background: '#000', borderRadius: '20px 20px 0 0',
                border: '4px solid #333', borderBottom: 'none',
                boxShadow: '0 0 0 2px #555',
                overflow: 'hidden', position: 'relative'
            }}>
                <div style={{ width: '100%', height: '100%', background: '#fff' }}>
                    {children || <div style={{ width: '100%', height: '100%', background: '#1e293b', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>DESKTOP CONTENT</div>}
                </div>
                {/* Camera */}
                <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 8, height: 8, background: '#333', borderRadius: '50%' }} />
            </div>

            {/* Base */}
            <div style={{
                width: '120%', height: 30, marginLeft: '-10%',
                background: '#e2e8f0',
                transform: 'rotateX(70deg)', transformOrigin: 'top',
                borderRadius: '0 0 20px 20px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }} />
        </div>
    );

    return (
        <div ref={container} style={{
            width: '100%', height: '100%',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            perspective: 1500
        }}>
            <div ref={deviceRef}>
                {type === 'iphone_15' && renderIphone()}
                {type === 'macbook_pro' && renderMacbook()}
            </div>
        </div>
    );
};
