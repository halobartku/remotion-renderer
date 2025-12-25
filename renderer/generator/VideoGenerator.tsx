import React from 'react';
import { Sequence, AbsoluteFill } from 'remotion';
import { VideoDefinition } from './schema';
import { SceneRenderer } from './ComponentMapper';
import { THEME } from '../library/theme';

type VideoGeneratorProps = {
    data: VideoDefinition;
};

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({ data }) => {
    // Determine strict playback or accumulated timing
    // The spec JSON has "timing.start" and "timing.end". We should trust those if present, 
    // or calculate sequential if missing.

    // Sort scenes by start time just in case
    const scenes = [...data.scenes].sort((a, b) => {
        const startA = a.timing?.start || 0;
        const startB = b.timing?.start || 0;
        return startA - startB;
    });

    return (
        <AbsoluteFill style={{ backgroundColor: THEME.colors.obsidian }}>
            {scenes.map((scene) => {
                const startFrame = scene.timing?.start || 0;
                const endFrame = scene.timing?.end || (startFrame + (scene.duration * data.meta.fps));
                const durationInFrames = endFrame - startFrame;

                // Basic validation
                if (durationInFrames <= 0) return null;

                return (
                    <Sequence
                        key={scene.id}
                        from={startFrame}
                        durationInFrames={durationInFrames}
                        name={scene.id}
                    >
                        <SceneRenderer scene={scene} />
                    </Sequence>
                );
            })}
        </AbsoluteFill>
    );
};
