import React from 'react';
import { VideoGenerator } from '../generator/VideoGenerator';
import data from '../data/fed-wrong-turn.json';
import { VideoDefinition } from '../generator/schema';

// Force cast data to match schema since JSON import might be loose
const videoData = data as unknown as VideoDefinition;

export const FedWrongTurn = () => {
    return <VideoGenerator data={videoData} />;
};

export const compositionConfig = {
    id: data.meta.id,
    durationInSeconds: data.meta.duration,
    fps: data.meta.fps,
    width: data.meta.dimensions.width,
    height: data.meta.dimensions.height,
};
