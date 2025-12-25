import React, { useRef, useLayoutEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { THEME } from './theme';

type TechInterfaceProps = {
    type: 'search_bar' | 'notification_pop' | 'chat_stream';
    text?: string; // Query or Message
    subtext?: string; // App name or Timestamp
};

export const TechInterface: React.FC<TechInterfaceProps> = ({
    type = 'search_bar',
    text = "Why is the market crashing?",
    subtext = "Now"
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true });

        // --- SEARCH BAR (Typing) ---
        if (type === 'search_bar') {
            tl.current.from('.search-container', { scaleX: 0, opacity: 0, duration: 0.5, ease: 'back.out' });
            tl.current.to('.cursor', { opacity: 0, duration: 0.5, repeat: -1, yoyo: true, ease: 'steps(1)' });

            // Typewriter effect
            tl.current.to('.search-text', {
                text: { value: text, delimiter: "" },
                duration: 2,
                ease: 'none'
            });

            // Search button hit
            tl.current.to('.search-icon', { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1 }, 2.2);
        }

        // --- NOTIFICATION (Slide Down) ---
        else if (type === 'notification_pop') {
            tl.current.from('.notif-card', { y: -100, opacity: 0, duration: 0.8, ease: 'elastic.out(1, 0.7)' });
        }

        // --- CHAT STREAM (Bubble Up) ---
        else if (type === 'chat_stream') {
            tl.current.from('.chat-bubble', {
                y: 50, opacity: 0, scale: 0.8,
                stagger: 0.5, duration: 0.5, ease: 'back.out'
            });
        }

    }, { scope: container, dependencies: [type, text] });

    useLayoutEffect(() => {
        if (tl.current) tl.current.seek(frame / fps);
    }, [frame, fps]);

    // RENDER HELPERS
    const renderSearchBar = () => (
        <div className="search-container" style={{
            width: 800, height: 80, background: THEME.colors.white, borderRadius: '40px',
            display: 'flex', alignItems: 'center', padding: '0 30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            fontFamily: THEME.typography.fontFamily
        }}>
            <span className="search-icon" style={{ fontSize: '30px', marginRight: '20px' }}>🔍</span>
            <span className="search-text" style={{ fontSize: '30px', fontFamily: THEME.typography.fontFamily, color: THEME.colors.gray[800] }}></span>
            <span className="cursor" style={{ fontSize: '30px', color: THEME.colors.gray[800] }}>|</span>
        </div>
    );

    const renderNotification = () => (
        <div className="notif-card" style={{
            width: 500, background: 'rgba(255,255,255,0.95)', borderRadius: '15px',
            padding: '20px', display: 'flex', gap: '15px', backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
            fontFamily: THEME.typography.fontFamily
        }}>
            <div style={{ width: 50, height: 50, background: THEME.colors.rose, borderRadius: '10px', flexShrink: 0 }} />
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '380px', fontSize: '14px', color: THEME.colors.gray[600], marginBottom: '5px' }}>
                    <strong>NEWS ALERT</strong>
                    <span>{subtext}</span>
                </div>
                <div style={{ color: THEME.colors.obsidian, fontSize: '18px', fontWeight: '500' }}>{text}</div>
            </div>
        </div>
    );

    const renderChatStream = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: 600, fontFamily: THEME.typography.fontFamily }}>
            {/* Simulating a conversation based on input text being the 'latest' message */}
            <div className="chat-bubble" style={{ alignSelf: 'flex-start', background: THEME.colors.gray[700], color: THEME.colors.white, padding: '15px 25px', borderRadius: '20px 20px 20px 0' }}>
                Did you see the news?
            </div>
            <div className="chat-bubble" style={{ alignSelf: 'flex-end', background: THEME.colors.blue, color: THEME.colors.white, padding: '15px 25px', borderRadius: '20px 20px 0 20px' }}>
                {text}
            </div>
        </div>
    );


    return (
        <div ref={container} style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {type === 'search_bar' && renderSearchBar()}
            {type === 'notification_pop' && renderNotification()}
            {type === 'chat_stream' && renderChatStream()}
        </div>
    );
};
