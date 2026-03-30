# Whiteboard

A feature-rich whiteboard/drawing application built with React + TypeScript + Canvas, inspired by Feishu/Lark's whiteboard.

## Features

- **Drawing Tools**: Pen, line, arrow, rectangle, ellipse, text, eraser
- **Selection**: Click select, drag select, multi-select and move
- **Zoom & Pan**: Scroll wheel zoom, Ctrl+scroll for precise zoom, hand tool for panning
- **Layers**: Add/remove layers, toggle visibility, lock layers
- **Image Import**: Drag & drop images, paste from clipboard
- **Grid System**: Toggle grid display, snap-to-grid alignment
- **Undo/Redo**: 50-step history, Ctrl+Z / Ctrl+Shift+Z
- **Export/Import**: PNG screenshot export, JSON data export/import

## Keyboard Shortcuts

| Key | Tool |
|-----|------|
| V | Select |
| H | Hand (pan) |
| P | Pen |
| L | Line |
| A | Arrow |
| R | Rectangle |
| O | Ellipse |
| T | Text |
| E | Eraser |
| Ctrl+Z | Undo |
| Ctrl+Shift+Z | Redo |
| Delete | Delete selected |
| Ctrl+A | Select all |
| Escape | Deselect |

## Getting Started

```bash
npm install
npm run dev
```

## Tech Stack

- React 18
- TypeScript
- Vite
- Zustand (state management)
- HTML Canvas 2D API
