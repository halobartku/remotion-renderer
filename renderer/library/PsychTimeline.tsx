import React, { useRef, useLayoutEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

type PsychTimelineProps = {
    type: 'year_flip' | 'countdown' | 'progress_bar';
    start: number; // e.g. 1990
    end: number;   // e.g. 2023
    duration?: number;
    color?: string;
    label?: string;
};

export const PsychTimeline: React.FC<PsychTimelineProps> = ({
    type = 'year_flip',
    start = 2000,
    end = 2025,
    duration = 3,
    color = '#3b82f6',
    label = ''
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const textRef = useRef<HTMLDivElement>(null);
    const barRef = useRef<HTMLDivElement>(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        if (type === 'year_flip' || type === 'countdown') {
            const proxy = { val: start };
            tl.current.to(proxy, {
                val: end,
                duration: duration,
                ease: 'none', // Linear time usually best for years, or power2.in for acceleration
                onUpdate: () => {
                    if (textRef.current) textRef.current.innerText = Math.floor(proxy.val).toString();
                }
            });
            // Add a little "slam" effect at the end
            tl.current.to(textRef.current, { scale: 1.5, color: '#ef4444', duration: 0.2, ease: 'back.out' });
        }
        else if (type === 'progress_bar') {
            if (barRef.current) {
                tl.current.fromTo(barRef.current,
                    { width: '0%' },
                    { width: '100%', duration: duration, ease: 'power1.inOut' }
                );
            }
        }

    }, { scope: container, dependencies: [type, start, end] });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    return (
        <div ref={container} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            {/* Year / Countdown Display */}
            {(type === 'year_flip' || type === 'countdown') && (
                <div style={{ position: 'relative', textAlign: 'center' }}>
                    <div ref={textRef} style={{ fontSize: '120px', fontWeight: '900', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
                        {start}
                    </div>
                    {label && <div style={{ fontSize: '24px', letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>{label}</div>}
                </div>
            )}

            {/* Progress Bar */}
            {type === 'progress_bar' && (
                <div style={{ width: '80%', height: '40px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <div ref={barRef} style={{ width: '0%', height: '100%', backgroundColor: color, boxShadow: `0 0 20px ${color}` }} />
                    {label && <div style={{ marginTop: 10, textAlign: 'center', color: '#fff' }}>{label}</div>}
                </div>
            )}
        </div>
    );
};
