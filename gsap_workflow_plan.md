# Plan: Automated GSAP & Remotion Workflow

This document outlines the architecture to automate the creation of complex, high-quality video scenes using text input, Gemini, GSAP, and Remotion.

## 1. The Workflow Overview

The goal is to take a raw text script (e.g., "The Fed Wrong Turn...") and automatically generate a professional video with custom animated SVGs.

**Input**: Text Script + Scene Description.
**Output**: A fully functional `.tsx` Remotion composition.

### Process Flow
1.  **Director AI (Analysis)**: Parses the input text into a structured Scene Object.
    *   What visuals are needed? (e.g., "Calendar", "Glass shattering effect", "Rate graph").
    *   What is the audio/text sync?
2.  **Asset Generator AI (SVG + GSAP)**: Creates specialized React components for each visual element.
    *   *Prompt*: "Create a React component using `useGSAP` that renders an SVG of a calendar... animate it flipping pages rapidly."
3.  **Composer AI (Remotion)**: Assembles these components into the final timeline.

## 2. Technical Stack & Best Practices

### GSAP + Remotion Integration
To make GSAP work with Remotion (which is frame-based, not time-based), we must **bridge the gap**.

**The Golden Rule**:
Drive the GSAP Timeline using Remotion's `frame`.

**Pattern:**
```javascript
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

const AnimatedComponent = () => {
  const container = useRef();
  const tl = useRef();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  useGSAP(() => {
    // 1. Create a PAUSED timeline
    tl.current = gsap.timeline({ paused: true });
    
    // 2. Define animations
    tl.current.to(".box", { x: 100, duration: 1 });
    
  }, { scope: container });

  // 3. Sync GSAP time with Remotion frame on every render
  useLayoutEffect(() => {
    if (tl.current) {
      const time = frame / fps;
      tl.current.seek(time);
    }
  }, [frame, fps]);

  return <div ref={container} className="box">...</div>;
};
```

### Necessary Dependencies
We have already installed:
- `gsap`
- `@gsap/react`

## 3. Gemini Prompt Strategy

To get the "Fed Wrong Turn" scene working, we need a **Multi-Step Prompting Strategy**.

### Prompt 1: The Scene Analyzer
**Role**: Director
**Task**: Break down the script into visual requirements.
**Input**: "Split Screen Timeline: Left side Calendar 2020-2023... Right side Reality Graph..."
**Output (JSON)**:
```json
{
  "layout": "split-screen",
  "left_element": {
    "type": "svg_animation",
    "description": "Calendar flipping from 2020 to 2023, peaceful, soft colors."
  },
  "right_element": {
    "type": "svg_animation",
    "description": "Line graph spiking upward violently, overlay text 'Reality', glass shattering effect."
  },
  "duration": 10
}
```

### Prompt 2: The Asset Artist (GSAP Expert)
**Role**: Creative Technologist
**Task**: Generate the *Code* for the specific element.
**System Prompt**: 
> "You are an expert in SVG and GSAP v3. Create a React component that renders a complex SVG. Use the `useGSAP` hook. Create a standard GSAP timeline but DO NOT play it. Store it in a ref called `tl`. Export the component."

**User Prompt**: "Create the 'Calendar Expectation' component. It should show..."

### Prompt 3: The Orchestrator
**Role**: Remotion Developer
**Task**: Combine the generated components into the final file.
**System Prompt**: (Similar to your current `Prompt.txt` but updated to import and use the GSAP components).

## 4. Implementation Steps (For "The Fed" Example)

To achieve the specific scene you described:

1.  **Generate `CalendarComponent.tsx`**: 
    *   SVG: Rectangles for pages, text for years.
    *   GSAP: `morphSVG` or simple Translation/Opacity to show pages flying off.
2.  **Generate `RateSpikeComponent.tsx`**:
    *   SVG: A polyline graph.
    *   GSAP: `drawSVG` (or stroke-dashoffset) simply animating the line going up.
    *   "Shattering Glass": This is hard in pure SVG. We might use a pre-made "shattered fragments" SVG group and explode them outwards using GSAP physics or simple `x/y` dispersion.
3.  **Generate `MainComposition.tsx`**:
    *   Uses `AbsoluteFill`.
    *   `div` with `display: flex`.
    *   Left child: `<CalendarComponent />`.
    *   Right child: `<RateSpikeComponent />`.

## 5. What We Need to Do Next

To fully enable this in your locally hosted interface:

1.  **Update `Prompt.txt`**: Create new variations for "SVG Asset Generation" vs "Video Composition".
2.  **Backend Logic**: Update the `/api/generate-svg` endpoint (or make a new `/api/generate-component`) to handle this "Component generation" which includes React logic, not just raw SVG strings.
3.  **Frontend**: Add a "Script to Video" tab where you can paste the full scenario text.
