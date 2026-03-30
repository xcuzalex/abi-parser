import { useWhiteboardStore } from '../store';
import type { ToolType } from '../types';

const tools: { type: ToolType; icon: string; label: string; shortcut: string }[] = [
  { type: 'select', icon: '↖', label: '选择', shortcut: 'V' },
  { type: 'hand', icon: '✋', label: '平移', shortcut: 'H' },
  { type: 'pen', icon: '✏', label: '画笔', shortcut: 'P' },
  { type: 'line', icon: '╱', label: '直线', shortcut: 'L' },
  { type: 'arrow', icon: '→', label: '箭头', shortcut: 'A' },
  { type: 'rectangle', icon: '▭', label: '矩形', shortcut: 'R' },
  { type: 'ellipse', icon: '○', label: '椭圆', shortcut: 'O' },
  { type: 'text', icon: 'T', label: '文本', shortcut: 'T' },
  { type: 'eraser', icon: '⌫', label: '橡皮擦', shortcut: 'E' },
];

export function Toolbar() {
  const activeTool = useWhiteboardStore((s) => s.activeTool);
  const setActiveTool = useWhiteboardStore((s) => s.setActiveTool);
  const undo = useWhiteboardStore((s) => s.undo);
  const redo = useWhiteboardStore((s) => s.redo);

  return (
    <div className="toolbar">
      {tools.map((tool) => (
        <button
          key={tool.type}
          className={activeTool === tool.type ? 'active' : ''}
          onClick={() => setActiveTool(tool.type)}
          title={`${tool.label} (${tool.shortcut})`}
        >
          {tool.icon}
          <span className="shortcut">{tool.shortcut}</span>
        </button>
      ))}
      <div className="separator" />
      <button onClick={undo} title="撤销 (Ctrl+Z)">↩</button>
      <button onClick={redo} title="重做 (Ctrl+Shift+Z)">↪</button>
    </div>
  );
}
