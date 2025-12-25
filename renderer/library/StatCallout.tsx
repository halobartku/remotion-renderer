import React, { useRef, useLayoutEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { THEME } from './theme';

type StatCalloutProps = {
    value: string | number;
    label: string;
    color?: string;
    size?: 'small' | 'medium' | 'large';
    prefix?: string;
    suffix?: string;
};

export const StatCallout: React.FC<StatCalloutProps> = ({
    value,
    label,
    color = THEME.colors.gold,
    size = 'medium',
    prefix = '',
    suffix = ''
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        // Scale Up Value
        tl.current.from('.stat-value', {
            scale: 0.5,
            opacity: 0,
            duration: 0.8,
            ease: 'back.out(1.7)'
        });

        // Slide Up Label
        tl.current.from('.stat-label', {
            y: 20,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out'
        }, 0.2);

        // Decoration Line
        tl.current.from('.stat-line', {
            scaleX: 0,
            duration: 0.8,
            ease: 'power3.inOut'
        }, 0);

    }, { scope: container });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    const getSize = () => {
        switch (size) {
            case 'large': return { val: 120, lbl: 24 };
            case 'small': return { val: 48, lbl: 14 };
            default: return { val: 80, lbl: 18 }; // medium
        }
    };

    const { val: valSize, lbl: lblSize } = getSize();

    return (
        <div ref={container} style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'flex-start', // Stat usually align left
            fontFamily: THEME.typography.fontFamily
        }}>
            <div className="stat-value" style={{
                fontSize: valSize,
                fontWeight: 800,
                color: color,
                lineHeight: 1,
                letterSpacing: '-0.05em'
            }}>
                {prefix}{value}{suffix}
            </div>

            <div className="stat-line" style={{
                width: '100%', height: 4,
                background: color,
                margin: '10px 0',
                transformOrigin: 'left'
            }} />

            <div className="stat-label" style={{
                fontSize: lblSize,
                fontWeight: 600,
                color: THEME.colors.gray[300],
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
            }}>
                {label}
            </div>
        </div>
    );
};
