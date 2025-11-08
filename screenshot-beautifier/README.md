# Canvas Studio – Screenshot Beautifier

Canvas Studio is a modern web app that turns raw screenshots into presentation-ready hero visuals. Upload a screenshot, fine-tune the canvas with gradients, glow, noise, and chrome framing, then export a high-resolution PNG in a single click.

## Features

- Gradient or solid backdrops with quick presets and live color pickers
- Adjustable padding, corner radius, window chrome, and floating shadow
- Texture and vignette controls for premium finishing touches
- Drag-and-drop or file picker upload with instant preview
- Export-ready PNG downloads with 1×/2×/3× scale options powered by `html-to-image`
- Tailwind-driven, glassmorphism-inspired interface that feels at home in modern design tooling

## Getting Started

### Prerequisites

- Node.js 18+
- npm 10+ (ships with recent Node releases)

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

The app will be available at <http://localhost:5173>. Hot module replacement is enabled for rapid iteration.

### Create a production build

```bash
npm run build
```

Static assets are emitted to `dist/`. Use `npm run preview` to serve the production bundle locally.

## Usage Tips

1. Drag a PNG, JPG, WEBP, or SVG onto the canvas, or click “Upload Screenshot”.
2. Adjust layout controls (padding, corner radius, shadow) until the frame feels elevated.
3. Experiment with background presets—rotate the gradient angle or swap to a solid tone when you need simplicity.
4. Add subtle grain or vignette for depth, or disable the window chrome for frameless shots.
5. Pick an export scale (2× or 3× works well for retina slides) and click “Export PNG”.

The export button is disabled until a screenshot is loaded. If high-resolution exports fail, try a lower scale or reduce effects.

## Project Structure

```
screenshot-beautifier/
├── src/
│   ├── App.tsx          # Main UI with controls, preview, and export logic
│   ├── index.css        # Tailwind layer definitions and global styles
│   └── main.tsx         # Entry point
├── tailwind.config.js   # Tailwind theme extensions (fonts, colors, noise)
├── postcss.config.js
└── README.md
```

## Tech Stack

- React 19 + TypeScript
- Vite 7 for lightning-fast dev and build
- Tailwind CSS with @tailwindcss/forms & typography plugins
- `html-to-image` for client-side PNG generation
- clsx for ergonomic class composition

---

Have ideas for additional presets or export targets (SVG, transparent backgrounds, device frames)? Contributions and issues are welcome! 🎨📸
