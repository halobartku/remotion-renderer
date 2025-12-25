import React, { useRef, useLayoutEffect } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

type KineticTypeProps = {
    text: string;
    subText?: string;
    type: 'hero' | 'quote' | 'typewriter' | 'counter' | 'warning';
    color?: string;
    fontSize?: number;
    valStart?: number; // For counter
    valEnd?: number;   // For counter
    prefix?: string;   // For counter (e.g. "$")
    suffix?: string;   // For counter (e.g. "%")
};

export const KineticType: React.FC<KineticTypeProps> = ({
    text,
    subText,
    type = 'hero',
    color = '#fff',
    fontSize = 80,
    valStart = 0,
    valEnd = 100,
    prefix = '',
    suffix = ''
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const mainTextRef = useRef<HTMLHeadingElement>(null);
    const subTextRef = useRef<HTMLParagraphElement>(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        // --- HERO TITLE ---
        if (type === 'hero') {
            // Split text into words for stagger effect
            const words = mainTextRef.current?.innerText.split(' ') || [];
            if (mainTextRef.current) mainTextRef.current.innerHTML = words.map(w => `<span style="display:inline-block">${w}&nbsp;</span>`).join('');

            tl.current.fromTo(mainTextRef.current?.children || [],
                { y: 100, opacity: 0, rotateX: -90 },
                { y: 0, opacity: 1, rotateX: 0, stagger: 0.1, duration: 1, ease: 'back.out(1.7)' }
            );

            if (subTextRef.current) {
                tl.current.from(subTextRef.current, { opacity: 0, y: 20, duration: 0.8, ease: 'power2.out' }, "-=0.5");
            }
        }

        // --- TYPEWRITER ---
        else if (type === 'typewriter') {
            if (mainTextRef.current) {
                tl.current.to(mainTextRef.current, {
                    text: { value: text, delimiter: "" }, // Requires TextPlugin, but we'll use simple stepping for now to avoid extra deps if poss
                    duration: text.length * 0.05,
                    ease: "none",
                });
                // Fallback manual typewriter if TextPlugin missing
                // Actually safer to assume no TextPlugin for now to keep it lightweight
                const chars = text.split('');
                mainTextRef.current.innerText = '';
                chars.forEach((char, i) => {
                    tl.current?.set(mainTextRef.current, { innerText: text.substring(0, i + 1) }, i * 0.05);
                });
            }
        }

        // --- COUNTER ---
        else if (type === 'counter') {
            const proxy = { val: valStart };
            tl.current.to(proxy, {
                val: valEnd,
                duration: 2,
                ease: 'power3.out',
                onUpdate: () => {
                    if (mainTextRef.current) {
                        mainTextRef.current.innerText = `${prefix}${proxy.val.toFixed(0)}${suffix}`;
                    }
                }
            });
        }

        // --- WARNING ---
        else if (type === 'warning') {
            tl.current.fromTo(container.current,
                { backgroundColor: 'rgba(255,0,0,0)' },
                { backgroundColor: 'rgba(255,0,0,0.2)', duration: 0.5, yoyo: true, repeat: 5 }
            );
            tl.current.from(mainTextRef.current, { scale: 2, opacity: 0, duration: 0.5, ease: 'elastic.out' }, 0);
        }

    }, { scope: container, dependencies: [type, text] });

    // Sync to Remotion Frame
    useLayoutEffect(() => {
        if (tl.current) {
            tl.current.seek(frame / fps);
        }
    }, [frame, fps]);

    return (
        <div ref={container} style={{
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            fontFamily: 'system-ui, sans-serif',
            textAlign: 'center'
        }}>
            <h1 ref={mainTextRef} style={{
                color: type === 'warning' ? '#ff4444' : color,
                fontSize: `${fontSize}px`,
                fontWeight: 800,
                margin: 0,
                textTransform: type === 'hero' ? 'uppercase' : 'none',
                letterSpacing: '-0.02em',
                textShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
                {type === 'counter' ? `${prefix}${valStart}${suffix}` : type === 'typewriter' ? '' : text}
            </h1>
            {subText && (
                <p ref={subTextRef} style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: `${fontSize * 0.4}px`,
                    marginTop: '20px',
                    fontWeight: 400
                }}>
                    {subText}
                </p>
            )}
        </div>
    );
};
