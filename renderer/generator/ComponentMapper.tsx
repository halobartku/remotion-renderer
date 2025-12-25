import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

// Import Library Components
import { BarChart } from '../library/BarChart';
import { LineChart } from '../library/LineChart';
import { AreaChart } from '../library/AreaChart';
import { Headline } from '../library/Headline';
import { StatCallout } from '../library/StatCallout';
import { Wipe } from '../library/Wipe';
import { ArrowSweep } from '../library/ArrowSweep';
import { Dissolve } from '../library/Dissolve';
import { SplitScreen } from '../library/SplitScreen';
import { Grid } from '../library/Grid';
import { FullBleed } from '../library/FullBleed';
import { Label } from '../library/Label';

// Import Theme
import { THEME } from '../library/theme';

export const renderChart = (chartDef: any) => {
    if (!chartDef) return null;

    switch (chartDef.type) {
        case 'bar':
            return <BarChart {...chartDef} />;
        case 'line':
            return <LineChart {...chartDef} />;
        case 'area':
            return <AreaChart {...chartDef} />;
        default:
            return null;
    }
};

export const renderHeader = (headerDef: any) => {
    if (!headerDef) return null;

    return (
        <div style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: headerDef.align || 'flex-start' }}>
            {headerDef.category && (
                <div style={{ ...THEME.typography.subHeader, color: THEME.colors.gray[500], fontSize: 18, textTransform: 'uppercase', marginBottom: 10 }}>
                    {headerDef.category}
                </div>
            )}
            <Headline text={headerDef.title} level={1} color={headerDef.color} align={headerDef.align} />
            {headerDef.subtitle && (
                <div style={{ ...THEME.typography.subHeader, marginTop: 10, color: THEME.colors.gray[300] }}>
                    {headerDef.subtitle}
                </div>
            )}
        </div>
    );
};

export const renderTransition = (content: any) => {
    if (content.effect === 'wipe') {
        return <Wipe direction={content.from || 'right'} color={content.color} duration={1} />;
    }
    if (content.effect === 'arrow_sweep') {
        return <ArrowSweep color={content.color} message={content.message?.text} />;
    }
    if (content.effect === 'dissolve') {
        return <Dissolve>{null}</Dissolve>; // Dissolve usually wraps content, logic might need adjustment for overlay
    }
    return null;
};

export const renderOverlay = (content: any) => {
    if (content.component === 'stat_callout') {
        const { position } = content;
        const style: React.CSSProperties = { position: 'absolute' };

        switch (position) {
            case 'top_left': style.top = 100; style.left = 100; break;
            case 'top_right': style.top = 100; style.right = 100; break;
            case 'bottom_left': style.bottom = 100; style.left = 100; break;
            case 'bottom_right': style.bottom = 100; style.right = 100; break;
            case 'center': style.top = '50%'; style.left = '50%'; style.transform = 'translate(-50%, -50%)'; break;
        }

        return (
            <div style={style}>
                <StatCallout
                    value={content.data.value}
                    label={content.data.label}
                    color={content.data.color}
                />
            </div>
        );
    }
    return null;
};

// Main Scene Renderer
export const SceneRenderer: React.FC<{ scene: any }> = ({ scene }) => {
    const { type, content } = scene;

    if (type === 'split_screen') {
        return (
            <FullBleed>
                {/* Global Title */}
                {content.global?.title && (
                    <div style={{ position: 'absolute', top: 40, width: '100%', textAlign: 'center', zIndex: 10 }}>
                        <Headline text={content.global.title} level={2} align="center" />
                    </div>
                )}

                <SplitScreen
                    ratio={content.ratio || 0.5}
                    divider={content.divider !== false}
                    left={
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            {renderHeader(content.left.header)}
                            {content.left.chart && (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {renderChart(content.left.chart)}
                                </div>
                            )}
                        </div>
                    }
                    right={
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            {renderHeader(content.right.header)}
                            {content.right.chart && (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {renderChart(content.right.chart)}
                                </div>
                            )}
                        </div>
                    }
                />
            </FullBleed>
        );
    }

    if (type === 'transition') {
        return renderTransition(content);
    }

    if (type === 'full_bleed') {
        const { header, chart, background, text, overlay } = content;

        return (
            <FullBleed>
                {/* Background Color/Effect */}
                {background && (
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: background.color || '#000', zIndex: 0 }}>
                        {/* Placeholder for background animation if needed */}
                    </div>
                )}

                {/* Main Content Container */}
                <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60 }}>

                    {/* 1. Header if present */}
                    {header && renderHeader({ ...header, align: header.align || 'center' })}

                    {/* 2. Text Content (Fallback if LLM uses 'text' object) */}
                    {text && (
                        <div style={{ textAlign: 'center', marginBottom: 40 }}>
                            <Headline text={text.content || text} level={1} color={text.color} align="center" />
                        </div>
                    )}

                    {/* 3. Chart if present */}
                    {chart && (
                        <div style={{ width: '80%', height: '60%' }}>
                            {renderChart(chart)}
                        </div>
                    )}

                    {/* 4. Overlay/Lines if present (LLM often requests this) */}
                    {overlay && (
                        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', border: `2px solid ${overlay.color || '#00ffff'}`, opacity: 0.5 }}>
                            {/* Simple visualization of the requested overlay */}
                            <div style={{ position: 'absolute', top: 20, right: 20, color: overlay.color, fontFamily: THEME.typography.mono.fontFamily }}>
                                [OVERLAY: {overlay.type}]
                            </div>
                        </div>
                    )}
                </div>
            </FullBleed>
        );
    }

    if (type === 'overlay') {
        return renderOverlay(content);
    }

    return null;
};
