import { z } from 'zod';

// --- Shared Types ---

const TimingSchema = z.object({
    start: z.number(),
    end: z.number()
});

const AnimationSchema = z.object({
    type: z.string(),
    duration: z.number().optional(),
    delay: z.number().optional(),
    ease: z.string().optional()
});

// --- Content Schemas ---

const BarChartSchema = z.object({
    type: z.literal('bar'),
    data: z.array(z.object({
        label: z.string(),
        value: z.number(),
        color: z.string().optional()
    })),
    color: z.string().optional(),
    title: z.string().optional(),
    animation: AnimationSchema.optional()
});

const LineChartSchema = z.object({
    type: z.literal('line'),
    data: z.array(z.object({
        x: z.union([z.number(), z.string()]),
        y: z.number()
    })),
    color: z.string().optional(),
    title: z.string().optional(),
    animation: AnimationSchema.optional()
});

const AreaChartSchema = z.object({
    type: z.literal('area'),
    data: z.array(z.object({
        x: z.union([z.number(), z.string()]),
        y: z.number()
    })),
    color: z.string().optional(),
    title: z.string().optional(),
    animation: AnimationSchema.optional()
});

const HeaderSchema = z.object({
    category: z.string().optional(),
    title: z.string(),
    subtitle: z.string().optional(),
    align: z.enum(['left', 'center', 'right']).optional(),
    color: z.string().optional(),
});

const StatCalloutSchema = z.object({
    type: z.literal('stat_callout'),
    value: z.union([z.string(), z.number()]),
    label: z.string(),
    color: z.string().optional(),
    position: z.enum(['top_left', 'top_right', 'bottom_left', 'bottom_right', 'center']).optional(),
    animation: AnimationSchema.optional()
});

// --- Scene Types ---

const SplitscreenContentSchema = z.object({
    global: z.object({
        title: z.string().optional(),
        titleAnimation: AnimationSchema.optional()
    }).optional(),
    left: z.object({
        header: HeaderSchema.optional(),
        chart: z.union([BarChartSchema, LineChartSchema, AreaChartSchema]).optional()
    }),
    right: z.object({
        header: HeaderSchema.optional(),
        chart: z.union([BarChartSchema, LineChartSchema, AreaChartSchema]).optional()
    }),
    divider: z.boolean().optional(),
    ratio: z.number().optional()
});

const TransitionContentSchema = z.object({
    effect: z.enum(['wipe', 'arrow_sweep', 'dissolve']),
    from: z.enum(['left', 'right', 'up', 'down']).optional(),
    to: z.enum(['left', 'right', 'up', 'down']).optional(),
    color: z.string().optional(),
    message: z.object({
        text: z.string(),
        position: z.string().optional(),
        color: z.string().optional()
    }).optional()
});

const LayoutContentSchema = z.any(); // Fallback for specific layouts, refined below

// --- Scene Definition ---

const SceneSchema = z.object({
    id: z.string(),
    type: z.enum(['split_screen', 'overlay', 'transition', 'full_bleed', 'grid']),
    duration: z.number(), // in seconds
    timing: TimingSchema.optional(),
    content: z.union([
        SplitscreenContentSchema,
        TransitionContentSchema,
        StatCalloutSchema, // Used in 'overlay'
        z.record(z.any()) // Catch-all for other types
    ])
});

// --- Main Video Definition ---

export const VideoDefinitionSchema = z.object({
    meta: z.object({
        id: z.string(),
        title: z.string(),
        duration: z.number(),
        fps: z.number(),
        dimensions: z.object({
            width: z.number(),
            height: z.number()
        })
    }),
    theme: z.enum(['bloomberg', 'wsj', 'ft', 'default']).optional(),
    scenes: z.array(SceneSchema)
});

export type VideoDefinition = z.infer<typeof VideoDefinitionSchema>;
export type SceneDefinition = z.infer<typeof SceneSchema>;
