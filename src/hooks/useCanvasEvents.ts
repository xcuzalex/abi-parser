import { useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useWhiteboardStore } from '../store';
import { screenToWorld, hitTestElement, getSelectionBounds } from '../core/hitTest';
import type { Point, WhiteboardElement, PenElement, LineElement, ArrowElement, RectangleElement, EllipseElement } from '../types';

interface DragState {
  isDragging: boolean;
  startScreen: Point;
  startWorld: Point;
  elementStartPositions: Map<string, { x: number; y: number }>;
  creatingElement: WhiteboardElement | null;
  isPanning: boolean;
  panStart: { camX: number; camY: number };
  selectionRect: { start: Point; end: Point } | null;
}

export function useCanvasEvents(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const dragState = useRef<DragState>({
    isDragging: false,
    startScreen: { x: 0, y: 0 },
    startWorld: { x: 0, y: 0 },
    elementStartPositions: new Map(),
    creatingElement: null,
    isPanning: false,
    panStart: { camX: 0, camY: 0 },
    selectionRect: null,
  });

  const getMousePos = useCallback(
    (e: React.MouseEvent): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    },
    [canvasRef]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const store = useWhiteboardStore.getState();
      const screenPos = getMousePos(e);
      const worldPos = screenToWorld(screenPos.x, screenPos.y, store.camera);
      const snapped = store.snapToGrid(worldPos.x, worldPos.y);

      dragState.current.isDragging = true;
      dragState.current.startScreen = screenPos;
      dragState.current.startWorld = snapped;

      // Middle button or space+click = pan
      if (e.button === 1 || store.activeTool === 'hand') {
        dragState.current.isPanning = true;
        dragState.current.panStart = {
          camX: store.camera.x,
          camY: store.camera.y,
        };
        return;
      }

      switch (store.activeTool) {
        case 'select': {
          const visibleElements = store.getVisibleElements();
          // Check from top (last) to bottom (first)
          let hit: WhiteboardElement | null = null;
          for (let i = visibleElements.length - 1; i >= 0; i--) {
            if (hitTestElement(snapped, visibleElements[i])) {
              hit = visibleElements[i];
              break;
            }
          }

          if (hit) {
            if (!store.selectedIds.includes(hit.id)) {
              store.setSelectedIds(e.shiftKey ? [...store.selectedIds, hit.id] : [hit.id]);
            }
            // Start moving
            const positions = new Map<string, { x: number; y: number }>();
            const currentSelected = store.selectedIds.includes(hit.id)
              ? store.selectedIds
              : [hit.id];
            currentSelected.forEach((id) => {
              const el = store.elements[id];
              if (el) positions.set(id, { x: el.x, y: el.y });
            });
            dragState.current.elementStartPositions = positions;
          } else {
            store.setSelectedIds([]);
            dragState.current.selectionRect = { start: screenPos, end: screenPos };
          }
          break;
        }

        case 'pen': {
          const element: PenElement = {
            id: uuidv4(),
            type: 'pen',
            x: snapped.x,
            y: snapped.y,
            width: 0,
            height: 0,
            rotation: 0,
            style: { ...store.currentStyle },
            layerId: store.activeLayerId,
            locked: false,
            visible: true,
            points: [{ x: snapped.x, y: snapped.y }],
          };
          store.addElement(element);
          dragState.current.creatingElement = element;
          break;
        }

        case 'line':
        case 'arrow': {
          const lineEl: LineElement | ArrowElement = {
            id: uuidv4(),
            type: store.activeTool,
            x: snapped.x,
            y: snapped.y,
            width: 0,
            height: 0,
            rotation: 0,
            style: { ...store.currentStyle },
            layerId: store.activeLayerId,
            locked: false,
            visible: true,
            points: [
              { x: snapped.x, y: snapped.y },
              { x: snapped.x, y: snapped.y },
            ],
          } as LineElement | ArrowElement;
          store.addElement(lineEl);
          dragState.current.creatingElement = lineEl;
          break;
        }

        case 'rectangle': {
          const rect: RectangleElement = {
            id: uuidv4(),
            type: 'rectangle',
            x: snapped.x,
            y: snapped.y,
            width: 0,
            height: 0,
            rotation: 0,
            style: { ...store.currentStyle },
            layerId: store.activeLayerId,
            locked: false,
            visible: true,
          };
          store.addElement(rect);
          dragState.current.creatingElement = rect;
          break;
        }

        case 'ellipse': {
          const ellipse: EllipseElement = {
            id: uuidv4(),
            type: 'ellipse',
            x: snapped.x,
            y: snapped.y,
            width: 0,
            height: 0,
            rotation: 0,
            style: { ...store.currentStyle },
            layerId: store.activeLayerId,
            locked: false,
            visible: true,
          };
          store.addElement(ellipse);
          dragState.current.creatingElement = ellipse;
          break;
        }

        case 'eraser': {
          const visibleElements = store.getVisibleElements();
          for (let i = visibleElements.length - 1; i >= 0; i--) {
            if (hitTestElement(snapped, visibleElements[i], 10)) {
              store.pushHistory();
              store.deleteElements([visibleElements[i].id]);
              break;
            }
          }
          break;
        }

        case 'text': {
          // Text creation is handled in the component
          break;
        }
      }
    },
    [getMousePos]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragState.current.isDragging) return;

      const store = useWhiteboardStore.getState();
      const screenPos = getMousePos(e);
      const worldPos = screenToWorld(screenPos.x, screenPos.y, store.camera);
      const snapped = store.snapToGrid(worldPos.x, worldPos.y);

      // Panning
      if (dragState.current.isPanning) {
        const dx = (screenPos.x - dragState.current.startScreen.x) / store.camera.zoom;
        const dy = (screenPos.y - dragState.current.startScreen.y) / store.camera.zoom;
        store.setCamera({
          x: dragState.current.panStart.camX + dx,
          y: dragState.current.panStart.camY + dy,
        });
        return;
      }

      const { activeTool, selectedIds, elements, updateElement } = store;

      // Selection rect
      if (activeTool === 'select' && dragState.current.selectionRect) {
        dragState.current.selectionRect.end = screenPos;
        return;
      }

      // Moving elements
      if (activeTool === 'select' && selectedIds.length > 0 && dragState.current.elementStartPositions.size > 0) {
        const dx = snapped.x - dragState.current.startWorld.x;
        const dy = snapped.y - dragState.current.startWorld.y;
        dragState.current.elementStartPositions.forEach((startPos, id) => {
          updateElement(id, { x: startPos.x + dx, y: startPos.y + dy });
        });
        return;
      }

      // Creating elements
      const creating = dragState.current.creatingElement;
      if (!creating) return;

      switch (creating.type) {
        case 'pen': {
          const el = elements[creating.id] as PenElement | undefined;
          if (el) {
            const newPoints = [...el.points, { x: snapped.x, y: snapped.y }];
            updateElement(creating.id, { points: newPoints } as any);
          }
          break;
        }
        case 'line':
        case 'arrow': {
          updateElement(creating.id, {
            points: [dragState.current.startWorld, { x: snapped.x, y: snapped.y }],
            width: snapped.x - dragState.current.startWorld.x,
            height: snapped.y - dragState.current.startWorld.y,
          } as any);
          break;
        }
        case 'rectangle':
        case 'ellipse': {
          let x = dragState.current.startWorld.x;
          let y = dragState.current.startWorld.y;
          let w = snapped.x - x;
          let h = snapped.y - y;

          // Hold shift for square/circle
          if (e.shiftKey) {
            const size = Math.max(Math.abs(w), Math.abs(h));
            w = w >= 0 ? size : -size;
            h = h >= 0 ? size : -size;
          }

          updateElement(creating.id, { x, y, width: w, height: h });
          break;
        }
      }
    },
    [getMousePos]
  );

  const handleMouseUp = useCallback(
    (_e: React.MouseEvent) => {
      const store = useWhiteboardStore.getState();

      // Finalize selection rect
      if (dragState.current.selectionRect) {
        const { start, end } = dragState.current.selectionRect;
        const minX = Math.min(start.x, end.x);
        const maxX = Math.max(start.x, end.x);
        const minY = Math.min(start.y, end.y);
        const maxY = Math.max(start.y, end.y);

        if (maxX - minX > 5 || maxY - minY > 5) {
          const worldStart = screenToWorld(minX, minY, store.camera);
          const worldEnd = screenToWorld(maxX, maxY, store.camera);

          const visibleElements = store.getVisibleElements();
          const selected = visibleElements.filter((el) => {
            return (
              el.x >= worldStart.x &&
              el.y >= worldStart.y &&
              el.x + el.width <= worldEnd.x &&
              el.y + el.height <= worldEnd.y
            );
          });
          store.setSelectedIds(selected.map((el) => el.id));
        }
        dragState.current.selectionRect = null;
      }

      // Push history if something was created or moved
      if (
        dragState.current.creatingElement ||
        dragState.current.elementStartPositions.size > 0
      ) {
        store.pushHistory();
      }

      dragState.current = {
        isDragging: false,
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
        elementStartPositions: new Map(),
        creatingElement: null,
        isPanning: false,
        panStart: { camX: 0, camY: 0 },
        selectionRect: null,
      };
    },
    []
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const store = useWhiteboardStore.getState();
      const screenPos = getMousePos(e as any);

      if (e.ctrlKey || e.metaKey) {
        // Zoom
        const delta = -e.deltaY * 0.001;
        const newZoom = Math.min(5, Math.max(0.1, store.camera.zoom * (1 + delta)));
        const worldBefore = screenToWorld(screenPos.x, screenPos.y, store.camera);
        const worldAfter = screenToWorld(screenPos.x, screenPos.y, {
          ...store.camera,
          zoom: newZoom,
        });

        store.setCamera({
          zoom: newZoom,
          x: store.camera.x + (worldAfter.x - worldBefore.x),
          y: store.camera.y + (worldAfter.y - worldBefore.y),
        });
      } else {
        // Pan
        store.setCamera({
          x: store.camera.x - e.deltaX / store.camera.zoom,
          y: store.camera.y - e.deltaY / store.camera.zoom,
        });
      }
    },
    [getMousePos]
  );

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    dragState,
  };
}
