import React, { useState } from 'react';
import { Sparkles, Download, Copy, RefreshCw } from 'lucide-react';

export default function GeminiSvgGenerator() {
    const [prompt, setPrompt] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [svgContent, setSvgContent] = useState('');
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        if (!prompt) return;

        setLoading(true);
        setError(null);
        setSvgContent('');

        try {
            const response = await fetch('/api/generate-svg', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, apiKey }) // Optional API key override
            });

            const data = await response.json();

            if (data.svg) {
                setSvgContent(data.svg);
            } else {
                throw new Error(data.error || 'Generation failed');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!svgContent) return;
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `generated-${Date.now()}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCopy = () => {
        if (svgContent) {
            navigator.clipboard.writeText(svgContent);
            alert('SVG code copied to clipboard!');
        }
    };

    return (
        <div className="svg-generator-container fade-in">
            <div className="card">
                <h2>Describe your SVG</h2>
                <p style={{ marginBottom: '1.5rem' }}>Use AI to generate vector graphics for your video.</p>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Prompt</label>
                    <textarea
                        rows={4}
                        placeholder="A futuristic geometric logo with neon blue lines..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                </div>

                {/* Optional simple input for API key if user wants to override default */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>API Key (Optional)</label>
                    <input
                        type="password"
                        placeholder="Using server configured key..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)' }}
                    />
                </div>

                {error && (
                    <p style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>{error}</p>
                )}

                <button
                    className="btn"
                    onClick={handleGenerate}
                    disabled={!prompt || loading}
                    style={{ width: '100%' }}
                >
                    {loading ? <RefreshCw className="spinner" /> : <Sparkles size={18} />}
                    {loading ? 'Generating...' : 'Generate SVG'}
                </button>
            </div>

            {svgContent && (
                <div className="card fade-in" style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>Preview</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-secondary" onClick={handleCopy} title="Copy Code">
                                <Copy size={16} />
                            </button>
                            <button className="btn btn-secondary" onClick={handleDownload} title="Download SVG">
                                <Download size={16} />
                            </button>
                        </div>
                    </div>

                    <div
                        style={{
                            padding: '2rem',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'center',
                            minHeight: '200px'
                        }}
                        dangerouslySetInnerHTML={{ __html: svgContent }}
                    />

                    <div style={{ marginTop: '1rem' }}>
                        <details>
                            <summary style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>View Code</summary>
                            <pre style={{
                                marginTop: '0.5rem',
                                padding: '1rem',
                                backgroundColor: '#000',
                                borderRadius: '8px',
                                overflow: 'auto',
                                fontSize: '0.8rem',
                                maxHeight: '200px'
                            }}>
                                <code>{svgContent}</code>
                            </pre>
                        </details>
                    </div>
                </div>
            )}
        </div>
    );
}
