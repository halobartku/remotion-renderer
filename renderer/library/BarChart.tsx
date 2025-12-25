import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { THEME, STYLES } from './theme';

type BarDataItem = {
    label: string;
    value: number;
    color?: string; // Optional override
};

type BarChartProps = {
    data: BarDataItem[];
    color?: string;
    height?: number;
    width?: number;
    title?: string;
    yAxisFormatter?: (value: number) => string;
    animationDuration?: number;
};

export const BarChart: React.FC<BarChartProps> = ({
    data = [
        { label: 'Q1', value: 30 },
        { label: 'Q2', value: 50 },
        { label: 'Q3', value: 45 },
        { label: 'Q4', value: 80 },
    ],
    color = THEME.colors.blue,
    height = 500,
    width = 900,
    title,
    yAxisFormatter = (val) => val.toLocaleString(),
    animationDuration = 1.5
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    // Calculate layout
    const { maxVal, gridLines, barWidth, gap } = useMemo(() => {
        const vals = data.map(d => d.value);
        const max = Math.max(...vals) * 1.2; // 20% headroom

        // Generate 5 grid lines
        const lines = [];
        for (let i = 0; i <= 4; i++) {
            lines.push(max * (i / 4));
        }

        const effectiveWidth = width - 60; // 60px for Y-axis
        const totalGapSpace = effectiveWidth * 0.2; // 20% of width for gaps
        const singleGap = totalGapSpace / (data.length + 1);
        const barW = (effectiveWidth - totalGapSpace) / data.length;

        return { maxVal: max, gridLines: lines, barWidth: barW, gap: singleGap };
    }, [data, width]);

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        // Animate Bars Staggered
        tl.current.from('.bar-rect', {
            scaleY: 0,
            transformOrigin: 'bottom',
            duration: animationDuration,
            stagger: 0.1,
            ease: 'power3.out'
        });

        // Animate Labels
        tl.current.from('.axis-label', {
            opacity: 0,
            y: 10,
            duration: 0.5,
            ease: 'power2.out',
            stagger: 0.05
        }, 0.5);

    }, { scope: container, dependencies: [data] });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    return (
        <div ref={container} style={{
            width, height, position: 'relative',
            fontFamily: THEME.typography.fontFamily
        }}>
            {/* Title */}
            {title && (
                <div style={{
                    position: 'absolute', top: -40, left: 0,
                    ...THEME.typography.header, fontSize: 24, color: THEME.colors.white
                }}>
                    {title}
                </div>
            )}

            {/* Chart Area */}
            <div style={{
                position: 'relative', width: '100%', height: '100%',
                borderLeft: `1px solid ${THEME.colors.border}`,
                borderBottom: `1px solid ${THEME.colors.border}`
            }}>

                {/* Grid Lines */}
                {gridLines.map((val, i) => {
                    const y = height - (val / maxVal) * height;
                    return (
                        <div key={i} style={{ position: 'absolute', left: 0, width: '100%', top: y, height: 1, pointerEvents: 'none' }}>
                            <div style={{
                                width: '100%', height: '1px',
                                background: THEME.colors.border,
                                opacity: 0.5
                            }} />
                            <div style={{
                                position: 'absolute', left: -50, top: -8, width: 40,
                                textAlign: 'right', fontSize: 11, color: THEME.colors.gray[500],
                                fontFamily: THEME.typography.mono.fontFamily
                            }}>
                                {yAxisFormatter(Math.round(val))}
                            </div>
                        </div>
                    );
                })}

                {/* Bars */}
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'flex-end',
                    paddingLeft: gap
                }}>
                    {data.map((d, i) => {
                        const h = (d.value / maxVal) * 100;
                        return (
                            <div key={i} style={{
                                width: barWidth, height: '100%',
                                marginRight: gap,
                                position: 'relative',
                                display: 'flex', alignItems: 'flex-end'
                            }}>
                                <div className="bar-rect" style={{
                                    width: '100%', height: `${h}%`,
                                    background: d.color || color,
                                    borderRadius: '4px 4px 0 0',
                                    boxShadow: `0 0 20px ${d.color || color}33`
                                }} />

                                <div className="axis-label" style={{
                                    position: 'absolute', bottom: -30, left: 0, width: '100%',
                                    textAlign: 'center', fontSize: 13, fontWeight: 600,
                                    color: THEME.colors.gray[300]
                                }}>
                                    {d.label}
                                </div>

                                <div className="axis-label" style={{
                                    position: 'absolute', bottom: `${h}%`, left: 0, width: '100%',
                                    marginBottom: 8,
                                    textAlign: 'center', fontSize: 14, fontWeight: 700,
                                    color: THEME.colors.white
                                }}>
                                    { /* Value Label on top of bar */}
                                    {yAxisFormatter(d.value)}
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
};
