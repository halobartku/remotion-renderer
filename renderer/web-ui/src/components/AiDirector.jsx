import React, { useState } from 'react';
import { Clapperboard, Send, Layers, CheckCircle, Loader2, Play } from 'lucide-react';

export default function AiDirector() {
    const [script, setScript] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [step, setStep] = useState(1); // 1: Script, 2: Plan, 3: Generating, 4: Done
    const [plan, setPlan] = useState(null);
    const [logs, setLogs] = useState([]);
    const [finalVideoUrl, setFinalVideoUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const addLog = (msg) => setLogs(prev => [...prev, msg]);

    const handleAnalyze = async () => {
        if (!script) return;
        setIsLoading(true);
        addLog('Analyzing script with Director Agent...');

        try {
            const res = await fetch('/api/ai/direct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ script, apiKey })
            });
            const data = await res.json();
            if (data.plan) {
                setPlan(data.plan);
                setStep(2);
                addLog('Plan created successfully.');
            } else {
                throw new Error(JSON.stringify(data));
            }
        } catch (e) {
            addLog(`Error: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateAll = async () => {
        setStep(3);
        setIsLoading(true);

        try {
            // New "Library Mode": Skip individual component generation.
            // The Orchestrator will directly pick components from the library.
            addLog('Assembling final composition from Component Library...');

            // Orchestrate
            const orchRes = await fetch('/api/ai/orchestrate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan, apiKey })
            });
            const orchData = await orchRes.json();

            if (orchData.success) {
                addLog('✓ Composition assembled.');

                // Trigger Render
                addLog('Rendering video...');
                const renderRes = await fetch('/api/render', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filepath: orchData.filepath })
                });
                const renderData = await renderRes.json();

                if (renderData.success) {
                    setFinalVideoUrl(renderData.videoUrl);
                    setStep(4);
                    addLog('✓ Video rendering complete!');
                } else {
                    throw new Error('Rendering failed');
                }

            } else {
                throw new Error('Orchestration failed');
            }

        } catch (e) {
            addLog(`CRITICAL ERROR: ${e.message}`);
            setStep(2); // Go back to plan
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <Clapperboard size={24} color="var(--accent-color)" />
                <h2 style={{ margin: 0 }}>AI Director</h2>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>Gemini API Key (Optional if set in .env)</label>
                <input
                    type="password"
                    placeholder="Enter key to override server default..."
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    style={{ width: '100%' }}
                />
            </div>

            {step === 1 && (
                <div className="fade-in">
                    <p style={{ marginBottom: '1rem' }}>Describe your scene in detail. Include layout, visual elements, and animation style.</p>
                    <textarea
                        value={script}
                        onChange={e => setScript(e.target.value)}
                        placeholder="Example: Split screen. Left side shows a calendar flipping rapidly from 2020 to 2023. Right side shows a line graph spiking upwards comfortably..."
                        style={{ width: '100%', height: '200px', marginBottom: '1rem' }}
                    />
                    <button className="btn" onClick={handleAnalyze} disabled={isLoading || !script}>
                        {isLoading ? <Loader2 className="spinner" /> : <Send size={18} />}
                        Analyze Script
                    </button>
                </div>
            )}

            {step === 2 && plan && (
                <div className="fade-in">
                    <h3>Production Plan</h3>
                    <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', margin: '1rem 0' }}>
                        <p><strong>Layout:</strong> {plan.layout}</p>
                        <p><strong>Duration:</strong> {plan.durationInSeconds}s</p>
                        <h4 style={{ marginTop: '1rem' }}>Proposed Components:</h4>
                        <ul style={{ paddingLeft: '1.5rem' }}>
                            {plan.children && plan.children.map((c, i) => (
                                <li key={i} style={{ marginBottom: '0.5rem' }}>
                                    <strong style={{ color: 'var(--accent-color)' }}>{c.component}</strong>
                                    <br />
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'monospace' }}>{JSON.stringify(c.props)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                        <button className="btn" onClick={handleGenerateAll} disabled={isLoading}>
                            {isLoading ? <Loader2 className="spinner" /> : <Layers size={18} />}
                            Generate & Render All
                        </button>
                    </div>
                </div>
            )}

            {(step === 3 || step === 4) && (
                <div className="fade-in">
                    <h3>Production Log</h3>
                    <div style={{
                        backgroundColor: '#000',
                        color: '#00ff00',
                        fontFamily: 'monospace',
                        padding: '1rem',
                        borderRadius: '8px',
                        height: '200px',
                        overflowY: 'auto',
                        marginBottom: '1rem',
                        fontSize: '0.9rem'
                    }}>
                        {logs.map((log, i) => <div key={i}>&gt; {log}</div>)}
                        {isLoading && <div className="spinner" style={{ width: '10px', height: '10px', margin: '10px 0' }} />}
                    </div>

                    {step === 4 && finalVideoUrl && (
                        <div className="fade-in" style={{ textAlign: 'center' }}>
                            <h3 style={{ color: 'var(--success-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <CheckCircle /> Production Complete
                            </h3>
                            <video controls src={finalVideoUrl} style={{ width: '100%', borderRadius: '8px', marginTop: '1rem' }} autoPlay />
                            <button className="btn" onClick={() => setStep(1)} style={{ marginTop: '1rem' }}>Start New Project</button>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}
