const { renderVideo } = require('./render-cli');
const path = require('path');

const inputFile = path.resolve(__dirname, 'uploads/Composition_1766546608320.tsx');
const outputDir = path.resolve(__dirname, 'outputs');

console.log('Debugging render for:', inputFile);

async function run() {
    try {
        await renderVideo({
            input: inputFile,
            output: outputDir,
        });
        console.log('Render success!');
    } catch (err) {
        const fs = require('fs');
        fs.writeFileSync('error.log', err.stack || err.toString());
        console.error('RENDER FAILED. Check error.log');
    }
}

run();
