import { useWhiteboardStore } from '../store';

export function BottomBar() {
  const camera = useWhiteboardStore((s) => s.camera);
  const setCamera = useWhiteboardStore((s) => s.setCamera);
  const grid = useWhiteboardStore((s) => s.grid);
  const setGrid = useWhiteboardStore((s) => s.setGrid);

  const zoomPercent = Math.round(camera.zoom * 100);

  const zoomTo = (zoom: number) => {
    setCamera({ zoom: Math.min(5, Math.max(0.1, zoom)) });
  };

  return (
    <div className="bottom-bar">
      <button onClick={() => zoomTo(camera.zoom - 0.1)}>-</button>
      <span style={{ minWidth: 44, textAlign: 'center' }}>{zoomPercent}%</span>
      <button onClick={() => zoomTo(camera.zoom + 0.1)}>+</button>
      <button onClick={() => { setCamera({ x: 0, y: 0, zoom: 1 }); }}>
        重置
      </button>
      <div className="separator" style={{ height: 20, width: 1, background: '#e0e0e0' }} />
      <div className="grid-controls">
        <label>
          <input
            type="checkbox"
            checked={grid.enabled}
            onChange={(e) => setGrid({ enabled: e.target.checked })}
          />
          网格
        </label>
        <label>
          <input
            type="checkbox"
            checked={grid.snap}
            onChange={(e) => setGrid({ snap: e.target.checked })}
          />
          吸附
        </label>
      </div>
    </div>
  );
}
