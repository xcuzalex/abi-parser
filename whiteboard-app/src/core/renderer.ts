import type { WhiteboardElement, Camera, GridConfig, Bounds, Point } from '../types';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private dpr: number;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2d context');
    this.ctx = ctx;
    this.dpr = window.devicePixelRatio || 1;
    this.width = canvas.width / this.dpr;
    this.height = canvas.height / this.dpr;
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    const canvas = this.ctx.canvas;
    canvas.width = width * this.dpr;
    canvas.height = height * this.dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    this.ctx.scale(this.dpr, this.dpr);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  renderGrid(camera: Camera, grid: GridConfig) {
    if (!grid.enabled) return;
    const { ctx } = this;
    const { x: cx, y: cy, zoom } = camera;
    const gridSize = grid.size * zoom;

    if (gridSize < 5) return; // too small to render

    ctx.save();
    ctx.strokeStyle = grid.color;
    ctx.lineWidth = 0.5;

    const offsetX = (cx * zoom) % gridSize;
    const offsetY = (cy * zoom) % gridSize;

    for (let x = offsetX; x < this.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }

    for (let y = offsetY; y < this.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  renderElement(element: WhiteboardElement, camera: Camera) {
    const { ctx } = this;
    const { x: cx, y: cy, zoom } = camera;

    ctx.save();
    ctx.translate(cx * zoom, cy * zoom);
    ctx.scale(zoom, zoom);

    ctx.globalAlpha = element.style.opacity;

    // Apply rotation
    if (element.rotation !== 0) {
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((element.rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
    }

    switch (element.type) {
      case 'pen':
        this.renderPen(element);
        break;
      case 'line':
        this.renderLine(element);
        break;
      case 'arrow':
        this.renderArrow(element);
        break;
      case 'rectangle':
        this.renderRectangle(element);
        break;
      case 'ellipse':
        this.renderEllipse(element);
        break;
      case 'text':
        this.renderText(element);
        break;
      case 'image':
        this.renderImage(element);
        break;
    }

    ctx.restore();
  }

  private renderPen(el: WhiteboardElement & { type: 'pen' }) {
    const { ctx } = this;
    if (el.points.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = el.style.strokeColor;
    ctx.lineWidth = el.style.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.moveTo(el.points[0].x, el.points[0].y);
    for (let i = 1; i < el.points.length; i++) {
      const prev = el.points[i - 1];
      const curr = el.points[i];
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
    }

    const last = el.points[el.points.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
  }

  private renderLine(el: WhiteboardElement & { type: 'line' }) {
    const { ctx } = this;
    ctx.beginPath();
    ctx.strokeStyle = el.style.strokeColor;
    ctx.lineWidth = el.style.strokeWidth;
    ctx.lineCap = 'round';
    ctx.moveTo(el.points[0].x, el.points[0].y);
    ctx.lineTo(el.points[1].x, el.points[1].y);
    ctx.stroke();
  }

  private renderArrow(el: WhiteboardElement & { type: 'arrow' }) {
    const { ctx } = this;
    const [start, end] = el.points;

    // Line
    ctx.beginPath();
    ctx.strokeStyle = el.style.strokeColor;
    ctx.lineWidth = el.style.strokeWidth;
    ctx.lineCap = 'round';
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    // Arrowhead
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const headLen = 12 + el.style.strokeWidth * 2;
    ctx.beginPath();
    ctx.fillStyle = el.style.strokeColor;
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - headLen * Math.cos(angle - Math.PI / 6),
      end.y - headLen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      end.x - headLen * Math.cos(angle + Math.PI / 6),
      end.y - headLen * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  }

  private renderRectangle(el: WhiteboardElement & { type: 'rectangle' }) {
    const { ctx } = this;
    ctx.beginPath();
    ctx.rect(el.x, el.y, el.width, el.height);

    if (el.style.fillColor !== 'transparent') {
      ctx.fillStyle = el.style.fillColor;
      ctx.fill();
    }
    ctx.strokeStyle = el.style.strokeColor;
    ctx.lineWidth = el.style.strokeWidth;
    ctx.stroke();
  }

  private renderEllipse(el: WhiteboardElement & { type: 'ellipse' }) {
    const { ctx } = this;
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;
    const rx = Math.abs(el.width) / 2;
    const ry = Math.abs(el.height) / 2;

    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);

    if (el.style.fillColor !== 'transparent') {
      ctx.fillStyle = el.style.fillColor;
      ctx.fill();
    }
    ctx.strokeStyle = el.style.strokeColor;
    ctx.lineWidth = el.style.strokeWidth;
    ctx.stroke();
  }

  private renderText(el: WhiteboardElement & { type: 'text' }) {
    const { ctx } = this;
    ctx.font = `${el.fontSize}px ${el.fontFamily}`;
    ctx.fillStyle = el.style.strokeColor;
    ctx.textBaseline = 'top';

    const lines = el.text.split('\n');
    const lineHeight = el.fontSize * 1.3;
    lines.forEach((line, i) => {
      ctx.fillText(line, el.x, el.y + i * lineHeight);
    });
  }

  private renderImage(el: WhiteboardElement & { type: 'image' }) {
    // Image rendering is handled by caching loaded images
    const img = imageCache.get(el.src);
    if (img) {
      this.ctx.drawImage(img, el.x, el.y, el.width, el.height);
    }
  }

  renderSelectionBox(bounds: Bounds, camera: Camera) {
    const { ctx } = this;
    const { x: cx, y: cy, zoom } = camera;

    ctx.save();
    ctx.translate(cx * zoom, cy * zoom);
    ctx.scale(zoom, zoom);

    ctx.strokeStyle = '#4a90d9';
    ctx.lineWidth = 1 / zoom;
    ctx.setLineDash([4 / zoom, 4 / zoom]);
    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.setLineDash([]);

    // Resize handles
    const handleSize = 8 / zoom;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#4a90d9';
    ctx.lineWidth = 1.5 / zoom;

    const handles = [
      { x: bounds.x, y: bounds.y },
      { x: bounds.x + bounds.width, y: bounds.y },
      { x: bounds.x, y: bounds.y + bounds.height },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
      { x: bounds.x + bounds.width / 2, y: bounds.y },
      { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height },
      { x: bounds.x, y: bounds.y + bounds.height / 2 },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 },
    ];

    handles.forEach((h) => {
      ctx.beginPath();
      ctx.rect(
        h.x - handleSize / 2,
        h.y - handleSize / 2,
        handleSize,
        handleSize
      );
      ctx.fill();
      ctx.stroke();
    });

    ctx.restore();
  }

  renderSelectionRect(start: Point, end: Point, camera: Camera) {
    const { ctx } = this;
    ctx.save();
    ctx.strokeStyle = '#4a90d9';
    ctx.fillStyle = 'rgba(74, 144, 217, 0.1)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const w = Math.abs(end.x - start.x);
    const h = Math.abs(end.y - start.y);

    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);
    ctx.restore();
  }
}

// Simple image cache
export const imageCache = new Map<string, HTMLImageElement>();

export function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}
