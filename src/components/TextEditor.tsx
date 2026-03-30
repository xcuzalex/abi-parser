import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useWhiteboardStore } from '../store';
import { screenToWorld, worldToScreen } from '../core/hitTest';
import type { TextElement } from '../types';

interface TextEditorProps {
  position: { x: number; y: number } | null;
  onClose: () => void;
}

export function TextEditor({ position, onClose }: TextEditorProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const store = useWhiteboardStore.getState;

  useEffect(() => {
    if (position && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [position]);

  if (!position) return null;

  const handleBlur = () => {
    if (text.trim()) {
      const s = store();
      const worldPos = screenToWorld(position.x, position.y, s.camera);
      const snapped = s.snapToGrid(worldPos.x, worldPos.y);

      const element: TextElement = {
        id: uuidv4(),
        type: 'text',
        x: snapped.x,
        y: snapped.y,
        width: 200,
        height: 30,
        rotation: 0,
        style: { ...s.currentStyle },
        layerId: s.activeLayerId,
        locked: false,
        visible: true,
        text: text.trim(),
        fontSize: s.currentStyle.fontSize || 16,
        fontFamily: s.currentStyle.fontFamily || 'sans-serif',
      };

      s.addElement(element);
      s.pushHistory();
    }
    setText('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setText('');
      onClose();
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      textareaRef.current?.blur();
    }
  };

  return (
    <div
      className="text-editor-overlay"
      style={{ left: position.x, top: position.y }}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="输入文本..."
        style={{
          fontSize: useWhiteboardStore.getState().currentStyle.fontSize || 16,
        }}
      />
    </div>
  );
}
