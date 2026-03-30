import { useWhiteboardStore } from '../store';

export function StylePanel() {
  const currentStyle = useWhiteboardStore((s) => s.currentStyle);
  const setCurrentStyle = useWhiteboardStore((s) => s.setCurrentStyle);
  const selectedIds = useWhiteboardStore((s) => s.selectedIds);
  const elements = useWhiteboardStore((s) => s.elements);
  const updateElement = useWhiteboardStore((s) => s.updateElement);
  const pushHistory = useWhiteboardStore((s) => s.pushHistory);

  const handleChange = (key: string, value: string | number) => {
    setCurrentStyle({ [key]: value });

    // Also update selected elements
    if (selectedIds.length > 0) {
      pushHistory();
      selectedIds.forEach((id) => {
        const el = elements[id];
        if (el) {
          updateElement(id, {
            style: { ...el.style, [key]: value },
          } as any);
        }
      });
    }
  };

  return (
    <div className="panel-section">
      <h3>样式</h3>
      <div className="style-row">
        <label>描边</label>
        <input
          type="color"
          value={currentStyle.strokeColor}
          onChange={(e) => handleChange('strokeColor', e.target.value)}
        />
        <input
          type="number"
          value={currentStyle.strokeWidth}
          min={1}
          max={20}
          onChange={(e) => handleChange('strokeWidth', Number(e.target.value))}
        />
      </div>
      <div className="style-row">
        <label>填充</label>
        <input
          type="color"
          value={currentStyle.fillColor === 'transparent' ? '#ffffff' : currentStyle.fillColor}
          onChange={(e) => handleChange('fillColor', e.target.value)}
        />
        <button
          className="btn-small"
          onClick={() => handleChange('fillColor', 'transparent')}
          style={{
            opacity: currentStyle.fillColor === 'transparent' ? 1 : 0.5,
          }}
        >
          无
        </button>
      </div>
      <div className="style-row">
        <label>透明度</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={currentStyle.opacity}
          onChange={(e) => handleChange('opacity', Number(e.target.value))}
        />
      </div>
    </div>
  );
}
