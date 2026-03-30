import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  ToolType,
  WhiteboardElement,
  Layer,
  Camera,
  Style,
  GridConfig,
  HistoryEntry,
} from '../types';

interface WhiteboardState {
  // Elements
  elements: Record<string, WhiteboardElement>;
  selectedIds: string[];

  // Layers
  layers: Layer[];
  activeLayerId: string;

  // Tool
  activeTool: ToolType;
  currentStyle: Style;

  // Camera
  camera: Camera;

  // Grid
  grid: GridConfig;

  // History
  history: HistoryEntry[];
  historyIndex: number;

  // Actions - Elements
  addElement: (element: WhiteboardElement) => void;
  updateElement: (id: string, updates: Partial<WhiteboardElement>) => void;
  deleteElements: (ids: string[]) => void;
  setSelectedIds: (ids: string[]) => void;

  // Actions - Layers
  addLayer: (name?: string) => void;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  setActiveLayer: (id: string) => void;
  reorderLayers: (layers: Layer[]) => void;

  // Actions - Tool
  setActiveTool: (tool: ToolType) => void;
  setCurrentStyle: (style: Partial<Style>) => void;

  // Actions - Camera
  setCamera: (camera: Partial<Camera>) => void;

  // Actions - Grid
  setGrid: (grid: Partial<GridConfig>) => void;

  // Actions - History
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Actions - Utility
  snapToGrid: (x: number, y: number) => { x: number; y: number };
  getVisibleElements: () => WhiteboardElement[];
}

const DEFAULT_LAYER_ID = 'default-layer';

const defaultStyle: Style = {
  strokeColor: '#1a1a1a',
  fillColor: 'transparent',
  strokeWidth: 2,
  opacity: 1,
  fontSize: 16,
  fontFamily: 'sans-serif',
};

const defaultLayer: Layer = {
  id: DEFAULT_LAYER_ID,
  name: '图层 1',
  visible: true,
  locked: false,
  elements: [],
};

export const useWhiteboardStore = create<WhiteboardState>((set, get) => ({
  elements: {},
  selectedIds: [],
  layers: [defaultLayer],
  activeLayerId: DEFAULT_LAYER_ID,
  activeTool: 'select',
  currentStyle: defaultStyle,
  camera: { x: 0, y: 0, zoom: 1 },
  grid: { enabled: true, size: 20, snap: false, color: '#e0e0e0' },
  history: [{ elements: {}, layers: [defaultLayer] }],
  historyIndex: 0,

  addElement: (element) =>
    set((state) => {
      const newElements = { ...state.elements, [element.id]: element };
      const newLayers = state.layers.map((layer) =>
        layer.id === element.layerId
          ? { ...layer, elements: [...layer.elements, element.id] }
          : layer
      );
      return { elements: newElements, layers: newLayers };
    }),

  updateElement: (id, updates) =>
    set((state) => {
      const existing = state.elements[id];
      if (!existing) return state;
      return {
        elements: {
          ...state.elements,
          [id]: { ...existing, ...updates } as WhiteboardElement,
        },
      };
    }),

  deleteElements: (ids) =>
    set((state) => {
      const newElements = { ...state.elements };
      ids.forEach((id) => delete newElements[id]);
      const idSet = new Set(ids);
      const newLayers = state.layers.map((layer) => ({
        ...layer,
        elements: layer.elements.filter((eid) => !idSet.has(eid)),
      }));
      return {
        elements: newElements,
        layers: newLayers,
        selectedIds: state.selectedIds.filter((id) => !idSet.has(id)),
      };
    }),

  setSelectedIds: (ids) => set({ selectedIds: ids }),

  addLayer: (name) =>
    set((state) => {
      const newLayer: Layer = {
        id: uuidv4(),
        name: name || `图层 ${state.layers.length + 1}`,
        visible: true,
        locked: false,
        elements: [],
      };
      return {
        layers: [...state.layers, newLayer],
        activeLayerId: newLayer.id,
      };
    }),

  removeLayer: (id) =>
    set((state) => {
      if (state.layers.length <= 1) return state;
      const newLayers = state.layers.filter((l) => l.id !== id);
      const removedLayer = state.layers.find((l) => l.id === id);
      const newElements = { ...state.elements };
      removedLayer?.elements.forEach((eid) => delete newElements[eid]);
      return {
        layers: newLayers,
        elements: newElements,
        activeLayerId:
          state.activeLayerId === id ? newLayers[0].id : state.activeLayerId,
      };
    }),

  updateLayer: (id, updates) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === id ? { ...l, ...updates } : l
      ),
    })),

  setActiveLayer: (id) => set({ activeLayerId: id }),

  reorderLayers: (layers) => set({ layers }),

  setActiveTool: (tool) => set({ activeTool: tool, selectedIds: [] }),

  setCurrentStyle: (style) =>
    set((state) => ({
      currentStyle: { ...state.currentStyle, ...style },
    })),

  setCamera: (camera) =>
    set((state) => ({
      camera: { ...state.camera, ...camera },
    })),

  setGrid: (grid) =>
    set((state) => ({
      grid: { ...state.grid, ...grid },
    })),

  pushHistory: () =>
    set((state) => {
      const entry: HistoryEntry = {
        elements: JSON.parse(JSON.stringify(state.elements)),
        layers: JSON.parse(JSON.stringify(state.layers)),
      };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(entry);
      // Keep max 50 history entries
      if (newHistory.length > 50) newHistory.shift();
      return {
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }),

  undo: () =>
    set((state) => {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      const entry = state.history[newIndex];
      return {
        historyIndex: newIndex,
        elements: JSON.parse(JSON.stringify(entry.elements)),
        layers: JSON.parse(JSON.stringify(entry.layers)),
        selectedIds: [],
      };
    }),

  redo: () =>
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      const entry = state.history[newIndex];
      return {
        historyIndex: newIndex,
        elements: JSON.parse(JSON.stringify(entry.elements)),
        layers: JSON.parse(JSON.stringify(entry.layers)),
        selectedIds: [],
      };
    }),

  snapToGrid: (x, y) => {
    const { grid } = get();
    if (!grid.snap) return { x, y };
    return {
      x: Math.round(x / grid.size) * grid.size,
      y: Math.round(y / grid.size) * grid.size,
    };
  },

  getVisibleElements: () => {
    const { elements, layers } = get();
    const visibleElementIds = new Set<string>();
    layers
      .filter((l) => l.visible)
      .forEach((l) => l.elements.forEach((eid) => visibleElementIds.add(eid)));
    return Object.values(elements).filter(
      (el) => visibleElementIds.has(el.id) && el.visible
    );
  },
}));
