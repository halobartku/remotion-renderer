import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { THEME } from './theme';

type Point = { x: string | number; y: number };

type LineChartProps = {
    data: Point[];
    color?: string;
    height?: number;
    width?: number;
    title?: string;
    area?: boolean; // Filled area below line
    yAxisFormatter?: (value: number) => string;
};

export const LineChart: React.FC<LineChartProps> = ({
    data = [
        { x: 'Jan', y: 100 },
        { x: 'Feb', y: 120 },
        { x: 'Mar', y: 110 },
        { x: 'Apr', y: 140 },
        { x: 'May', y: 180 },
    ],
    color = THEME.colors.blue,
    height = 500,
    width = 900,
    title,
    area = true,
    yAxisFormatter = (val) => val.toLocaleString(),
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const pathRef = useRef<SVGPathElement>(null);
    const areaRef = useRef<SVGPathElement>(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    const { min, max, points, pathD, areaD, labels, xLabels } = useMemo(() => {
        const yVals = data.map(d => d.y);
        const minVal = Math.min(...yVals) * 0.9;
        const maxVal = Math.max(...yVals) * 1.1;
        const range = maxVal - minVal;

        const chartW = width - 60;
        const chartH = height - 40;

        const pts = data.map((d, i) => {
            const x = (i / (data.length - 1)) * chartW;
            const y = chartH - ((d.y - minVal) / range) * chartH;
            return { x, y, origX: d.x, origY: d.y };
        });

        let d = `M ${pts[0].x} ${pts[0].y}`;
        // Simple smoothing (could use bezier, but linear is clearer for financial sometimes)
        // Let's do basic catmull-rom or just straight lines for now for precision.
        // Actually, let's use straight lines for financial accuracy unless requested otherwise.
        for (let i = 1; i < pts.length; i++) {
            d += ` L ${pts[i].x} ${pts[i].y}`;
        }

        const areaPath = `${d} L ${chartW} ${chartH} L 0 ${chartH} Z`;

        // Y Axis Labels
        const lbls = [];
        for (let i = 0; i <= 4; i++) {
            const val = minVal + (range * (i / 4));
            lbls.push({ y: chartH - (i / 4) * chartH, val });
        }

        return { min: minVal, max: maxVal, points: pts, pathD: d, areaD: areaPath, labels: lbls, xLabels: pts };
    }, [data, width, height]);

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        // Draw Line
        if (pathRef.current) {
            const len = pathRef.current.getTotalLength();
            tl.current.set(pathRef.current, { strokeDasharray: len, strokeDashoffset: len });
            tl.current.to(pathRef.current, { strokeDashoffset: 0, duration: 2, ease: 'power3.out' });
        }

        // Reveal Area
        if (area && areaRef.current) {
            tl.current.fromTo(areaRef.current, { opacity: 0 }, { opacity: 0.2, duration: 1 }, 0.5);
        }

        // Points
        tl.current.from('.chart-point', { scale: 0, duration: 0.5, stagger: 0.1, ease: 'back.out' }, 1);

    }, { scope: container, dependencies: [data] });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    return (
        <div ref={container} style={{ width, height, position: 'relative', fontFamily: THEME.typography.fontFamily }}>
            {title && (
                <div style={{
                    position: 'absolute', top: -40, left: 0,
                    ...THEME.typography.header, fontSize: 24, color: THEME.colors.white
                }}>
                    {title}
                </div>
            )}

            <svg width={width} height={height} style={{ overflow: 'visible' }}>
                <defs>
                    <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>

                {/* Grid */}
                {labels.map((l, i) => (
                    <g key={i}>
                        <line x1={0} y1={l.y} x2={width - 60} y2={l.y} stroke={THEME.colors.border} />
                        <text x={width - 50} y={l.y + 4} fill={THEME.colors.gray[500]} fontSize={11} fontFamily={THEME.typography.mono.fontFamily}>
                            {yAxisFormatter(l.val)}
                        </text>
                    </g>
                ))}

                {/* Area */}
                {area && (
                    <path ref={areaRef} d={areaD} fill={`url(#grad-${color})`} />
                )}

                {/* Line */}
                <path ref={pathRef} d={pathD} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

                {/* Points & X-Labels */}
                {points.map((p, i) => (
                    <g key={i}>
                        <circle className="chart-point" cx={p.x} cy={p.y} r={4} fill={THEME.colors.white} stroke={color} strokeWidth={2} />
                        {/* X Label */}
                        <text x={p.x} y={height + 20} textAnchor="middle" fill={THEME.colors.gray[400]} fontSize={12} fontFamily={THEME.typography.fontFamily}>
                            {p.origX}
                        </text>
                    </g>
                ))}

            </svg>
        </div>
    );
};
