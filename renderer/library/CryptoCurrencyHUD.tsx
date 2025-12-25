import React, { useRef, useLayoutEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { THEME, STYLES } from './theme';

type TickerItem = { symbol: string; price: string; change: string; isUp: boolean };

type CryptoCurrencyHUDProps = {
    primaryAsset?: {
        name: string;
        symbol: string;
        price: string;
        change24h: string;
        isUp: boolean;
        marketCap?: string;
        volume?: string;
    };
    tickerItems?: TickerItem[];
    showTicker?: boolean;
    showCard?: boolean;
};

// Default Dummy Data
const DEFAULT_TICKERS: TickerItem[] = [
    { symbol: 'BTC', price: '$64,230', change: '+2.4%', isUp: true },
    { symbol: 'ETH', price: '$3,450', change: '+1.2%', isUp: true },
    { symbol: 'SOL', price: '$145', change: '-0.5%', isUp: false },
    { symbol: 'XRP', price: '$0.62', change: '+0.1%', isUp: true },
    { symbol: 'ADA', price: '$0.45', change: '-1.2%', isUp: false },
    { symbol: 'DOT', price: '$7.20', change: '+0.8%', isUp: true },
    { symbol: 'AVAX', price: '$38.50', change: '-2.1%', isUp: false },
];

export const CryptoCurrencyHUD: React.FC<CryptoCurrencyHUDProps> = ({
    primaryAsset = { name: 'Bitcoin', symbol: 'BTC', price: '$64,230.50', change24h: '+2.45%', isUp: true, marketCap: '$1.2T', volume: '$35B' },
    tickerItems = DEFAULT_TICKERS,
    showTicker = true,
    showCard = true
}) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // Refs for animations
    const container = useRef(null);
    const tickerRef = useRef(null);
    const cardRef = useRef(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        // 1. Ticker Slide In
        if (showTicker) {
            tl.current.from(tickerRef.current, { y: 100, opacity: 0, duration: 1, ease: 'power3.out' }, 0);

            // Continuous Scrolling for Ticker (Infinite Loop)
            // We clone items to ensure seamless loop, but simplistic approach here:
            // Just move xPercent from 0 to -50 (assuming double rendering)
            const tickerEl = tickerRef.current as HTMLElement | null;
            const track = tickerEl?.querySelector('.ticker-track');
            if (track) {
                gsap.to(track, {
                    x: -1000, // Approximate scroll value, depends on content width
                    duration: 20,
                    ease: 'none',
                    repeat: -1
                });
            }
        }

        // 2. Asset Card Pop In
        if (showCard) {
            tl.current.from(cardRef.current, {
                scale: 0.8,
                opacity: 0,
                x: 50,
                duration: 0.8,
                ease: 'back.out(1.7)'
            }, 0.5);
        }

    }, { scope: container });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    return (
        <div ref={container} style={{
            width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none',
            overflow: 'hidden'
        }}>

            {/* Ticker Tape (Bottom) */}
            {showTicker && (
                <div ref={tickerRef} style={{
                    position: 'absolute', bottom: 40, left: 0, width: '100%', height: 60,
                    ...STYLES.glassPanel, borderRadius: 0, borderLeft: 'none', borderRight: 'none',
                    display: 'flex', alignItems: 'center', overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', left: 0, height: '100%', width: 100,
                        background: `linear-gradient(90deg, ${THEME.colors.gray[900]} 0%, transparent 100%)`, zIndex: 10
                    }} />
                    <div style={{
                        position: 'absolute', right: 0, height: '100%', width: 100,
                        background: `linear-gradient(270deg, ${THEME.colors.gray[900]} 0%, transparent 100%)`, zIndex: 10
                    }} />

                    <div className="ticker-track" style={{ display: 'flex', gap: 40, paddingLeft: 40, whiteSpace: 'nowrap' }}>
                        {/* Render twice for looping illusion */}
                        {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontFamily: THEME.typography.mono.fontFamily, fontWeight: 700, color: THEME.colors.gray[300] }}>
                                    {item.symbol}
                                </span>
                                <span style={{ fontFamily: THEME.typography.mono.fontFamily, color: THEME.colors.white }}>
                                    {item.price}
                                </span>
                                <span style={{
                                    fontFamily: THEME.typography.mono.fontFamily,
                                    color: item.isUp ? THEME.colors.emerald : THEME.colors.rose,
                                    fontSize: 12
                                }}>
                                    {item.change}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Asset Card (Top Right) */}
            {showCard && (
                <div ref={cardRef} style={{
                    position: 'absolute', top: 60, right: 60, width: 300,
                    ...STYLES.glassPanel,
                    padding: 20,
                    display: 'flex', flexDirection: 'column', gap: 10
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ ...THEME.typography.header, fontFamily: THEME.typography.fontFamily, fontSize: 24, color: THEME.colors.white }}>
                            {primaryAsset.symbol}
                        </div>
                        <div style={{
                            fontSize: 12, padding: '4px 8px', borderRadius: 4,
                            background: primaryAsset.isUp ? `${THEME.colors.emerald}33` : `${THEME.colors.rose}33`,
                            color: primaryAsset.isUp ? THEME.colors.emerald : THEME.colors.rose,
                            fontWeight: 700
                        }}>
                            {primaryAsset.change24h}
                        </div>
                    </div>

                    <div style={{ ...THEME.typography.subHeader, fontFamily: THEME.typography.fontFamily, fontSize: 32, color: THEME.colors.white }}>
                        {primaryAsset.price}
                    </div>

                    <div style={{ width: '100%', height: 1, background: THEME.colors.border }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: THEME.colors.gray[500] }}>
                        <span>MCAP</span>
                        <span style={{ color: THEME.colors.gray[300] }}>{primaryAsset.marketCap}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: THEME.colors.gray[500] }}>
                        <span>VOL (24H)</span>
                        <span style={{ color: THEME.colors.gray[300] }}>{primaryAsset.volume}</span>
                    </div>
                </div>
            )}

        </div>
    );
};
