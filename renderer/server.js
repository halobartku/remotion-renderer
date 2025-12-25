const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { renderVideo } = require('./render-cli');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, 'web-ui', 'dist')));
app.use('/outputs', express.static(path.join(__dirname, 'outputs')));

// File Upload Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// Routes

// 1. Upload TSX
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ filepath: req.file.path, filename: req.file.filename });
});

// 1.5. Save Code as TSX
app.post('/api/save-code', (req, res) => {
    const { code, filename } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'No code provided' });
    }

    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }

    // Use provided filename or generate one
    const safeFilename = filename
        ? filename.replace(/[^a-zA-Z0-9._-]/g, '')
        : `generated_${Date.now()}.tsx`;

    const finalPath = path.join(uploadDir, safeFilename.endsWith('.tsx') ? safeFilename : `${safeFilename}.tsx`);

    try {
        fs.writeFileSync(finalPath, code, 'utf8');
        res.json({
            success: true,
            filepath: finalPath,
            filename: safeFilename
        });
    } catch (err) {
        console.error('Save file error:', err);
        res.status(500).json({ error: 'Failed to save file' });
    }
});

// 2. Render Video
app.post('/api/render', async (req, res) => {
    const { filepath } = req.body;
    if (!filepath) {
        return res.status(400).json({ error: 'Filepath is required' });
    }

    // Ensure output directory exists
    const outputDir = path.join(__dirname, 'outputs');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const outputFilename = `video_${Date.now()}.mp4`;
    const outputPath = path.join(outputDir, outputFilename);

    try {
        console.log(`Starting render for ${filepath}...`);

        // Call the refactored render logic
        // We pass options object similar to what CLI parser would produce
        await renderVideo({
            input: filepath,
            output: outputPath
        });

        res.json({
            success: true,
            videoUrl: `/outputs/${outputFilename}`,
            outputPath: outputPath
        });

    } catch (error) {
        console.error('Render error:', error);
        res.status(500).json({
            error: 'Render failed',
            details: error.message
        });
    }
});

// 3. Generate SVG with Gemini
app.post('/api/generate-svg', async (req, res) => {
    const { prompt, apiKey } = req.body;

    // Use provided key or env var
    const key = apiKey || process.env.GEMINI_API_KEY;

    if (!key) {
        return res.status(401).json({ error: 'Gemini API Key is required' });
    }

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const systemPrompt = "You are an expert SVG artist. Generate valid SVG code based on the user's prompt. Return ONLY the SVG code, starting with <svg and ending with </svg>. Do not include markdown code fence blocks like ```xml or ```svg.";

        const result = await model.generateContent([systemPrompt, prompt]);
        const response = await result.response;
        let text = response.text();

        // Cleanup potential markdown formatting if Gemini ignores instructions
        text = text.replace(/```svg/g, '').replace(/```xml/g, '').replace(/```/g, '').trim();

        res.json({ svg: text });

    } catch (error) {
        console.error('Gemini error:', error);
        res.status(500).json({ error: 'Failed to generate SVG', details: error.message });
    }
});

// 3. AI Direct (Step 1: Analyze Script)
app.post('/api/ai/direct', async (req, res) => {
    const { script, apiKey } = req.body;
    const key = apiKey || process.env.GEMINI_API_KEY;

    if (!key) return res.status(400).json({ error: 'API Key required' });

    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const systemPrompt = fs.readFileSync(path.join(__dirname, 'prompts', 'director.txt'), 'utf8');
        const result = await model.generateContent([systemPrompt, script]);

        let text = result.response.text();
        // Clean markdown if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const plan = JSON.parse(text);
        res.json({ plan });
    } catch (error) {
        console.error('Director AI Error:', error);
        if (error.response) {
            console.error('Error Details:', JSON.stringify(error.response, null, 2));
        }
        res.status(500).json({ error: 'Failed to analyze script', details: error.message });
    }
});

// 4. AI Generate Component (DEPRECATED - Library Mode Active)
app.post('/api/ai/generate-component', async (req, res) => {
    // In Library Mode, we skip individual component generation.
    // We just return success so the frontend thinks it's "done".
    res.json({ success: true, skipped: true });
});

// 5. AI Orchestrate (Step 3: Assemble)
app.post('/api/ai/orchestrate', async (req, res) => {
    const { plan, apiKey } = req.body;
    const key = apiKey || process.env.GEMINI_API_KEY;

    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const systemPrompt = fs.readFileSync(path.join(__dirname, 'prompts', 'orchestrator.txt'), 'utf8');
        const userPrompt = `Scene Plan: ${JSON.stringify(plan)}`;

        const result = await model.generateContent([systemPrompt, userPrompt]);
        let code = result.response.text();
        code = code.replace(/```tsx/g, '').replace(/```typescript/g, '').replace(/```/g, '').trim();

        // Ensure imports are correct for the uploads folder structure
        // The components are in ../library relative to uploads/File.tsx
        if (!code.includes('../library')) {
            code = `import { SmartLayout, KineticType, SmartGraph, PsychTimeline, CryptoCurrencyHUD, VisualFX, Geomap, NewspaperHeadline, CognitiveMap, ComparisonRig, DataViz, MetaphorIcon, DocumentaryOverlay, SocialNetwork, DeviceMockup, CinematicTitle, PsychCharacter, TechInterface, PhilosophyDiagram, MicroInteraction, AssetShowcase, NarrativeTransition, RetroGaming, SecurityTerminal } from '../library';\n` + code;
        }

        // Auto-inject compositionConfig if missing
        if (!code.includes('export const compositionConfig')) {
            const compNameMatch = code.match(/export const (\w+)/);
            const compName = compNameMatch ? compNameMatch[1] : 'MyVideo';

            code += `\n\nexport const compositionConfig = {
    component: ${compName},
    durationInSeconds: ${plan.durationInSeconds || 10},
    fps: 30,
    width: 1920,
    height: 1080,
    id: '${compName}',
};`;
        }

        const filename = `Composition_${Date.now()}.tsx`;
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

        const filepath = path.join(uploadDir, filename);
        fs.writeFileSync(filepath, code, 'utf8');

        res.json({ success: true, filename, code, filepath });
    } catch (error) {
        console.error('Orchestrator Error:', error);
        res.status(500).json({ error: 'Failed to orchestrate' });
    }
});

// --- V2 API: Deterministic Composition Engine ---

// V2.1: Director (JSON Planner)
app.post('/api/v2/direct', async (req, res) => {
    const { script, apiKey } = req.body;
    const key = apiKey || process.env.GEMINI_API_KEY;

    if (!key) return res.status(400).json({ error: 'API Key required' });

    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const systemPrompt = fs.readFileSync(path.join(__dirname, 'prompts', 'director-v2.txt'), 'utf8');
        const result = await model.generateContent([systemPrompt, script]);

        let text = result.response.text();
        // Clean markdown
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const plan = JSON.parse(text);
        res.json({ plan });
    } catch (error) {
        console.error('Director V2 Error:', error);
        res.status(500).json({ error: 'Failed to analyze script', details: error.message });
    }
});

// V2.2: Generator (JSON -> TSX -> Render)
app.post('/api/v2/generate', async (req, res) => {
    const { plan } = req.body; // Phase 3 VideoDefinition JSON

    if (!plan || !plan.meta || !plan.scenes) {
        return res.status(400).json({ error: 'Invalid Video Definition JSON' });
    }

    const { id } = plan.meta;
    const timestamp = Date.now();

    // 1. Save JSON Data
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
    const dataFilename = `${id}_${timestamp}.json`;
    const dataPath = path.join(dataDir, dataFilename);
    fs.writeFileSync(dataPath, JSON.stringify(plan, null, 2));

    // 2. Create Wrapper TSX
    // Note: We used to rely on relative paths in createTempProject, 
    // but the generator logic is in 'renderer/generator'.
    // The wrapper needs to import VideoGenerator relative to 'renderer/compositions'.
    // Compositions dir is: renderer/compositions/
    // Generator dir is: renderer/generator/
    // Data dir is: renderer/data/

    // We'll create a new composition file in renderer/compositions
    const compDir = path.join(__dirname, 'compositions');
    if (!fs.existsSync(compDir)) fs.mkdirSync(compDir);
    const compFilename = `${id}_${timestamp}.tsx`;
    const compPath = path.join(compDir, compFilename);

    /* 
       We need to be careful with imports. 
       server.js is in renderer/.
       compPath is in renderer/compositions/.
       We need to import from ../generator/VideoGenerator and ../data/xxx.json
    */

    const code = `import React from 'react';
import { VideoGenerator } from '../generator/VideoGenerator';
import data from '../data/${dataFilename}';
import { VideoDefinition } from '../generator/schema';

// Force cast data to match schema
const videoData = data as unknown as VideoDefinition;

export const GeneratedComposition = () => {
    return <VideoGenerator data={videoData} />;
};

export const compositionConfig = {
    id: '${plan.meta.id}',
    durationInSeconds: ${plan.meta.duration},
    fps: ${plan.meta.fps},
    width: ${plan.meta.dimensions.width},
    height: ${plan.meta.dimensions.height},
};
`;

    fs.writeFileSync(compPath, code);

    // 3. Render
    // Ensure output directory
    const outputDir = path.join(__dirname, 'outputs');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const outputFilename = `${id}_${timestamp}.mp4`;
    const outputPath = path.join(outputDir, outputFilename);

    try {
        console.log(`Starting V2 Render for ${compPath}...`);
        await renderVideo({
            input: compPath,
            output: outputPath
        });

        res.json({
            success: true,
            videoUrl: `/outputs/${outputFilename}`,
            outputPath: outputPath,
            debug: { dataPath, compPath }
        });
    } catch (error) {
        console.error('V2 Render Error:', error);
        res.status(500).json({ error: 'Render failed', details: error.message });
    }
});

// Serve React App for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'web-ui', 'dist', 'index.html'));
});

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

server.on('error', (e) => {
    console.error('Server startup error:', e);
    process.exit(1);
});
