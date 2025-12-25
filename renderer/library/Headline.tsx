import React, { useRef, useLayoutEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { THEME } from './theme';

type HeadlineProps = {
    text: string;
    level?: 1 | 2 | 3; // 1 = Title, 2 = Section, 3 = Sub
    align?: 'left' | 'center' | 'right';
    color?: string;
    animation?: 'fade' | 'slide' | 'mask';
};

export const Headline: React.FC<HeadlineProps> = ({
    text,
    level = 1,
    align = 'left',
    color = THEME.colors.white,
    animation = 'slide'
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    // Determines styles based on level
    const getStyle = () => {
        switch (level) {
            case 1: return THEME.typography.header;
            case 2: return THEME.typography.subHeader;
            case 3: return { ...THEME.typography.subHeader, fontSize: 24 }; // Smaller sub
            default: return THEME.typography.header;
        }
    };

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        if (animation === 'slide') {
            tl.current.from('.char', {
                y: 100,
                opacity: 0,
                stagger: 0.03,
                duration: 0.8,
                ease: 'power3.out'
            });
        }
        else if (animation === 'fade') {
            tl.current.from(container.current, { opacity: 0, duration: 1 });
        }
        else if (animation === 'mask') {
            tl.current.from('.char', {
                y: '100%',
                duration: 0.8,
                stagger: 0.02,
                ease: 'circ.out'
            });
        }

    }, { scope: container, dependencies: [text, animation] });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    // Split text into characters for fine-grained animation
    const chars = text.split('').map((char, i) => (
        <span key={i} className="char" style={{ display: 'inline-block' }}>
            {char === ' ' ? '\u00A0' : char}
        </span>
    ));

    return (
        <div ref={container} style={{
            width: '100%',
            textAlign: align,
            color: color,
            fontFamily: THEME.typography.fontFamily,
            ...getStyle(),
            overflow: 'hidden', // Essential for masking
            lineHeight: 1.2
        }}>
            {chars}
        </div>
    );
};
