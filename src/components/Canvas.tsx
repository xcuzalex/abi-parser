import { useRef, useEffect, useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useWhiteboardStore } from '../store';
import { Renderer, loadImage } from '../core/renderer';
import { getSelectionBounds } from '../core/hitTest';
import { useCanvasEvents } from '../hooks/useCanvasEvents';
import { TextEditor } from './TextEditor';
import { importImage } from '../utils/export';
import type { ImageElement } from '../types';

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const animFrameRef = useRef<number>(0);
  const [textEditorPos, setTextEditorPos] = useState<{ x: number; y: number } | null>(null);

  const activeTool = useWhiteboardStore((s) => s.activeTool);
  const camera = useWhiteboardStore((s) => s.camera);
  const grid = useWhiteboardStore((s) => s.grid);
  const elements = useWhiteboardStore((s) => s.elements);
  const selectedIds = useWhiteboardStore((s) => s.selectedIds);
  const layers = useWhiteboardStore((s) => s.layers);

  const { handleMouseDown, handleMouseMove, handleMouseUp, handleWheel, dragState } =
    useCanvasEvents(canvasRef);

  // Initialize renderer and resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    rendererRef.current = new Renderer(canvas);

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent && rendererRef.current) {
        rendererRef.current.resize(parent.clientWidth, parent.clientHeight);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Render loop
  useEffect(() => {
    const render = () => {
      const renderer = rendererRef.current;
      if (!renderer) return;

      const store = useWhiteboardStore.getState();
      renderer.clear();
      renderer.renderGrid(store.camera, store.grid);

      // Render elements per layer order
      for (const layer of store.layers) {
        if (!layer.visible) continue;
        for (const eid of layer.elements) {
          const el = store.elements[eid];
          if (el && el.visible) {
            renderer.renderElement(el, store.camera);
          }
        }
      }

      // Render selection
      if (store.selectedIds.length > 0) {
        const selectedEls = store.selectedIds
          .map((id) => store.elements[id])
          .filter(Boolean);
        const bounds = getSelectionBounds(selectedEls);
        if (bounds) {
          renderer.renderSelectionBox(bounds, store.camera);
        }
      }

      // Render selection rect
      const ds = dragState.current;
      if (ds.selectionRect) {
        renderer.renderSelectionRect(
          ds.selectionRect.start,
          ds.selectionRect.end,
          store.camera
        );
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [dragState]);

  // Handle text tool click
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (activeTool === 'text') {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        setTextEditorPos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
        return;
      }
      handleMouseDown(e);
    },
    [activeTool, handleMouseDown]
  );

  // Handle image import via drag & drop
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter((f) => f.type.startsWith('image/'));

      for (const file of imageFiles) {
        const src = await importImage(file);
        const img = await loadImage(src);

        const store = useWhiteboardStore.getState();
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / store.camera.zoom - store.camera.x;
        const y = (e.clientY - rect.top) / store.camera.zoom - store.camera.y;

        // Scale down if too large
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        const maxSize = 400;
        if (w > maxSize || h > maxSize) {
          const scale = maxSize / Math.max(w, h);
          w *= scale;
          h *= scale;
        }

        const element: ImageElement = {
          id: uuidv4(),
          type: 'image',
          x,
          y,
          width: w,
          height: h,
          rotation: 0,
          style: { ...store.currentStyle },
          layerId: store.activeLayerId,
          locked: false,
          visible: true,
          src,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        };

        store.addElement(element);
        store.pushHistory();
      }
    },
    []
  );

  // Handle paste images
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) continue;

          const src = await importImage(file);
          const img = await loadImage(src);
          const store = useWhiteboardStore.getState();

          let w = img.naturalWidth;
          let h = img.naturalHeight;
          const maxSize = 400;
          if (w > maxSize || h > maxSize) {
            const scale = maxSize / Math.max(w, h);
            w *= scale;
            h *= scale;
          }

          const element: ImageElement = {
            id: uuidv4(),
            type: 'image',
            x: -store.camera.x + 100,
            y: -store.camera.y + 100,
            width: w,
            height: h,
            rotation: 0,
            style: { ...store.currentStyle },
            layerId: store.activeLayerId,
            locked: false,
            visible: true,
            src,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
          };

          store.addElement(element);
          store.pushHistory();
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  return (
    <div
      className="canvas-container"
      data-tool={activeTool}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      />
      <TextEditor
        position={textEditorPos}
        onClose={() => setTextEditorPos(null)}
      />
    </div>
  );
}
