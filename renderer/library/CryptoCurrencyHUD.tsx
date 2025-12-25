import React, { useRef, useLayoutEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

type CryptoCurrencyHUDProps = {
    type: 'token' | 'fiat_stack' | 'wallet_hex' | 'gold_bar' | 'security_shield';
    symbol?: 'BTC' | 'ETH' | 'SOL' | 'USD';
    amount?: number;
    color?: string; // Override default colors
};

export const CryptoCurrencyHUD: React.FC<CryptoCurrencyHUDProps> = ({
    type = 'token',
    symbol = 'BTC',
    amount = 1,
    color
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const elementRef = useRef<HTMLDivElement>(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        // --- TOKEN (3D Coin Spin) ---
        if (type === 'token') {
            const coinColor = color || (symbol === 'BTC' ? '#f7931a' : symbol === 'ETH' ? '#627eea' : '#14f195');
            tl.current.fromTo(elementRef.current,
                { rotationY: -180, scale: 0, opacity: 0 },
                { rotationY: 0, scale: 1, opacity: 1, duration: 1.5, ease: 'back.out(1.2)' }
            );
            // Continuous float
            tl.current.to(elementRef.current, { y: -20, duration: 2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
        }

        // --- FIAT STACK (Growing Pile) ---
        else if (type === 'fiat_stack') {
            // Animate height of stack
            const targets = elementRef.current ? Array.from(elementRef.current.children) : [];
            if (targets.length > 0) {
                tl.current.from(targets, {
                    y: -500, opacity: 0, stagger: 0.1, duration: 0.5, ease: 'power4.in'
                });
            }
        }

        // --- WALLET HEX (Scanning) ---
        else if (type === 'wallet_hex') {
            const text = "0x" + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
            if (elementRef.current) elementRef.current.innerText = '';

            tl.current.to(elementRef.current, {
                text: { value: text, delimiter: "" },
                duration: 1,
                ease: 'none',
                onUpdate: function () {
                    // Fallback hack if TextPlugin not enabled, just randomize chars
                    if (!this.ratio) return;
                    const len = Math.floor(this.ratio * 40);
                    const rand = "0x" + Array(len).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
                    if (elementRef.current) elementRef.current.innerText = rand;
                }
            });
        }

    }, { scope: container, dependencies: [type, symbol] });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    // RENDER HELPERS
    const renderToken = () => (
        <div ref={elementRef} style={{
            width: 200, height: 200,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: `8px solid ${color || (symbol === 'BTC' ? '#f7931a' : '#627eea')}`,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            boxShadow: `0 0 50px ${color || (symbol === 'BTC' ? '#f7931a33' : '#627eea33')}`,
            fontSize: '80px', fontWeight: 'bold', color: '#fff',
            perspective: 1000
        }}>
            {symbol}
        </div>
    );

    const renderFiatStack = () => (
        <div ref={elementRef} style={{ position: 'relative', width: 200, height: 200 }}>
            {Array.from({ length: Math.min(amount, 10) }).map((_, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    bottom: i * 15,
                    left: i % 2 === 0 ? 0 : 5,
                    width: 180, height: 40,
                    backgroundColor: '#10b981',
                    border: '1px solid #064e3b',
                    borderRadius: '4px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                }} />
            ))}
        </div>
    );

    const renderWallet = () => (
        <div ref={elementRef} style={{
            fontFamily: 'monospace', fontSize: '24px', color: '#14f195',
            backgroundColor: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '8px',
            border: '1px solid #14f195'
        }}>
            0x...
        </div>
    );

    return (
        <div ref={container} style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {type === 'token' && renderToken()}
            {type === 'fiat_stack' && renderFiatStack()}
            {type === 'wallet_hex' && renderWallet()}
        </div>
    );
};
