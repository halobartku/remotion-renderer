import React, { useRef, useLayoutEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

type NewspaperHeadlineProps = {
    text: string;
    subtext?: string;
    date?: string;
    image?: string; // Optional image URL
};

export const NewspaperHeadline: React.FC<NewspaperHeadlineProps> = ({
    text = "MARKET CRASH IMMINENT",
    subtext = "Experts warn of bubble burst",
    date = "OCTOBER 24, 1929",
    image
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const paperRef = useRef<HTMLDivElement>(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        // Spin In
        tl.current.from(paperRef.current, {
            rotation: 1080,
            scale: 0,
            opacity: 0,
            duration: 1.5,
            ease: "circ.out" // Fast then sudden stop
        });

        // Slight drift after landing
        tl.current.to(paperRef.current, {
            rotation: 5,
            scale: 1.05,
            duration: 3,
            ease: "sine.inOut"
        });

    }, { scope: container, dependencies: [text] });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    return (
        <div ref={container} style={{
            width: '100%', height: '100%',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            background: 'rgba(0,0,0,0.8)'
        }}>
            <div ref={paperRef} style={{
                width: 600, height: 800,
                backgroundColor: '#f1f5f9', // Paper white
                color: '#000',
                padding: '40px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                textAlign: 'center',
                fontFamily: '"Times New Roman", serif',
                filter: 'sepia(0.3)' // Old paper look
            }}>
                <div style={{
                    borderBottom: '3px double #000', width: '100%',
                    display: 'flex', justifyContent: 'space-between', marginBottom: '20px',
                    fontSize: '12px', fontWeight: 'bold'
                }}>
                    <span>THE DAILY CHRONICLE</span>
                    <span>{date}</span>
                    <span>VOL. 1</span>
                </div>

                <h1 style={{
                    fontSize: '60px', lineHeight: 1, margin: '20px 0',
                    textTransform: 'uppercase', letterSpacing: '-2px'
                }}>
                    {text}
                </h1>

                <div style={{ width: '100%', height: '2px', background: '#000', marginBottom: '20px' }} />

                <h3 style={{ fontStyle: 'italic', marginBottom: '30px' }}>
                    {subtext}
                </h3>

                {image ? (
                    <img src={image} style={{ width: '100%', height: '300px', objectFit: 'cover', filter: 'grayscale(100%)' }} />
                ) : (
                    <div style={{
                        width: '100%', height: '300px', background: '#cbd5e1',
                        display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }}>
                        [PHOTO]
                    </div>
                )}

                <p style={{ marginTop: '20px', fontSize: '10px', textAlign: 'justify', columnCount: 2 }}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.
                </p>
            </div>
        </div>
    );
};
