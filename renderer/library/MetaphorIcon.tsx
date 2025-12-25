import { THEME } from './theme';

type MetaphorIconProps = {
    type: 'target' | 'shield' | 'skull' | 'lock' | 'rocket';
    color?: string;
};

export const MetaphorIcon: React.FC<MetaphorIconProps> = ({
    type = 'target',
    color = THEME.colors.white
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    // SVG PATHS
    const paths = {
        target: {
            outer: "M 100 0 A 100 100 0 1 0 100 200 A 100 100 0 1 0 100 0",
            inner: "M 100 50 A 50 50 0 1 0 100 150 A 50 50 0 1 0 100 50",
            center: "M 100 90 A 10 10 0 1 0 100 110 A 10 10 0 1 0 100 90"
        },
        shield: {
            outline: "M 100 10 C 100 10 20 40 20 100 C 20 160 100 200 100 200 C 100 200 180 160 180 100 C 180 40 100 10 100 10",
            check: "M 60 100 L 90 130 L 140 70"
        },
        lock: {
            body: "M 50 80 H 150 V 180 H 50 Z",
            shackle: "M 60 80 V 50 A 40 40 0 0 1 140 50 V 80"
        }
    };

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        const parts = container.current?.querySelectorAll('path');
        if (parts) {
            tl.current.from(parts, {
                strokeDasharray: 500,
                strokeDashoffset: 500,
                fill: 'transparent',
                duration: 1.5,
                stagger: 0.3,
                ease: 'power2.inOut'
            });
            tl.current.to(parts, { fill: color, duration: 0.5 }, 1.5);

            // Special Animation per type
            if (type === 'target') {
                // Arrow hit
                tl.current.fromTo('.arrow', { x: 500, y: -500, opacity: 1 }, { x: 100, y: 100, duration: 0.2, ease: 'power4.in' }, 1.2);
            }
        }

    }, { scope: container, dependencies: [type, color] });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    return (
        <div ref={container} style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg viewBox="0 0 200 200" style={{ width: 400, height: 400, overflow: 'visible' }}>
                {type === 'target' && (
                    <g stroke={color} strokeWidth="5" fill="none">
                        <path d={paths.target.outer} />
                        <path d={paths.target.inner} />
                        <path d={paths.target.center} fill={color} />
                        {/* Arrow */}
                        <path className="arrow" d="M 0 0 L 20 20" stroke={THEME.colors.rose} strokeWidth="8" opacity="0" />
                    </g>
                )}

                {type === 'shield' && (
                    <g stroke={color} strokeWidth="5" fill="none">
                        <path d={paths.shield.outline} />
                        <path d={paths.shield.check} stroke={THEME.colors.emerald} />
                    </g>
                )}

                {type === 'lock' && (
                    <g stroke={color} strokeWidth="5" fill="none">
                        <path d={paths.lock.shackle} />
                        <path d={paths.lock.body} />
                    </g>
                )}
            </svg>
        </div>
    );
};
