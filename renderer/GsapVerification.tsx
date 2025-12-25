import React, { useRef, useLayoutEffect, useState } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
    id: 'GsapVerification',
    durationInSeconds: 4,
    fps: 30,
    width: 1920,
    height: 1080,
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const GsapVerification = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const container = useRef(null);
    // Use a Ref to store the timeline instance
    const tl = useRef<any>(null);

    // 1. Create the GSAP timeline using the useGSAP hook
    useGSAP(() => {
        // Create a paused timeline
        tl.current = gsap.timeline({ paused: true })
            .fromTo(".box",
                { x: -500, opacity: 0, rotation: -90 },
                { x: 0, opacity: 1, rotation: 0, duration: 1.5, ease: "power3.out" }
            )
            .to(".box", {
                rotation: 360,
                backgroundColor: "#8b5cf6",
                scale: 1.2,
                duration: 1,
                ease: "back.inOut(1.7)"
            })
            .to(".text", {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.2,
                ease: "power2.out"
            }, "-=0.5");

    }, { scope: container });

    // 2. Sync the GSAP timeline with the Remotion frame
    useLayoutEffect(() => {
        if (tl.current) {
            // Convert current frame to time in seconds
            const timeInSeconds = frame / fps;
            // Seek to the exact time
            tl.current.seek(timeInSeconds);
        }
    }, [frame, fps]);

    // Simple styles
    const textStyle = {
        fontFamily: 'Inter, system-ui, sans-serif',
        color: 'white',
        fontSize: '40px',
        fontWeight: 'bold',
        opacity: 0,
        transform: 'translateY(20px)'
    };

    return (
        <AbsoluteFill style={{ backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
            <div ref={container} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>

                {/* Visual Element to Animate */}
                <div
                    className="box"
                    style={{
                        width: 150,
                        height: 150,
                        backgroundColor: '#ffffff',
                        borderRadius: 24,
                        boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)'
                    }}
                />

                {/* Text Elements */}
                <div style={{ textAlign: 'center' }}>
                    <h1 className="text" style={textStyle}>GSAP + Remotion</h1>
                    <p className="text" style={{ ...textStyle, fontSize: '24px', fontWeight: 'normal', color: '#94a3b8' }}>
                        Frame Synchronization Verified
                    </p>
                </div>

            </div>
        </AbsoluteFill>
    );
};

export default GsapVerification;
