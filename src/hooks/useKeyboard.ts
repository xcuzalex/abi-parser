import { useEffect } from 'react';
import { useWhiteboardStore } from '../store';

export function useKeyboard() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const store = useWhiteboardStore.getState();
      const target = e.target as HTMLElement;

      // Ignore if typing in an input
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          store.redo();
        } else {
          store.undo();
        }
        return;
      }

      // Delete selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && store.selectedIds.length > 0) {
        e.preventDefault();
        store.pushHistory();
        store.deleteElements(store.selectedIds);
        return;
      }

      // Select All
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        const allIds = Object.keys(store.elements);
        store.setSelectedIds(allIds);
        return;
      }

      // Tool shortcuts
      switch (e.key.toLowerCase()) {
        case 'v':
          store.setActiveTool('select');
          break;
        case 'p':
          store.setActiveTool('pen');
          break;
        case 'l':
          store.setActiveTool('line');
          break;
        case 'a':
          if (!e.ctrlKey && !e.metaKey) store.setActiveTool('arrow');
          break;
        case 'r':
          store.setActiveTool('rectangle');
          break;
        case 'o':
          store.setActiveTool('ellipse');
          break;
        case 't':
          store.setActiveTool('text');
          break;
        case 'e':
          store.setActiveTool('eraser');
          break;
        case 'h':
          store.setActiveTool('hand');
          break;
        case 'escape':
          store.setSelectedIds([]);
          store.setActiveTool('select');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
