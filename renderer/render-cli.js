/**
 * Remotion CLI Renderer
 *
 * Renders a standalone TSX composition file to MP4.
 *
 * Usage:
 *   node render-cli.js --input=path/to/file.tsx [--output=path/to/output.mp4]
 */

const path = require('path');
const fs = require('fs');
const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition, ensureBrowser } = require('@remotion/renderer');

const { extractCompositionConfig } = require('./lib/config-extractor');
const { createTempProject, cleanupTempProject } = require('./lib/temp-project');
const { validateTsxFile } = require('./lib/validators');
const { banner, log, error, success, progress, clearProgress } = require('./lib/console');

// Parse command line arguments
function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach(arg => {
    if (arg.startsWith('--')) {
      const eqIndex = arg.indexOf('=');
      if (eqIndex > 0) {
        const key = arg.slice(2, eqIndex);
        const value = arg.slice(eqIndex + 1);
        // Remove surrounding quotes if present
        args[key] = value.replace(/^["']|["']$/g, '');
      } else {
        args[arg.slice(2)] = true;
      }
    } else if (!args._positional) {
      args._positional = [arg];
    } else {
      args._positional.push(arg);
    }
  });
  return args;
}

// Generate unique output filename
function generateOutputPath(inputPath) {
  const dir = path.dirname(inputPath);
  const baseName = path.basename(inputPath, '.tsx');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return path.join(dir, `${baseName}_${timestamp}.mp4`);
}

async function renderVideo(options = null) {
  const isCLI = !options;
  const args = options || parseArgs();

  if (isCLI) {
    banner('Remotion Video Renderer');
  }

  const inputPath = args.input || (args._positional && args._positional[0]);

  if (!inputPath) {
    if (isCLI) {
      error('No input file specified');
      console.log('');
      console.log('  Usage: render-cli.js --input=file.tsx [--output=output.mp4]');
      console.log('');
      process.exit(1);
    }
    throw new Error('No input file specified');
  }

  // Resolve to absolute path
  const absoluteInputPath = path.resolve(inputPath);

  // Validate input file
  try {
    validateTsxFile(absoluteInputPath);
  } catch (err) {
    if (isCLI) {
      error(err.message);
      process.exit(1);
    }
    throw err;
  }

  // Determine output path
  let outputPath = args.output
    ? path.resolve(args.output)
    : generateOutputPath(absoluteInputPath);

  if (!outputPath.toLowerCase().endsWith('.mp4')) {
    outputPath += '.mp4';
  }

  log('Input', absoluteInputPath);
  log('Output', outputPath);
  console.log('');

  // Extract composition config from TSX file
  log('Extracting composition config...');
  let config;
  try {
    config = extractCompositionConfig(absoluteInputPath);
    log('Composition ID', config.id);
    log('Duration', `${config.durationInSeconds}s at ${config.fps}fps`);
    log('Resolution', `${config.width}x${config.height}`);
  } catch (err) {
    const errorMsg = `Failed to extract composition config: ${err.message}`;
    if (isCLI) {
      error(errorMsg);
      console.log('');
      console.log('  Hint: Ensure your TSX file exports a compositionConfig object:');
      console.log('');
      console.log('    export const compositionConfig = {');
      console.log("      id: 'MyVideo',");
      console.log('      durationInSeconds: 5,');
      console.log('      fps: 30,');
      console.log('      width: 1080,');
      console.log('      height: 1920,');
      console.log('    };');
      console.log('');
      process.exit(1);
    }
    throw new Error(errorMsg);
  }

  let tempProjectDir = null;

  try {
    // Ensure browser is available
    console.log('');
    log('Checking browser...');
    await ensureBrowser({
      logLevel: 'error',
      onBrowserDownload: () => {
        return {
          version: null,
          onProgress: ({ percent }) => {
            progress(`Downloading browser: ${Math.round(percent * 100)}%`);
          },
        };
      },
    });
    clearProgress();
    success('Browser ready');

    // Create temporary project with user's TSX file
    log('Creating temporary project...');
    tempProjectDir = createTempProject(absoluteInputPath, config);
    success('Temporary project created');

    // Bundle the project
    log('Bundling project...');
    const entryPoint = path.join(tempProjectDir, 'src', 'index.ts');

    // Get the renderer's node_modules path for dependency resolution
    const rendererNodeModules = path.resolve(__dirname, 'node_modules');

    const bundleLocation = await bundle({
      entryPoint,
      webpackOverride: (webpackConfig) => {
        // Add renderer's node_modules to module resolution paths
        webpackConfig.resolve = webpackConfig.resolve || {};
        webpackConfig.resolve.modules = [
          rendererNodeModules,
          ...(webpackConfig.resolve.modules || ['node_modules']),
        ];

        // Also add to loader resolution
        webpackConfig.resolveLoader = webpackConfig.resolveLoader || {};
        webpackConfig.resolveLoader.modules = [
          rendererNodeModules,
          ...(webpackConfig.resolveLoader.modules || ['node_modules']),
        ];

        // CRITICAL FIX: Ensure external files (library/uploads) are transpiled
        const rendererRoot = path.resolve(__dirname);
        const rules = webpackConfig.module.rules || [];

        // Helper to add include path to a rule
        const addInclude = (rule) => {
          // Check for TS/TSX rules (usually match .ts, .tsx)
          if (rule.test && (rule.test.toString().includes('ts') || rule.test.toString().includes('js'))) {
            if (!rule.include) {
              // If no include was present, adding one restricts it.
              // We MUST include the tempProjectDir (where the entry point is) AND the rendererRoot.
              rule.include = [rendererRoot, tempProjectDir];
            } else {
              if (!Array.isArray(rule.include)) rule.include = [rule.include];
              rule.include.push(rendererRoot);
              rule.include.push(tempProjectDir);
            }
          }
          // Recurse for oneOf
          if (rule.oneOf) {
            rule.oneOf.forEach(addInclude);
          }
        };

        rules.forEach(addInclude);

        // Explicitly set alias for ../library resolution from uploads folder if needed
        // but cleaner to just ensuring transpilation works.
        // Actually, let's force an alias just in case relative paths are being weird in the temp dir context
        webpackConfig.resolve.alias = {
          ...(webpackConfig.resolve.alias || {}),
          '../library': path.join(rendererRoot, 'library'),
        };

        return webpackConfig;
      },
      onProgress: (percent) => {
        progress(`Bundling: ${Math.round(percent * 100)}%`);
      },
    });
    clearProgress();
    success('Bundle complete');

    // Select composition
    log('Selecting composition...');
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: config.id,
    });
    success(`Selected: ${composition.id}`);

    // Render the video
    const durationInFrames = Math.round(config.durationInSeconds * config.fps);
    console.log('');
    log('Rendering video...');
    console.log(`    ${durationInFrames} frames at ${config.fps}fps`);

    await renderMedia({
      composition: {
        ...composition,
        durationInFrames,
        fps: config.fps,
        width: config.width,
        height: config.height,
      },
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      onProgress: ({ progress: p }) => {
        progress(`Rendering: ${Math.round(p * 100)}%`);
      },
    });

    clearProgress();
    console.log('');
    success('Render complete!');
    console.log('');
    console.log(`  Output: ${outputPath}`);
    console.log('');

    if (isCLI) {
      process.exit(0);
    }
    return { outputPath };

  } catch (err) {
    clearProgress();

    // Provide helpful hints for common errors (logic kept for logging purposes)
    let hint = '';

    if (err.message.includes('compositionConfig')) {
      hint = '  Hint: Check that your compositionConfig is properly formatted';
    } else if (err.message.includes('Module not found')) {
      const moduleMatch = err.message.match(/Can't resolve '([^']+)'/);
      if (moduleMatch) {
        hint = `  Hint: Module '${moduleMatch[1]}' is not installed in the renderer`;
      } else {
        hint = '  Hint: Your TSX file uses a dependency not included in the renderer\n\n  Supported libraries:\n    - react, remotion (core)\n    - three, @react-three/fiber, @react-three/drei\n    - @remotion/* packages (media-utils, noise, shapes, etc.)\n    - framer-motion, d3, lodash, zod';
      }
    } else if (err.message.includes('ENOENT')) {
      hint = '  Hint: A required file or directory was not found';
    }

    if (isCLI) {
      error(`Render failed: ${err.message}`);
      if (hint) console.log(hint);
      if (args.verbose) {
        console.log('');
        console.log('  Stack trace:');
        console.log(err.stack);
      }
      process.exit(1);
    }

    // Propagate error with hint attached if possible or just original error
    if (hint) {
      err.message += `\n${hint}`;
    }
    throw err;

  } finally {
    // Cleanup temporary project
    if (tempProjectDir) {
      cleanupTempProject(tempProjectDir);
    }
  }
}

if (require.main === module) {
  renderVideo();
}

module.exports = { renderVideo };

