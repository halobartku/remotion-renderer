import React, { useState } from 'react';
import { Clapperboard, Send, Layers, CheckCircle, Loader2, Play, Code, Plus, Layout, BarChart, Zap, Type } from 'lucide-react';

export default function AiDirector() {
    const [script, setScript] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [step, setStep] = useState(1); // 1: Script, 2: Plan (Edit JSON), 3: Rendering, 4: Done
    const [planJson, setPlanJson] = useState(''); // Stringified JSON for editing
    const [logs, setLogs] = useState([]);
    const [finalVideoUrl, setFinalVideoUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Builder State
    const [activeCategory, setActiveCategory] = useState(null); // 'layout', 'chart', 'highlight', 'transition'

    const addLog = (msg) => setLogs(prev => [...prev, msg]);

    const addToScript = (text) => {
        setScript(prev => (prev ? prev + '\n\n' : '') + text);
        setActiveCategory(null);
    };

    const handleAnalyze = async () => {
        if (!script) return;
        setIsLoading(true);
        addLog('Analyzing script with Director V2 (Phase 3 Engine)...');

        try {
            const res = await fetch('/api/v2/direct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ script, apiKey })
            });
            const data = await res.json();
            if (data.plan) {
                setPlanJson(JSON.stringify(data.plan, null, 2));
                setStep(2);
                addLog('Plan created. Please review the JSON configuration.');
            } else {
                throw new Error(JSON.stringify(data));
            }
        } catch (e) {
            addLog(`Error: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateV2 = async () => {
        setStep(3);
        setIsLoading(true);

        try {
            let parsedPlan;
            try {
                parsedPlan = JSON.parse(planJson);
            } catch (e) {
                throw new Error("Invalid JSON: " + e.message);
            }

            addLog('Sending configuration to Composition Engine...');

            const res = await fetch('/api/v2/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: parsedPlan })
            });

            const data = await res.json();

            if (data.success) {
                setFinalVideoUrl(data.videoUrl);
                setStep(4);
                addLog('✓ Video rendering complete!');
            } else {
                throw new Error(data.error || 'Rendering failed');
            }

        } catch (e) {
            addLog(`CRITICAL ERROR: ${e.message}`);
            setStep(2); // Go back to edit
        } finally {
            setIsLoading(false);
        }
    };

    // --- Builder Components ---

    const BuilderCategory = ({ icon: Icon, label, id }) => (
        <button
            className={`btn ${activeCategory === id ? 'btn-secondary' : ''}`}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem', width: '100px', fontSize: '0.8rem', opacity: activeCategory && activeCategory !== id ? 0.5 : 1 }}
            onClick={() => setActiveCategory(activeCategory === id ? null : id)}
        >
            <Icon size={24} />
            {label}
        </button>
    );

    const BuilderForm = () => {
        if (!activeCategory) return null;

        const containerStyle = {
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
            animation: 'fadeIn 0.3s ease'
        };

        if (activeCategory === 'layout') {
            return (
                <div style={containerStyle}>
                    <h4>Insert Layout</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button className="btn" onClick={() => addToScript("Start with a Split Screen layout. Left side: [Describe Content]. Right side: [Describe Content].")}>Split Screen</button>
                        <button className="btn" onClick={() => addToScript("Use a Full Bleed layout with a focused graphic.")}>Full Bleed</button>
                        <button className="btn" onClick={() => addToScript("Create a Grid layout displaying 4 items.")}>Grid (2x2)</button>
                    </div>
                </div>
            );
        }

        if (activeCategory === 'chart') {
            const [type, setType] = useState('Line Chart');
            const [title, setTitle] = useState('');
            const [data, setData] = useState('');
            return (
                <div style={containerStyle}>
                    <h4>Insert Chart</h4>
                    <div style={{ marginBottom: '0.5rem' }}>
                        <select style={{ width: '100%', padding: '0.5rem', background: '#1e293b', color: '#fff', border: '1px solid #334155' }} value={type} onChange={e => setType(e.target.value)}>
                            <option>Line Chart</option>
                            <option>Bar Chart</option>
                            <option>Area Chart</option>
                        </select>
                    </div>
                    <input
                        placeholder="Chart Title (e.g. GDP Growth)"
                        style={{ width: '100%', marginBottom: '0.5rem' }}
                        value={title} onChange={e => setTitle(e.target.value)}
                    />
                    <input
                        placeholder="Data Summary (e.g. 2020: 2%, 2021: 4%)"
                        style={{ width: '100%', marginBottom: '0.5rem' }}
                        value={data} onChange={e => setData(e.target.value)}
                    />
                    <button className="btn" onClick={() => addToScript(`Show a ${type} titled "${title}" with data: ${data}.`)}>Insert Chart</button>
                </div>
            );
        }

        if (activeCategory === 'highlight') {
            return (
                <div style={containerStyle}>
                    <h4>Insert Highlight</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button className="btn" onClick={() => addToScript("Add a Stat Callout: Value='100%', Label='Growth', situated top-right.")}>Stat Callout</button>
                        <button className="btn" onClick={() => addToScript("Display a Headline: 'The Market Crash' with subtitle 'Analysis 2024'.")}>Headline</button>
                    </div>
                </div>
            );
        }

        if (activeCategory === 'transition') {
            return (
                <div style={containerStyle}>
                    <h4>Insert Transition</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button className="btn" onClick={() => addToScript("Transition: Wipe from left to right.")}>Wipe</button>
                        <button className="btn" onClick={() => addToScript("Transition: Arrow Sweep with text 'Next Chapter'.")}>Arrow Sweep</button>
                        <button className="btn" onClick={() => addToScript("Transition: Dissolve to next scene.")}>Dissolve</button>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="card fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <Clapperboard size={24} color="var(--accent-color)" />
                <h2 style={{ margin: 0 }}>AI Director (V2)</h2>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>Gemini API Key (Optional)</label>
                <input
                    type="password"
                    placeholder="Enter key to override server default..."
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    style={{ width: '100%' }}
                />
            </div>

            {step === 1 && (
                <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>

                    {/* LEFT COLUMN: Editor */}
                    <div>
                        <p style={{ marginBottom: '1rem' }}>Write your script below or use the Library Panel to insert elements.</p>
                        <textarea
                            value={script}
                            onChange={e => setScript(e.target.value)}
                            placeholder="Your video script..."
                            style={{ width: '100%', height: '300px', marginBottom: '1rem', fontFamily: 'monospace', lineHeight: '1.5' }}
                        />
                        <button className="btn" onClick={handleAnalyze} disabled={isLoading || !script}>
                            {isLoading ? <Loader2 className="spinner" /> : <Send size={18} />}
                            Analyze Script
                        </button>
                    </div>

                    {/* RIGHT COLUMN: Library Panel */}
                    <div>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Layers size={18} /> Library Elements
                        </h4>

                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', justifyContent: 'space-between' }}>
                            <BuilderCategory icon={Layout} label="Layouts" id="layout" />
                            <BuilderCategory icon={BarChart} label="Charts" id="chart" />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', justifyContent: 'space-between' }}>
                            <BuilderCategory icon={Type} label="Highlights" id="highlight" />
                            <BuilderCategory icon={Zap} label="Effects" id="transition" />
                        </div>

                        <BuilderForm />

                        <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4' }}>
                            <strong>Tip:</strong> You can mix manual typing with library elements. The AI Director works best with succinct, descriptive instructions about layout and specific data values.
                        </div>
                    </div>

                </div>
            )}

            {step === 2 && (
                <div className="fade-in">
                    <h3>Review Construction Plan (JSON)</h3>
                    <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>You can edit the configuration below to fine-tune the video.</p>

                    <textarea
                        value={planJson}
                        onChange={(e) => setPlanJson(e.target.value)}
                        style={{
                            width: '100%',
                            height: '500px',
                            fontFamily: 'monospace',
                            fontSize: '14px',
                            backgroundColor: '#1e293b',
                            color: '#e2e8f0',
                            border: '1px solid #334155',
                            padding: '1rem',
                            marginBottom: '1rem'
                        }}
                    />

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                        <button className="btn" onClick={handleGenerateV2} disabled={isLoading}>
                            {isLoading ? <Loader2 className="spinner" /> : <Layers size={18} />}
                            Render Video
                        </button>
                    </div>
                </div>
            )}

            {(step === 3 || step === 4) && (
                <div className="fade-in">
                    <h3>Production Status</h3>
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
                            <button className="btn" onClick={() => { setStep(1); setFinalVideoUrl(null); setLogs([]); }} style={{ marginTop: '1rem' }}>Start New Project</button>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}
