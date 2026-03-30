export type ToolType =
  | 'select'
  | 'pen'
  | 'line'
  | 'arrow'
  | 'rectangle'
  | 'ellipse'
  | 'text'
  | 'image'
  | 'eraser'
  | 'hand';

export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Style {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  opacity: number;
  fontSize?: number;
  fontFamily?: string;
}

export interface BaseElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  style: Style;
  layerId: string;
  locked: boolean;
  visible: boolean;
}

export interface PenElement extends BaseElement {
  type: 'pen';
  points: Point[];
}

export interface LineElement extends BaseElement {
  type: 'line';
  points: [Point, Point];
}

export interface ArrowElement extends BaseElement {
  type: 'arrow';
  points: [Point, Point];
}

export interface RectangleElement extends BaseElement {
  type: 'rectangle';
}

export interface EllipseElement extends BaseElement {
  type: 'ellipse';
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  naturalWidth: number;
  naturalHeight: number;
}

export type WhiteboardElement =
  | PenElement
  | LineElement
  | ArrowElement
  | RectangleElement
  | EllipseElement
  | TextElement
  | ImageElement;

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  elements: string[]; // element ids
}

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export interface GridConfig {
  enabled: boolean;
  size: number;
  snap: boolean;
  color: string;
}

export interface HistoryEntry {
  elements: Record<string, WhiteboardElement>;
  layers: Layer[];
}
