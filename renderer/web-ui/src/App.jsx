import React, { useState } from 'react';
import DropZone from './components/DropZone';
import GeminiSvgGenerator from './components/GeminiSvgGenerator';
import CodeInput from './components/CodeInput';
import AiDirector from './components/AiDirector';
import { Clapperboard, Image as ImageIcon, Code, Sparkles } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('renderer');

  return (
    <div className="app-container fade-in">
      <header>
        <h1>Remotion Studio</h1>
        <p>Portable Rendering & AI Asset Generation</p>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${activeTab === 'renderer' ? 'active' : ''}`}
          onClick={() => setActiveTab('renderer')}
        >
          <Clapperboard size={18} style={{ marginRight: 8, display: 'inline-block', verticalAlign: 'text-bottom' }} />
          Video Renderer
        </button>
        <button
          className={`tab ${activeTab === 'code' ? 'active' : ''}`}
          onClick={() => setActiveTab('code')}
        >
          <Code size={18} style={{ marginRight: 8, display: 'inline-block', verticalAlign: 'text-bottom' }} />
          Code Editor
        </button>
        <button
          className={`tab ${activeTab === 'director' ? 'active' : ''}`}
          onClick={() => setActiveTab('director')}
        >
          <Sparkles size={18} style={{ marginRight: 8, display: 'inline-block', verticalAlign: 'text-bottom' }} />
          AI Director
        </button>
        <button
          className={`tab ${activeTab === 'svg' ? 'active' : ''}`}
          onClick={() => setActiveTab('svg')}
        >
          <ImageIcon size={18} style={{ marginRight: 8, display: 'inline-block', verticalAlign: 'text-bottom' }} />
          Gemini SVG Gen
        </button>
      </nav>

      <main>
        {activeTab === 'renderer' && <DropZone />}
        {activeTab === 'code' && <CodeInput />}
        {activeTab === 'director' && <AiDirector />}
        {activeTab === 'svg' && <GeminiSvgGenerator />}
      </main>
    </div>
  );
}

export default App;
