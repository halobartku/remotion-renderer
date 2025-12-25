import React, { useRef, useLayoutEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

type SecurityTerminalProps = {
    type: 'matrix_rain' | 'access_denied' | 'password_crack';
    text?: string;
};

export const SecurityTerminal: React.FC<SecurityTerminalProps> = ({
    type = 'password_crack',
    text = "ACCESS GRANTED"
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        // --- MATRIX RAIN (Canvas) ---
        if (type === 'matrix_rain') {
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) {
                const cols = Math.floor(1920 / 20);
                const drops = Array(cols).fill(1).map(() => Math.random() * -100);

                const anim = { val: 0 };
                tl.current.to(anim, {
                    val: 1, duration: 10, repeat: -1, ease: 'none',
                    onUpdate: () => {
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                        ctx.fillRect(0, 0, 1920, 1080);

                        ctx.fillStyle = '#10b981';
                        ctx.font = '20px monospace';

                        for (let i = 0; i < drops.length; i++) {
                            const text = String.fromCharCode(Math.random() * 128);
                            ctx.fillText(text, i * 20, drops[i] * 20);

                            if (drops[i] * 20 > 1080 && Math.random() > 0.975) {
                                drops[i] = 0;
                            }
                            drops[i]++;
                        }
                    }
                });
            }
        }

        // --- ACCESS DENIED (Flash) ---
        else if (type === 'access_denied') {
            tl.current.from('.alert-box', { scale: 0, duration: 0.5, ease: 'back.out' });
            tl.current.to('.alert-box', { background: '#ef4444', color: '#000', duration: 0.1, yoyo: true, repeat: 5 });
        }

        // --- PASSWORD CRACK (Rolling numbers) ---
        else if (type === 'password_crack') {
            tl.current.to('.crack-text', {
                text: { value: "************", newClass: "scramble" }, // Dummy GSAP text plugin logic sim
                duration: 2,
                onUpdate: function () {
                    // Manual scramble sim since we don't have TextPlugin imported fully sometimes
                    const el = document.querySelector('.crack-text');
                    if (el) {
                        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                        el.textContent = Array(10).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
                    }
                }
            });
            tl.current.to('.crack-text', { textContent: text, color: '#10b981', duration: 0.5 });
        }

    }, { scope: container, dependencies: [type] });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    return (
        <div ref={container} style={{
            width: '100%', height: '100%',
            background: '#000', color: '#10b981', fontFamily: 'monospace',
            display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden'
        }}>
            {type === 'matrix_rain' && <canvas ref={canvasRef} width={1920} height={1080} />}

            {type === 'access_denied' && (
                <div className="alert-box" style={{
                    border: '5px solid #ef4444', color: '#ef4444',
                    padding: '50px 100px', fontSize: '80px', fontWeight: 'bold',
                    background: '#000'
                }}>
                    ACCESS DENIED
                </div>
            )}

            {type === 'password_crack' && (
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '30px', marginBottom: '20px' }}>DECRYPTING...</div>
                    <div className="crack-text" style={{ fontSize: '100px', letterSpacing: '10px' }}>
                        AKX929D8AA
                    </div>
                </div>
            )}
        </div>
    );
};
