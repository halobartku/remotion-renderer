import React, { useRef, useLayoutEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { THEME } from './theme';

type DataVizProps = {
    type: 'radar' | 'heatmap' | 'distribution_bell';
    data?: number[]; // For Radar (5-6 points)
    labels?: string[];
    color?: string;
};

export const DataViz: React.FC<DataVizProps> = ({
    type = 'radar',
    data = [80, 40, 90, 20, 60],
    labels = ["IQ", "EQ", "Risk", "Patience", "Luck"],
    color = THEME.colors.purple
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        // --- RADAR CHART (Pentagon Growth) ---
        if (type === 'radar') {
            const ctx = canvasRef.current?.getContext('2d');
            const center = { x: 300, y: 300 };
            const radius = 200;

            const drawRadar = (progress: number) => {
                if (!ctx) return;
                ctx.clearRect(0, 0, 600, 600);

                // Draw Web
                ctx.strokeStyle = THEME.colors.gray[700];
                ctx.lineWidth = 2;
                [0.2, 0.4, 0.6, 0.8, 1].forEach(scale => {
                    ctx.beginPath();
                    for (let i = 0; i < 5; i++) {
                        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                        const x = center.x + Math.cos(angle) * (radius * scale);
                        const y = center.y + Math.sin(angle) * (radius * scale);
                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.closePath();
                    ctx.stroke();
                });

                // Draw Data
                ctx.fillStyle = `${color}44`;
                ctx.strokeStyle = color;
                ctx.lineWidth = 5;
                ctx.beginPath();
                data.forEach((val, i) => {
                    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                    const r = (val / 100) * radius * progress; // Animate radius
                    const x = center.x + Math.cos(angle) * r;
                    const y = center.y + Math.sin(angle) * r;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);

                    // Draw Label
                    if (progress === 1) {
                        const lx = center.x + Math.cos(angle) * (radius + 40);
                        const ly = center.y + Math.sin(angle) * (radius + 40);
                        ctx.fillStyle = THEME.colors.white;
                        ctx.font = `20px ${THEME.typography.mono.fontFamily.replace(/"/g, '')}`; // Remove quotes for canvas
                        ctx.fillText(labels[i] || `P${i}`, lx - 20, ly);
                    }
                });
                ctx.closePath();
                ctx.stroke();
                ctx.fillStyle = `${color}66`;
                ctx.fill();
            };

            // Animation Proxy
            const anim = { val: 0 };
            tl.current.to(anim, {
                val: 1, duration: 1.5, ease: 'elastic.out(1, 0.5)',
                onUpdate: () => drawRadar(anim.val)
            });
        }

        // --- HEATMAP (Grid Fade In) ---
        else if (type === 'heatmap') {
            tl.current.from('.heat-cell', {
                opacity: 0, scale: 0.5, stagger: { grid: [5, 5], from: 'random', amount: 1.5 }, ease: 'power2.out'
            });
        }

    }, { scope: container, dependencies: [type] });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    // RENDER HELPERS
    const renderHeatmap = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', width: 500, height: 500 }}>
            {Array.from({ length: 25 }).map((_, i) => {
                // Random hot/cold colors
                const val = Math.random();
                const cellColor = val > 0.6 ? THEME.colors.emerald : val > 0.3 ? THEME.colors.gray[700] : THEME.colors.rose;
                return (
                    <div key={i} className="heat-cell" style={{
                        background: cellColor, borderRadius: '8px',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        color: 'rgba(255,255,255,0.5)', fontSize: '12px',
                        fontFamily: THEME.typography.mono.fontFamily
                    }}>
                        {(val * 100).toFixed(0)}%
                    </div>
                );
            })}
        </div>
    );

    return (
        <div ref={container} style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {type === 'radar' && <canvas ref={canvasRef} width={600} height={600} />}
            {type === 'heatmap' && renderHeatmap()}
        </div>
    );
};
