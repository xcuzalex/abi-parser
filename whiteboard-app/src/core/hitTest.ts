import type { WhiteboardElement, Point, Camera } from '../types';

export function screenToWorld(screenX: number, screenY: number, camera: Camera): Point {
  return {
    x: (screenX) / camera.zoom - camera.x,
    y: (screenY) / camera.zoom - camera.y,
  };
}

export function worldToScreen(worldX: number, worldY: number, camera: Camera): Point {
  return {
    x: (worldX + camera.x) * camera.zoom,
    y: (worldY + camera.y) * camera.zoom,
  };
}

export function hitTestElement(point: Point, element: WhiteboardElement, tolerance: number = 4): boolean {
  switch (element.type) {
    case 'pen':
      return hitTestPen(point, element, tolerance);
    case 'line':
    case 'arrow':
      return hitTestLine(point, element.points[0], element.points[1], tolerance);
    case 'rectangle':
      return hitTestRect(point, element, tolerance);
    case 'ellipse':
      return hitTestEllipse(point, element);
    case 'text':
    case 'image':
      return hitTestRect(point, element, 0);
    default:
      return false;
  }
}

function hitTestPen(point: Point, el: WhiteboardElement & { type: 'pen' }, tolerance: number): boolean {
  for (let i = 1; i < el.points.length; i++) {
    if (hitTestLine(point, el.points[i - 1], el.points[i], tolerance + el.style.strokeWidth / 2)) {
      return true;
    }
  }
  return false;
}

function hitTestLine(point: Point, a: Point, b: Point, tolerance: number): boolean {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    const d = Math.hypot(point.x - a.x, point.y - a.y);
    return d <= tolerance;
  }

  let t = ((point.x - a.x) * dx + (point.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  const d = Math.hypot(point.x - projX, point.y - projY);
  return d <= tolerance;
}

function hitTestRect(point: Point, el: WhiteboardElement, tolerance: number): boolean {
  const minX = Math.min(el.x, el.x + el.width) - tolerance;
  const maxX = Math.max(el.x, el.x + el.width) + tolerance;
  const minY = Math.min(el.y, el.y + el.height) - tolerance;
  const maxY = Math.max(el.y, el.y + el.height) + tolerance;
  return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
}

function hitTestEllipse(point: Point, el: WhiteboardElement): boolean {
  const cx = el.x + el.width / 2;
  const cy = el.y + el.height / 2;
  const rx = Math.abs(el.width) / 2;
  const ry = Math.abs(el.height) / 2;
  if (rx === 0 || ry === 0) return false;
  const dx = point.x - cx;
  const dy = point.y - cy;
  return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;
}

export function getElementBounds(element: WhiteboardElement) {
  if (element.type === 'pen') {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of element.points) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }
  if (element.type === 'line' || element.type === 'arrow') {
    const [a, b] = element.points;
    return {
      x: Math.min(a.x, b.x),
      y: Math.min(a.y, b.y),
      width: Math.abs(b.x - a.x),
      height: Math.abs(b.y - a.y),
    };
  }
  return {
    x: Math.min(element.x, element.x + element.width),
    y: Math.min(element.y, element.y + element.height),
    width: Math.abs(element.width),
    height: Math.abs(element.height),
  };
}

export function getSelectionBounds(elements: WhiteboardElement[]) {
  if (elements.length === 0) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const el of elements) {
    const b = getElementBounds(el);
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.width);
    maxY = Math.max(maxY, b.y + b.height);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
