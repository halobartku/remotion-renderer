import React, { useRef, useLayoutEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

type GeomapProps = {
    type: 'dots' | 'highlight' | 'trade_route';
    highlightCountry?: string; // 'USA', 'CHN', 'EUR', 'JPN' (simplified for demo)
    color?: string;
};

export const Geomap: React.FC<GeomapProps> = ({
    type = 'dots',
    highlightCountry = 'USA',
    color = '#10b981'
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    // Simplified paths for demo (would be real geoJSON paths in prod)
    const paths = {
        USA: "M 150 150 L 300 150 L 300 250 L 150 250 Z",
        CHN: "M 600 180 L 750 180 L 750 280 L 600 280 Z",
        EUR: "M 450 120 L 520 120 L 520 180 L 450 180 Z",
        JPN: "M 800 180 L 820 180 L 820 220 L 800 220 Z",
        World: "M 50 100 H 900 V 500 H 50 Z" // Fallback box
    };

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        // --- DOTS (Servers/Nodes) ---
        if (type === 'dots') {
            const dots = svgRef.current?.querySelectorAll('.node-dot');
            if (dots) {
                tl.current.from(dots, {
                    scale: 0, opacity: 0, stagger: { amount: 1, grid: [3, 3], from: "center" }, ease: "back.out"
                });
                tl.current.to(dots, {
                    scale: 1.5, opacity: 0, duration: 1, repeat: -1, yoyo: false, stagger: { amount: 1, grid: [3, 3] }
                });
            }
        }

        // --- HIGHLIGHT COUNTRY ---
        else if (type === 'highlight') {
            const countryPath = svgRef.current?.querySelector(`#country-${highlightCountry}`);
            if (countryPath) {
                tl.current.fromTo(countryPath,
                    { fill: '#1e293b', scale: 1 },
                    { fill: color, scale: 1.05, transformOrigin: 'center', duration: 1, ease: 'power2.out' }
                );
            }
        }

        // --- TRADE ROUTE (Arc Line) ---
        else if (type === 'trade_route') {
            const route = svgRef.current?.querySelector('.route-line');
            if (route) {
                const len = (route as SVGPathElement).getTotalLength();
                tl.current.fromTo(route,
                    { strokeDasharray: len, strokeDashoffset: len },
                    { strokeDashoffset: 0, duration: 2, ease: 'power1.inOut' }
                );
            }
        }

    }, { scope: container, dependencies: [type, highlightCountry] });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    return (
        <div ref={container} style={{ width: '100%', height: '100%', background: '#0f172a' }}>
            <svg ref={svgRef} viewBox="0 0 960 540" style={{ width: '100%', height: '100%' }}>
                {/* Background Map - Abstract Dots */}
                {Array.from({ length: 50 }).map((_, i) => (
                    <circle key={i} className="node-dot"
                        cx={Math.random() * 960} cy={Math.random() * 540} r={2} fill="#334155"
                    />
                ))}

                {/* Country Shapes (Placeholder Blocks for now) */}
                <path id="country-USA" d={paths.USA} fill="#1e293b" stroke="#334155" strokeWidth="1" />
                <path id="country-CHN" d={paths.CHN} fill="#1e293b" stroke="#334155" strokeWidth="1" />
                <path id="country-EUR" d={paths.EUR} fill="#1e293b" stroke="#334155" strokeWidth="1" />
                <path id="country-JPN" d={paths.JPN} fill="#1e293b" stroke="#334155" strokeWidth="1" />

                {/* Trade Route Line (Curved) */}
                {type === 'trade_route' && (
                    <path className="route-line"
                        d="M 225 200 Q 450 50 675 230"
                        fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
                    />
                )}
            </svg>
            <div style={{ position: 'absolute', bottom: 20, left: 20, color: '#fff', fontFamily: 'monospace' }}>
                GEO-DATA: {highlightCountry}
            </div>
        </div>
    );
};
