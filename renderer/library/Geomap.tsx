import React, { useRef, useLayoutEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { THEME, STYLES } from './theme';

type GeomapProps = {
    type: 'dots' | 'highlight' | 'trade_route';
    highlightCountry?: string; // 'USA', 'CHN', 'EUR', 'JPN'
    color?: string;
    title?: string;
};

export const Geomap: React.FC<GeomapProps> = ({
    type = 'dots',
    highlightCountry = 'USA',
    color = THEME.colors.emerald,
    title
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    // Simplified paths (Mock GeoJSON)
    const paths = {
        USA: "M 150 150 L 300 150 L 300 250 L 150 250 Z",
        CHN: "M 600 180 L 750 180 L 750 280 L 600 280 Z",
        EUR: "M 450 120 L 520 120 L 520 180 L 450 180 Z",
        JPN: "M 800 180 L 820 180 L 820 220 L 800 220 Z",
        World: "M 50 100 H 900 V 500 H 50 Z"
    };

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        // Container Reveal
        tl.current.from(container.current, { opacity: 0, duration: 1 }, 0);

        // --- DOTS (Servers/Nodes) ---
        if (type === 'dots') {
            const dots = svgRef.current?.querySelectorAll('.node-dot');
            if (dots) {
                // Random twinkle effect
                tl.current.fromTo(dots,
                    { opacity: 0.2, scale: 0.8 },
                    { opacity: 0.8, scale: 1.2, duration: 1.5, repeat: -1, yoyo: true, stagger: { amount: 2, grid: [5, 10], from: "random" }, ease: "sine.inOut" }
                );
            }
        }

        // --- HIGHLIGHT COUNTRY ---
        else if (type === 'highlight') {
            const countryPath = svgRef.current?.querySelector(`#country-${highlightCountry}`);
            if (countryPath) {
                tl.current.fromTo(countryPath,
                    { fill: THEME.colors.gray[700], scale: 1 },
                    { fill: color, scale: 1.05, transformOrigin: 'center', duration: 1.2, ease: 'power2.out' }
                );
                // Pulse effect
                tl.current.to(countryPath, { fillOpacity: 0.6, duration: 0.8, repeat: -1, yoyo: true, ease: "sine.inOut" }, 1.2);
            }
        }

        // --- TRADE ROUTE (Arc Line) ---
        else if (type === 'trade_route') {
            const route = svgRef.current?.querySelector('.route-line');
            if (route) {
                const len = (route as SVGPathElement).getTotalLength();
                tl.current.fromTo(route,
                    { strokeDasharray: len, strokeDashoffset: len },
                    { strokeDashoffset: 0, duration: 2.5, ease: 'power2.inOut' }
                );
            }
        }

    }, { scope: container, dependencies: [type, highlightCountry] });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    return (
        <div ref={container} style={{
            width: '100%', height: '100%',
            background: `radial-gradient(circle at center, ${THEME.colors.charcoal} 0%, ${THEME.colors.obsidian} 100%)`,
            position: 'relative'
        }}>
            {/* Grid Overlay */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: `linear-gradient(${THEME.colors.border} 1px, transparent 1px), linear-gradient(90deg, ${THEME.colors.border} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

            {title && (
                <div style={{
                    position: 'absolute', top: 30, left: 30,
                    color: THEME.colors.white, ...THEME.typography.header, fontSize: 24,
                    display: 'flex', alignItems: 'center', gap: 12
                }}>
                    <span style={{ color: color }}>●</span> {title.toUpperCase()}
                </div>
            )}

            <svg ref={svgRef} viewBox="0 0 960 540" style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>

                {/* World Map Background (Abstract) */}
                <path d={paths.World} fill="none" stroke={THEME.colors.gray[700]} strokeWidth="0.5" strokeDasharray="4 4" opacity={0.3} />

                {/* Country Shapes */}
                <path id="country-USA" d={paths.USA} fill={THEME.colors.gray[800]} stroke={THEME.colors.gray[600]} strokeWidth="1" />
                <path id="country-CHN" d={paths.CHN} fill={THEME.colors.gray[800]} stroke={THEME.colors.gray[600]} strokeWidth="1" />
                <path id="country-EUR" d={paths.EUR} fill={THEME.colors.gray[800]} stroke={THEME.colors.gray[600]} strokeWidth="1" />
                <path id="country-JPN" d={paths.JPN} fill={THEME.colors.gray[800]} stroke={THEME.colors.gray[600]} strokeWidth="1" />

                {/* Dot Grid */}
                {Array.from({ length: 80 }).map((_, i) => (
                    <circle key={i} className="node-dot"
                        cx={Math.random() * 900 + 30} cy={Math.random() * 480 + 30} r={1.5} fill={THEME.colors.gray[500]}
                    />
                ))}

                {/* Trade Route Line (Curved) */}
                {type === 'trade_route' && (
                    <path className="route-line"
                        d="M 225 200 Q 450 50 675 230"
                        fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
                        filter={`drop-shadow(0 0 8px ${color})`}
                    />
                )}
            </svg>

            <div style={{
                position: 'absolute', bottom: 30, right: 30,
                color: THEME.colors.gray[500], fontFamily: THEME.typography.mono.fontFamily, fontSize: 12
            }}>
                LAT: {highlightCountry === 'USA' ? '38.89N' : '35.67N'} | LNG: {highlightCountry === 'USA' ? '77.03W' : '139.65E'}
            </div>
        </div>
    );
};
