import React from 'react';
import { VideoGenerator } from '../generator/VideoGenerator';
import data from '../data/the-glitch-in-the-matrix_1766652290256.json';
import { VideoDefinition } from '../generator/schema';

// Force cast data to match schema
const videoData = data as unknown as VideoDefinition;

export const GeneratedComposition = () => {
    return <VideoGenerator data={videoData} />;
};

export const compositionConfig = {
    id: 'the-glitch-in-the-matrix',
    durationInSeconds: 10,
    fps: 30,
    width: 1920,
    height: 1080,
};
