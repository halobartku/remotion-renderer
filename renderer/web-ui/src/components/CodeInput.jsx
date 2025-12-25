import React, { useState } from 'react';
import { Code, Play, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function CodeInput() {
    const [code, setCode] = useState('');
    const [filename, setFilename] = useState('');
    const [saving, setSaving] = useState(false);
    const [rendering, setRendering] = useState(false);
    const [renderResult, setRenderResult] = useState(null);
    const [error, setError] = useState(null);

    const handleRender = async () => {
        if (!code) return;

        setSaving(true);
        setRendering(false);
        setError(null);
        setRenderResult(null);

        try {
            // 1. Save File
            const saveResponse = await fetch('/api/save-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, filename: filename || undefined })
            });

            const saveData = await saveResponse.json();
            if (!saveData.success) throw new Error(saveData.error || 'Failed to save code');

            const filepath = saveData.filepath;
            setSaving(false);
            setRendering(true);

            // 2. Render
            const renderResponse = await fetch('/api/render', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filepath })
            });

            const renderData = await renderResponse.json();
            if (renderData.success) {
                setRenderResult(renderData);
            } else {
                throw new Error(renderData.error || 'Render failed');
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
            setRendering(false);
        }
    };

    return (
        <div className="code-input-container fade-in">
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Code size={24} color="var(--accent-color)" />
                        <h2>Paste Code</h2>
                    </div>
                    <input
                        type="text"
                        placeholder="Optional filename (e.g. MyVideo.tsx)"
                        value={filename}
                        onChange={(e) => setFilename(e.target.value)}
                        style={{ width: '250px' }}
                    />
                </div>

                <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                    Paste your full Remotion TSX code below (including imports and exports).
                </p>

                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="// Paste keyframes, compositionConfig, and React component..."
                    style={{
                        width: '100%',
                        height: '400px',
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        tabSize: 2,
                        whiteSpace: 'pre',
                        marginBottom: '1.5rem',
                        backgroundColor: '#111',
                        color: '#d4d4d4'
                    }}
                    spellCheck="false"
                />

                {error && (
                    <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                <button
                    className="btn"
                    onClick={handleRender}
                    disabled={!code || saving || rendering}
                    style={{ width: '100%' }}
                >
                    {saving || rendering ? (
                        <>
                            <Loader2 className="spinner" size={18} />
                            {saving ? 'Saving...' : 'Rendering...'}
                        </>
                    ) : (
                        <>
                            <Play size={18} /> Render Video
                        </>
                    )}
                </button>
            </div>

            {renderResult && (
                <div className="card fade-in" style={{ marginTop: '2rem', borderColor: 'var(--success-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <CheckCircle size={32} color="var(--success-color)" />
                        <div>
                            <h3 style={{ color: 'var(--success-color)' }}>Render Complete!</h3>
                            <p>Your video is ready.</p>
                        </div>
                    </div>

                    <video
                        controls
                        style={{ width: '100%', borderRadius: '8px', backgroundColor: '#000' }}
                        src={renderResult.videoUrl}
                        autoPlay
                    />

                    <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                        <a href={renderResult.videoUrl} download className="btn btn-secondary">
                            Download MP4
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
