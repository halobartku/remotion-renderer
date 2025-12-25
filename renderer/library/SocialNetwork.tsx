import React, { useRef, useLayoutEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { THEME } from './theme';

type SocialNetworkProps = {
    type: 'viral_spread' | 'connected_clusters' | 'isolated_nodes';
    nodeCount?: number;
    color?: string;
};

export const SocialNetwork: React.FC<SocialNetworkProps> = ({
    type = 'viral_spread',
    nodeCount = 30,
    color = THEME.colors.blue
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        // Generate Nodes
        const nodes = Array.from({ length: nodeCount }).map(() => ({
            x: Math.random() * 1920,
            y: Math.random() * 1080,
            r: Math.random() * 5 + 3,
            infected: false,
            connections: [] as number[]
        }));

        // Connect them roughly
        nodes.forEach((node, i) => {
            nodes.forEach((other, j) => {
                const dist = Math.hypot(node.x - other.x, node.y - other.y);
                if (i !== j && dist < 300) {
                    // @ts-ignore
                    node.connections.push(j);
                }
            });
        });

        // Animation State
        const state = { spread: 0 };

        tl.current.to(state, {
            spread: 1,
            duration: 5,
            ease: 'none',
            onUpdate: () => {
                ctx.clearRect(0, 0, 1920, 1080);

                // Draw Connections First
                ctx.lineWidth = 1;
                nodes.forEach((node, i) => {
                    const isInfected = (i / nodeCount) < state.spread;
                    node.infected = isInfected;

                    node.connections.forEach(targetIdx => {
                        const target = nodes[targetIdx];
                        if (targetIdx > i) { // Draw once
                            // Connection is red if both infected
                            const isLineInfected = isInfected && target.infected;
                            ctx.strokeStyle = isLineInfected ? THEME.colors.rose : `${color}33`;
                            ctx.beginPath();
                            ctx.moveTo(node.x, node.y);
                            ctx.lineTo(target.x, target.y);
                            ctx.stroke();
                        }
                    });
                });

                // Draw Nodes
                nodes.forEach((node, i) => {
                    const isInfected = (i / nodeCount) < state.spread;
                    ctx.fillStyle = isInfected ? THEME.colors.rose : color;
                    ctx.shadowBlur = isInfected ? 15 : 0;
                    ctx.shadowColor = THEME.colors.rose;

                    ctx.beginPath();
                    ctx.arc(node.x, node.y, isInfected ? node.r * 1.5 : node.r, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                });
            }
        });

    }, { scope: container, dependencies: [type, nodeCount] });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    return (
        <div ref={container} style={{ width: '100%', height: '100%', background: THEME.colors.gray[900] }}>
            <canvas ref={canvasRef} width={1920} height={1080} style={{ width: '100%', height: '100%' }} />
            <div style={{ position: 'absolute', bottom: 40, left: 40, color: THEME.colors.white, fontFamily: THEME.typography.mono.fontFamily }}>
                VIRAL VECTORS: {nodeCount} // SPREAD DETECTED
            </div>
        </div>
    );
};
