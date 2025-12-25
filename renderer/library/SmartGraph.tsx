import React, { useRef, useLayoutEffect, useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

type OHLC = { o: number; h: number; l: number; c: number };

type SmartGraphProps = {
    data: number[] | OHLC[]; // Support simple numbers or OHLC
    labels?: string[];
    type: 'line' | 'bar' | 'area' | 'candlestick';
    color?: string; // Main color or 'auto' for candles
    lineThickness?: number;
    showGrid?: boolean;
    title?: string;
    width?: number;
    height?: number;
    markers?: { x: number; label: string; color?: string }[]; // Vertical lines
    arrowTrend?: { startIdx: number; endIdx: number; color?: string }; // Arrow overlay
};

export const SmartGraph: React.FC<SmartGraphProps> = ({
    data = [10, 40, 30, 70, 50, 90],
    labels,
    type = 'line',
    color = '#10b981',
    lineThickness = 4,
    showGrid = true,
    title,
    width = 800,
    height = 500,
    markers = [],
    arrowTrend
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const pathRef = useRef<SVGPathElement>(null);
    const barsRef = useRef<SVGGElement>(null);
    const candlesRef = useRef<SVGGElement>(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    // Normalize Data with Tighter Scaling
    const { points, candles, maxVal, minVal, yLabels } = useMemo(() => {
        let allValues: number[] = [];
        if (typeof data[0] === 'number') allValues = data as number[];
        else {
            (data as OHLC[]).forEach(d => allValues.push(d.l, d.h));
        }

        const realMax = Math.max(...allValues);
        const realMin = Math.min(...allValues);
        const diff = realMax - realMin;
        const padding = diff * 0.15; // 15% padding total (tight)

        const max = realMax + padding / 2;
        const min = realMin - padding / 2;
        const range = max - min || 1;

        const getY = (val: number) => height - ((val - min) / range) * height;
        const getX = (i: number) => (i / (data.length - 1 || 1)) * (width - 60); // Reserve 60px for Y-axis

        // Generate 5 Y-axis labels
        const labels = [];
        for (let i = 0; i <= 4; i++) {
            const val = min + (range * (i / 4));

            // Format label (K/M or comma)
            let formatted = Math.round(val).toLocaleString();
            if (val > 1000000) formatted = (val / 1000000).toFixed(1) + 'M';
            else if (val > 1000) formatted = (val / 1000).toFixed(1) + 'K';

            labels.push({
                y: height - (i / 4) * height,
                val: formatted
            });
        }

        if (type === 'candlestick') {
            const candlePts = (data as OHLC[]).map((d, i) => ({
                x: getX(i) + ((width - 60) / data.length) / 2,
                o: getY(d.o),
                h: getY(d.h),
                l: getY(d.l),
                c: getY(d.c),
                isGreen: d.c >= d.o
            }));
            return { points: [], candles: candlePts, maxVal: max, minVal: min, yLabels: labels };
        } else {
            const pts = (data as number[]).map((val, i) => ({ x: getX(i), y: getY(val) }));
            return { points: pts, candles: [], maxVal: max, minVal: min, yLabels: labels };
        }
    }, [data, width, height, type]);

    // Path D generation
    const pathD = useMemo(() => {
        if (type === 'candlestick' || type === 'bar') return '';
        if (points.length === 0) return '';
        let d = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            d += ` L ${points[i].x} ${points[i].y}`;
        }
        if (type === 'area') d += ` L ${width - 60} ${height} L 0 ${height} Z`;
        return d;
    }, [points, type, width, height]);

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        // Container Fade In
        tl.current.from(container.current, { opacity: 0, scale: 0.98, duration: 1.2, ease: 'power3.out' }, 0);

        if (type === 'line' || type === 'area') {
            if (pathRef.current) {
                const len = pathRef.current.getTotalLength();
                tl.current.set(pathRef.current, { strokeDasharray: len, strokeDashoffset: len });
                tl.current.to(pathRef.current, { strokeDashoffset: 0, duration: 2, ease: 'power3.out' });
                if (type === 'area') {
                    tl.current.fromTo(pathRef.current, { fillOpacity: 0 }, { fillOpacity: 0.3, duration: 1 }, "-=1.5");
                }
            }
        }
        else if (type === 'candlestick' && candlesRef.current) {
            tl.current.from(candlesRef.current.children, {
                scaleY: 0,
                opacity: 0,
                transformOrigin: 'center center',
                stagger: { amount: 1 }, // Distribute 1s across all candles
                duration: 0.8,
                ease: 'back.out(1.4)' // slight overshoot
            });
        }

        // Markers w/ Bounce
        if (markers.length > 0) {
            tl.current.from('.marker-line', { scaleY: 0, transformOrigin: 'bottom', duration: 0.5, stagger: 0.2, ease: 'power3.out' }, 1.5);
            tl.current.from('.marker-label', { opacity: 0, y: 15, duration: 0.5, ease: 'power3.out' }, 1.8);
        }

        // Arrow Trend - Draw animation
        if (arrowTrend) {
            tl.current.fromTo('.arrow-trend',
                { strokeDasharray: 2000, strokeDashoffset: 2000 },
                { strokeDashoffset: 0, duration: 2, ease: 'power3.inOut' },
                2);
        }

    }, { scope: container, dependencies: [type, data, markers, arrowTrend] });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    return (
        <div ref={container} style={{
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
        }}>
            {/* Glass Container Background */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, rgba(23, 23, 23, 0.8) 0%, rgba(10, 10, 10, 0.95) 100%)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(12px)',
                zIndex: 0
            }} />

            <div style={{ zIndex: 1, position: 'relative', width: width, height: height + 60, padding: '30px' }}>
                {title && (
                    <div style={{
                        position: 'absolute', top: -15, left: 30,
                        color: '#e5e7eb', fontFamily: 'Inter, system-ui, sans-serif',
                        fontSize: '22px', fontWeight: 700, letterSpacing: '-0.5px',
                        display: 'flex', alignItems: 'center', gap: '12px'
                    }}>
                        <div style={{ width: 10, height: 10, background: '#10b981', borderRadius: '50%', boxShadow: '0 0 12px #10b981' }} />
                        {title}
                    </div>
                )}

                <svg width={width} height={height} style={{ overflow: 'visible' }}>
                    <defs>
                        <filter id="glow-green-sm" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="2.5" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <filter id="glow-red-sm" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="2.5" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>

                        {/* Sharper gradients */}
                        <linearGradient id="grad-green" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#34d399" />
                            <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                        <linearGradient id="grad-red" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#f87171" />
                            <stop offset="100%" stopColor="#b91c1c" />
                        </linearGradient>

                        <marker id="arrowhead" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
                            <path d="M2,2 L10,6 L2,10 L2,2" fill={arrowTrend ? arrowTrend.color || '#ef4444' : '#ef4444'} />
                        </marker>
                    </defs>

                    {/* Grid & Axis */}
                    {showGrid && (
                        <g>
                            {yLabels.map((lbl, i) => (
                                <g key={i}>
                                    <line
                                        x1={0} y1={lbl.y} x2={width - 60} y2={lbl.y}
                                        stroke="rgba(255,255,255,0.08)" strokeWidth={1}
                                    />
                                    <text
                                        x={width - 50} y={lbl.y + 4}
                                        fill="rgba(255,255,255,0.5)"
                                        fontSize={11} fontFamily="Inter, sans-serif" fontWeight="500"
                                    >
                                        {lbl.val}
                                    </text>
                                </g>
                            ))}
                        </g>
                    )}

                    {/* Line / Area */}
                    {(type === 'line' || type === 'area') && (
                        <path ref={pathRef} d={pathD} fill={type === 'area' ? color : 'none'} stroke={color} strokeWidth={lineThickness} strokeLinecap="round" strokeLinejoin="round" filter={`drop-shadow(0 0 8px ${color}66)`} />
                    )}

                    {/* Candles */}
                    {type === 'candlestick' && (
                        <g ref={candlesRef}>
                            {candles.map((c, i) => {
                                const isGreen = c.isGreen;
                                const strokeColor = isGreen ? '#6ee7b7' : '#fca5a5';
                                const fillUrl = isGreen ? 'url(#grad-green)' : 'url(#grad-red)';

                                const wickX = c.x;

                                // Dynamic width: 75% of slot
                                const slotWidth = (width - 60) / candles.length;
                                const candleWidth = Math.max(4, slotWidth * 0.75);

                                const bodyH = Math.max(Math.abs(c.c - c.o), 3); // Min 3px
                                const bodyY = Math.min(c.o, c.c);

                                return (
                                    <g key={i}>
                                        <line x1={wickX} y1={c.h} x2={wickX} y2={c.l} stroke={strokeColor} strokeWidth={1.5} opacity={0.6} />
                                        <rect
                                            x={c.x - candleWidth / 2}
                                            y={bodyY}
                                            width={candleWidth}
                                            height={bodyH}
                                            fill={fillUrl}
                                            stroke={strokeColor}
                                            strokeWidth={1}
                                            rx={1}
                                            filter={isGreen ? 'url(#glow-green-sm)' : 'url(#glow-red-sm)'}
                                        />
                                    </g>
                                );
                            })}
                        </g>
                    )}

                    {/* Markers */}
                    {markers.map((m, i) => (
                        <g key={`m-${i}`}>
                            <line className="marker-line" x1={m.x} y1={0} x2={m.x} y2={height} stroke={m.color || '#facc15'} strokeWidth={1.5} strokeDasharray="4,4" opacity={0.6} />

                            <g className="marker-label" transform={`translate(${m.x}, -12)`}>
                                <path d="M-50,-24 L50,-24 L50,0 L6,0 L0,6 L-6,0 L-50,0 Z" fill={m.color || '#facc15'} />
                                <text x={0} y={-8} fill="#000" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="800" fontSize={11} letterSpacing="-0.2px">
                                    {m.label?.toUpperCase()}
                                </text>
                            </g>
                        </g>
                    ))}

                    {/* Arrow Trend */}
                    {arrowTrend && type === 'candlestick' && candles[arrowTrend.startIdx] && candles[arrowTrend.endIdx] && (
                        <path
                            className="arrow-trend"
                            d={`M ${candles[arrowTrend.startIdx].x} ${candles[arrowTrend.startIdx].h - 20} L ${candles[arrowTrend.endIdx].x} ${candles[arrowTrend.endIdx].l + 20}`}
                            stroke={arrowTrend.color || '#ef4444'}
                            strokeWidth={3}
                            strokeLinecap="round"
                            markerEnd="url(#arrowhead)"
                            fill="none"
                            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
                        />
                    )}

                </svg>
            </div>
        </div>
    );
};
