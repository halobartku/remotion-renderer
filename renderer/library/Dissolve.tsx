import React, { useRef, useLayoutEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

type DissolveProps = {
    children: React.ReactNode;
    reverse?: boolean; // If true, fade OUT
    duration?: number;
    delay?: number;
};

export const Dissolve: React.FC<DissolveProps> = ({
    children,
    reverse = false,
    duration = 1,
    delay = 0
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        if (!reverse) {
            tl.current.from(container.current, { opacity: 0, duration: duration, ease: 'power2.inOut' }, delay);
        } else {
            tl.current.to(container.current, { opacity: 0, duration: duration, ease: 'power2.inOut' }, delay);
        }

    }, { scope: container, dependencies: [reverse, duration, delay] });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    return (
        <div ref={container} style={{ width: '100%', height: '100%' }}>
            {children}
        </div>
    );
};
