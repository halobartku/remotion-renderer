# Financial Video Animation System
## A Scalable, Code-First Approach to Bloomberg-Quality Graphics

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Component Library](#component-library)
4. [Data Schema](#data-schema)
5. [Template System](#template-system)
6. [Workflow & Operations](#workflow--operations)
7. [Design Principles](#design-principles)
8. [Implementation Roadmap](#implementation-roadmap)
9. [Examples & Use Cases](#examples--use-cases)

---

## Executive Summary

### The Goal
Create 90% of Bloomberg Terminal quality graphics using pure code, scalable to produce dozens of videos from simple data inputs.

### Core Principle
**Videos = Data + Templates + Timing**

Instead of hand-coding each video, we build:
- A library of reusable components (charts, transitions, typography)
- A template system (comparison, timeline, breakdown, etc.)
- A JSON schema to describe videos
- A rendering engine that combines them

### The Stack
- **Remotion** - Video rendering framework
- **React + TypeScript** - Component development
- **SVG** - All charts and graphics (scalable, animatable)
- **Framer Motion** (optional) - Enhanced animations
- **D3.js** (optional) - Complex chart calculations

---

## System Architecture

```
financial-video-system/
│
├── src/
│   ├── components/           # Reusable building blocks
│   │   ├── charts/
│   │   ├── transitions/
│   │   ├── typography/
│   │   ├── layouts/
│   │   └── decorations/
│   │
│   ├── templates/            # Pre-built video types
│   │   ├── Comparison.tsx
│   │   ├── Timeline.tsx
│   │   ├── Breakdown.tsx
│   │   └── DataStory.tsx
│   │
│   ├── compositions/         # Generated videos
│   │   └── [generated from data]
│   │
│   ├── themes/               # Visual styling
│   │   ├── bloomberg.ts
│   │   ├── wsj.ts
│   │   └── ft.ts
│   │
│   ├── utils/                # Helper functions
│   │   ├── easing.ts
│   │   ├── timing.ts
│   │   ├── colors.ts
│   │   └── animations.ts
│   │
│   └── generator/            # The magic
│       ├── VideoGenerator.tsx
│       ├── SchemaValidator.ts
│       └── ComponentMapper.ts
│
└── data/                     # Video definitions
    ├── fed-wrong-turn.json
    ├── inflation-surge.json
    └── market-crash.json
```

---

## Component Library

### 1. Charts (`/components/charts`)

#### BarChart.tsx
```typescript
interface BarChartProps {
  data: Array<{value: number, label: string}>;
  color: string;
  animationDuration: number;
  startFrame: number;
  style: 'grouped' | 'stacked' | 'single';
}
```

**Features:**
- Smooth bar rise animation
- Configurable colors, spacing, labels
- Grid lines with proper scaling
- Value labels with number formatting
- Responsive to container size

**Animation Pattern:**
- Bars rise sequentially or simultaneously
- Easing: `Easing.out(Easing.cubic)`
- Timing: Each bar takes 20-30 frames

---

#### LineChart.tsx
```typescript
interface LineChartProps {
  data: Array<{x: number, y: number}>;
  color: string;
  gradient?: boolean;
  smooth?: boolean; // Bezier curves
  animationStyle: 'draw' | 'reveal' | 'fade';
}
```

**Features:**
- SVG path drawing animation
- Optional area fill with gradient
- Smooth bezier interpolation
- Multiple line support
- Point highlights

**Animation Pattern:**
- Path draws from left to right
- Use `strokeDasharray` and `strokeDashoffset`
- Easing: `Easing.inOut(Easing.cubic)`

---

#### AreaChart.tsx
Similar to LineChart but with filled area below curve.

---

### 2. Transitions (`/components/transitions`)

#### Wipe.tsx
```typescript
interface WipeProps {
  direction: 'left' | 'right' | 'up' | 'down';
  color: string;
  duration: number;
  startFrame: number;
}
```

Clean directional reveal/conceal.

---

#### ArrowSweep.tsx
```typescript
interface ArrowSweepProps {
  from: {x: string, y: string};
  to: {x: string, y: string};
  color: string;
  thickness: number;
  startFrame: number;
  duration: number;
}
```

Sleek arrow animation for directional flow.

---

#### Morph.tsx
```typescript
interface MorphProps {
  from: string; // SVG path
  to: string;   // SVG path
  duration: number;
  startFrame: number;
}
```

Smooth SVG shape morphing (for icon transformations, etc).

---

#### Dissolve.tsx
```typescript
interface DissolveProps {
  target: ReactNode;
  particleCount: number;
  style: 'geometric' | 'dust' | 'pixels';
}
```

Clean dissolve transition.

---

### 3. Typography (`/components/typography`)

#### Headline.tsx
```typescript
interface HeadlineProps {
  text: string;
  level: 1 | 2 | 3;
  align: 'left' | 'center' | 'right';
  color?: string;
  animation: 'fade' | 'slide' | 'none';
}
```

Hierarchical text with consistent styling.

**Levels:**
- Level 1: 56-72px, main title
- Level 2: 38-48px, section headers
- Level 3: 24-32px, sub-headers

---

#### StatCallout.tsx
```typescript
interface StatCalloutProps {
  value: string | number;
  label: string;
  color: string;
  size: 'small' | 'medium' | 'large';
  countUp?: boolean; // Animated number counting
}
```

Highlighted statistical information.

---

#### Label.tsx
```typescript
interface LabelProps {
  text: string;
  variant: 'axis' | 'category' | 'value' | 'timestamp';
  color?: string;
}
```

Small labels for charts and annotations.

---

### 4. Layouts (`/components/layouts`)

#### SplitScreen.tsx
```typescript
interface SplitScreenProps {
  left: ReactNode;
  right: ReactNode;
  divider?: boolean;
  ratio?: number; // 0.5 = 50/50
}
```

Two-column comparison layout.

---

#### Grid.tsx
```typescript
interface GridProps {
  items: ReactNode[];
  columns: number;
  gap: number;
  animation: 'stagger' | 'simultaneous';
}
```

Multi-item grid layout.

---

#### FullBleed.tsx
```typescript
interface FullBleedProps {
  background: string | ReactNode;
  overlay?: ReactNode;
  centered?: boolean;
}
```

Full-screen content area.

---

### 5. Decorations (`/components/decorations`)

#### GridOverlay.tsx
Subtle background grid pattern.

#### Accent.tsx
Colored accent lines and shapes.

#### Glow.tsx
Subtle glow effects for emphasis.

---

## Data Schema

### Video Definition Structure

```json
{
  "meta": {
    "id": "fed-wrong-turn",
    "title": "The Fed's Wrong Turn",
    "duration": 10,
    "fps": 30,
    "dimensions": {
      "width": 1920,
      "height": 1080
    }
  },
  "theme": "bloomberg",
  "template": "comparison",
  "scenes": [
    {
      "id": "intro",
      "duration": 3,
      "type": "split_screen",
      "timing": {
        "start": 0,
        "end": 90
      },
      "content": {
        "global": {
          "title": "THE FED'S WRONG TURN",
          "titleAnimation": {
            "type": "fade",
            "duration": 30,
            "delay": 0
          }
        },
        "left": {
          "header": {
            "category": "Expectation",
            "title": "2020 Outlook",
            "subtitle": "Rates at zero indefinitely"
          },
          "chart": {
            "type": "line",
            "data": [
              {"x": 2020, "y": 0},
              {"x": 2021, "y": 0},
              {"x": 2022, "y": 0},
              {"x": 2023, "y": 0},
              {"x": 2024, "y": 0}
            ],
            "color": "#10b981",
            "animation": {
              "type": "draw",
              "duration": 60,
              "delay": 20
            }
          }
        },
        "right": {
          "header": {
            "category": "Reality",
            "title": "2022-2023",
            "subtitle": "The fastest tightening cycle"
          },
          "chart": {
            "type": "bar",
            "data": [
              {"label": "Mar '22", "value": 0.25},
              {"label": "May", "value": 0.75},
              {"label": "Jun", "value": 1.25},
              {"label": "Jul", "value": 1.75},
              {"label": "Sep", "value": 2.50},
              {"label": "Nov", "value": 3.25},
              {"label": "Dec", "value": 3.75},
              {"label": "Feb '23", "value": 4.25},
              {"label": "Mar", "value": 4.75},
              {"label": "May", "value": 5.00},
              {"label": "Jul", "value": 5.25}
            ],
            "color": "#f59e0b",
            "animation": {
              "type": "sequential_rise",
              "duration": 90,
              "delay": 30
            }
          }
        }
      }
    },
    {
      "id": "callout",
      "duration": 2,
      "type": "overlay",
      "timing": {
        "start": 180,
        "end": 240
      },
      "content": {
        "component": "stat_callout",
        "position": "bottom_right",
        "data": {
          "value": "11 HIKES",
          "label": "IN 16 MONTHS",
          "color": "#f59e0b"
        },
        "animation": {
          "type": "slide_up",
          "duration": 30,
          "delay": 0
        }
      }
    },
    {
      "id": "transition",
      "duration": 2,
      "type": "transition",
      "timing": {
        "start": 240,
        "end": 300
      },
      "content": {
        "effect": "arrow_sweep",
        "from": "right",
        "to": "left",
        "color": "#f59e0b",
        "message": {
          "text": "EXPECTATIONS SHATTERED",
          "position": "center",
          "color": "#ef4444"
        }
      }
    }
  ]
}
```

---

## Template System

### Templates are Pre-Built Video Types

Each template defines:
1. **Layout structure** (split screen, timeline, grid, etc.)
2. **Default timing patterns**
3. **Component arrangements**
4. **Transition styles**

---

### Template: Comparison

**Purpose:** Show two contrasting scenarios side-by-side

**Structure:**
- Title card (0-1s)
- Split screen reveals (1-4s)
- Data builds on both sides (4-8s)
- Callout or conclusion (8-10s)

**Use Cases:**
- Expected vs Reality
- Before vs After
- Plan vs Actual
- Two competing theories

**Components Used:**
- SplitScreen layout
- LineChart or BarChart
- StatCallout
- ArrowSweep transition

---

### Template: Timeline

**Purpose:** Show progression of events over time

**Structure:**
- Horizontal timeline appears (0-1s)
- Events populate sequentially (1-8s)
- Final summary (8-10s)

**Use Cases:**
- Market crash sequence
- Policy changes over time
- Company milestones
- Economic crisis timeline

**Components Used:**
- TimelineAxis
- EventMarker
- LineChart (background)
- Label

---

### Template: Breakdown

**Purpose:** Decompose a whole into parts

**Structure:**
- Show total (0-2s)
- Break into segments (2-6s)
- Highlight key segments (6-8s)
- Summary (8-10s)

**Use Cases:**
- Budget allocation
- Market share
- Portfolio composition
- Revenue sources

**Components Used:**
- PieChart or StackedBar
- PercentageLabel
- AnimatedArrow
- StatCallout

---

### Template: DataStory

**Purpose:** Tell a narrative through data points

**Structure:**
- Scene 1: Setup (0-3s)
- Scene 2: Rising action (3-6s)
- Scene 3: Climax (6-8s)
- Scene 4: Resolution (8-10s)

**Use Cases:**
- Stock price movements
- Economic indicators
- Crisis unfolding
- Success story

**Components Used:**
- AreaChart
- AnnotationArrow
- Headline
- FullBleed

---

## Workflow & Operations

### How to Create a New Video

#### Step 1: Choose Template
```bash
npm run create-video --template=comparison
```

Generates starter JSON file.

---

#### Step 2: Fill in Data
Edit the JSON file with your specific:
- Title
- Data points
- Colors
- Labels
- Timing preferences (optional, uses defaults)

---

#### Step 3: Generate Video
```bash
npm run generate -- data/my-video.json
```

The system:
1. Validates the JSON schema
2. Maps data to appropriate components
3. Applies theme styling
4. Calculates timing
5. Generates TSX composition
6. Renders video

---

#### Step 4: Review & Iterate
```bash
npm run preview -- compositions/my-video
```

Make adjustments to JSON, regenerate.

---

### Advanced: Custom Components

If you need something new:

1. Build component following the library patterns
2. Add to component registry
3. Define schema for the component
4. Use in JSON files

---

## Design Principles

### 1. **Minimal is Professional**
- Maximum 3-4 colors per video
- Clean backgrounds (#0a0d14 to #161b26)
- Subtle gradients only
- No unnecessary decorations

---

### 2. **Data is the Hero**
- Charts should be largest elements
- Text supports, doesn't dominate
- White space is essential
- Hierarchy through size, not color

---

### 3. **Timing is Music**
- Animations hit on 8-frame beats (for 30fps)
- Transitions: 20-30 frames
- Reveals: 30-40 frames
- Holds: Minimum 60 frames

---

### 4. **Easing Creates Elegance**
**Never use linear easing.**

Standard curves:
- **Entrance:** `Easing.out(Easing.cubic)` - Fast start, slow end
- **Exit:** `Easing.in(Easing.cubic)` - Slow start, fast end
- **Movement:** `Easing.inOut(Easing.cubic)` - Smooth both ends
- **Bounce (sparingly):** `Easing.out(Easing.back(1.5))`

---

### 5. **Hierarchy Through Typography**

```typescript
const typographyScale = {
  title: {
    fontSize: 56,
    fontWeight: 700,
    letterSpacing: -1,
  },
  headline: {
    fontSize: 38,
    fontWeight: 700,
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 24,
    fontWeight: 600,
    letterSpacing: 0,
  },
  body: {
    fontSize: 18,
    fontWeight: 400,
    letterSpacing: 0,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  caption: {
    fontSize: 11,
    fontWeight: 400,
    letterSpacing: 0.5,
  },
};
```

---

### 6. **Color System**

```typescript
const bloombergTheme = {
  background: {
    primary: '#0a0d14',
    secondary: '#161b26',
    tertiary: '#1f2937',
  },
  text: {
    primary: '#ffffff',
    secondary: '#9ca3af',
    tertiary: '#6b7280',
  },
  accent: {
    positive: '#10b981', // Green
    negative: '#ef4444', // Red
    neutral: '#3b82f6',  // Blue
    warning: '#f59e0b',  // Amber
  },
  chart: {
    line: 'rgba(59, 130, 246, 0.8)',
    fill: 'rgba(59, 130, 246, 0.1)',
    grid: 'rgba(255, 255, 255, 0.05)',
  },
};
```

---

### 7. **Grid System**

All layouts based on 8px grid:
- Padding: 8, 16, 24, 32, 48
- Margins: 16, 24, 32, 48, 64
- Element sizes: multiples of 8

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
**Goal:** Core component library

- [ ] Set up project structure
- [ ] Build base components:
  - [ ] BarChart
  - [ ] LineChart
  - [ ] AreaChart
  - [ ] Headline
  - [ ] StatCallout
  - [ ] Label
- [ ] Create theme system
- [ ] Define animation utilities
- [ ] Build SplitScreen layout

**Deliverable:** Can manually create comparison videos in TSX

---

### Phase 2: Templates (Week 3)
**Goal:** Pre-built video types

- [ ] Build Comparison template
- [ ] Build Timeline template
- [ ] Build Breakdown template
- [ ] Create template documentation
- [ ] Test with 3 real scenarios

**Deliverable:** Can create videos faster with templates

---

### Phase 3: Data-Driven (Week 4-5)
**Goal:** JSON to video generation

- [ ] Define JSON schema
- [ ] Build schema validator
- [ ] Create VideoGenerator component
- [ ] Build component mapper
- [ ] Create CLI tools
- [ ] Write generator tests

**Deliverable:** Can generate videos from JSON

---

### Phase 4: Scale (Week 6+)
**Goal:** Production pipeline

- [ ] Add more chart types (scatter, pie, stacked)
- [ ] Build transition library
- [ ] Create advanced templates
- [ ] Optimize rendering performance
- [ ] Build preview system
- [ ] Create documentation site
- [ ] Set up batch rendering

**Deliverable:** Full production system

---

## Examples & Use Cases

### Example 1: Market Crash
**Template:** Timeline
**Duration:** 10s

Shows sequence of events leading to crash:
- Opening bell (normal)
- First warning signs
- Panic selling
- Circuit breaker
- Aftermath

**Data Points:**
- Time markers
- Price levels
- Volume spikes
- News headlines

---

### Example 2: GDP Growth
**Template:** Comparison
**Duration:** 10s

Forecast vs Actual GDP:
- Left: Analyst projections (line chart)
- Right: Actual data (bar chart)
- Callout: Variance percentage

---

### Example 3: Portfolio Breakdown
**Template:** Breakdown
**Duration:** 10s

Asset allocation:
- Start with total value
- Break into sectors (pie chart)
- Highlight top performers
- Show YoY change

---

## Best Practices

### DO:
✅ Use SVG for all charts (scalable, animatable)
✅ Keep animations under 40 frames
✅ Test on multiple screen sizes
✅ Use monospace fonts for numbers
✅ Add subtle shadows for depth
✅ Validate all data before rendering
✅ Use semantic component names
✅ Document timing choices
✅ Version control your JSON schemas

### DON'T:
❌ Use PNG/JPG for charts
❌ Animate everything at once
❌ Use more than 4 colors
❌ Rely on complex effects
❌ Hardcode values in components
❌ Skip easing functions
❌ Forget about accessibility
❌ Ignore render performance
❌ Mix animation styles

---

## Performance Optimization

### Rendering Speed
1. **Lazy load components** - Only load what's needed
2. **Memoize calculations** - Use useMemo for chart paths
3. **Batch renders** - Render multiple videos in parallel
4. **Cache common elements** - Reuse theme objects

### File Size
1. **SVG optimization** - Remove unnecessary paths
2. **Code splitting** - Separate templates into chunks
3. **Tree shaking** - Remove unused components

---

## Maintenance & Evolution

### Monthly Reviews
- Analyze which templates are most used
- Gather feedback on component limitations
- Review new Bloomberg/FT graphics for inspiration
- Update color palettes based on trends

### Quarterly Updates
- Add 2-3 new templates
- Expand chart type library
- Optimize performance
- Update documentation

### Yearly Roadmap
- Major version updates
- New animation techniques
- Integration with data sources
- AI-assisted video generation

---

## Success Metrics

### Quality Benchmarks
- **Visual:** 9/10 compared to Bloomberg
- **Render time:** <30 seconds for 10s video
- **Reusability:** 80% of components shared across videos
- **Speed:** New video in <30 minutes (from data to render)

### Scale Metrics
- **Production rate:** 10+ videos per week
- **Template coverage:** 90% of use cases
- **Code reuse:** <100 lines per new video
- **Iteration speed:** <5 minutes per revision

---

## Conclusion

This system prioritizes:
1. **Code as the source of truth** - No GUI tools
2. **Data-driven creation** - JSON inputs, video outputs
3. **Scalability** - Build once, use infinitely
4. **Professional quality** - 90% of Bloomberg standard
5. **Speed** - From concept to video in minutes

By focusing on **reusable components**, **data schemas**, and **timing precision** rather than complex effects, we achieve professional results through systematic engineering.

---

**Next Steps:**
1. Start with Phase 1 (Foundation)
2. Build 3 core templates
3. Generate your first 5 videos
4. Iterate based on results
5. Scale the system

The goal isn't to match Bloomberg's tools—it's to match their **output** through superior **process**.
