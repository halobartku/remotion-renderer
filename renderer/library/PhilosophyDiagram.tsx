import React, { useRef, useLayoutEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { THEME } from './theme';

type PhilosophyDiagramProps = {
    type: 'venn_diagram' | 'balance_scale' | 'flowchart_logic';
    labelA?: string;
    labelB?: string;
};

export const PhilosophyDiagram: React.FC<PhilosophyDiagramProps> = ({
    type = 'venn_diagram',
    labelA = "PASSION",
    labelB = "MONEY"
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        // --- VENN DIAGRAM (Merge) ---
        if (type === 'venn_diagram') {
            tl.current.from('.circle-a', { x: -100, opacity: 0, duration: 1.5, ease: 'back.out' });
            tl.current.from('.circle-b', { x: 100, opacity: 0, duration: 1.5, ease: 'back.out' }, 0.2);
            tl.current.from('.intersection-label', { opacity: 0, scale: 0, duration: 0.5 }, 1.2);
        }

        // --- BALANCE SCALE (Tipping) ---
        else if (type === 'balance_scale') {
            tl.current.from('.scale-beam', { rotation: 0, duration: 2, ease: 'elastic.out(1, 0.3)' });
            tl.current.to('.scale-beam', { rotation: -15, duration: 2, ease: 'power2.inOut' }, 0); // Tip left
            tl.current.from('.plate', { y: -50, opacity: 0, duration: 1 }, 0);
        }

        // --- FLOWCHART (Path) ---
        else if (type === 'flowchart_logic') {
            tl.current.from('.box', { scale: 0, opacity: 0, stagger: 0.5, duration: 0.5, ease: 'back.out' });
            tl.current.from('.arrow', { scaleY: 0, transformOrigin: 'top', duration: 0.5, stagger: 0.5 }, 0.3);
        }

    }, { scope: container, dependencies: [type] });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    // RENDER HELPERS
    const renderVenn = () => (
        <div style={{ position: 'relative', width: 600, height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: THEME.typography.fontFamily }}>
            <div className="circle-a" style={{
                position: 'absolute', left: 50, width: 300, height: 300,
                borderRadius: '50%', background: THEME.colors.blue, opacity: 0.6, display: 'flex', justifyContent: 'center', alignItems: 'center',
                fontSize: '24px', fontWeight: 'bold', color: THEME.colors.white
            }}>
                {labelA}
            </div>
            <div className="circle-b" style={{
                position: 'absolute', right: 50, width: 300, height: 300,
                borderRadius: '50%', background: THEME.colors.rose, opacity: 0.6, display: 'flex', justifyContent: 'center', alignItems: 'center',
                fontSize: '24px', fontWeight: 'bold', color: THEME.colors.white
            }}>
                {labelB}
            </div>
            <div className="intersection-label" style={{ zIndex: 10, color: THEME.colors.white, fontWeight: 'bold' }}>Success</div>
        </div>
    );

    const renderScale = () => (
        <div style={{ position: 'relative', width: 400, height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: THEME.typography.fontFamily }}>
            {/* Base */}
            <div style={{ width: 10, height: 200, background: THEME.colors.white, marginTop: 100 }} />
            <div style={{ width: 100, height: 10, background: THEME.colors.white }} />

            {/* Beam Group (Rotates) */}
            <div className="scale-beam" style={{ position: 'absolute', top: 100, width: 300, height: 10, background: THEME.colors.white }}>
                {/* Left Plate */}
                <div className="plate" style={{ position: 'absolute', left: 0, top: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 2, height: 80, background: THEME.colors.white }} />
                    <div style={{ width: 80, height: 10, background: THEME.colors.white, borderRadius: '0 0 40px 40px' }} />
                    <div style={{ marginTop: 10, color: THEME.colors.white }}>{labelA}</div>
                </div>
                {/* Right Plate */}
                <div className="plate" style={{ position: 'absolute', right: 0, top: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 2, height: 80, background: THEME.colors.white }} />
                    <div style={{ width: 80, height: 10, background: THEME.colors.white, borderRadius: '0 0 40px 40px' }} />
                    <div style={{ marginTop: 10, color: THEME.colors.white }}>{labelB}</div>
                </div>
            </div>
        </div>
    );

    const renderFlowchart = () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', fontFamily: THEME.typography.fontFamily }}>
            <div className="box" style={{ padding: '20px', border: `2px solid ${THEME.colors.white}`, borderRadius: '10px', color: THEME.colors.white }}>PROBLEM</div>
            <div className="arrow" style={{ width: 2, height: 30, background: THEME.colors.white }} />
            <div className="box" style={{ padding: '20px', border: `2px solid ${THEME.colors.white}`, borderRadius: '10px', color: THEME.colors.white, transform: 'rotate(45deg)' }}>
                <div style={{ transform: 'rotate(-45deg)' }}>DECISION</div>
            </div>
            <div className="arrow" style={{ width: 2, height: 30, background: THEME.colors.white }} />
            <div style={{ display: 'flex', gap: '50px' }}>
                <div className="box" style={{ padding: '20px', background: THEME.colors.emerald, borderRadius: '10px', color: THEME.colors.white }}>YES</div>
                <div className="box" style={{ padding: '20px', background: THEME.colors.rose, borderRadius: '10px', color: THEME.colors.white }}>NO</div>
            </div>
        </div>
    );

    return (
        <div ref={container} style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {type === 'venn_diagram' && renderVenn()}
            {type === 'balance_scale' && renderScale()}
            {type === 'flowchart_logic' && renderFlowchart()}
        </div>
    );
};
