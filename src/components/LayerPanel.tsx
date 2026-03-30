import { useWhiteboardStore } from '../store';

export function LayerPanel() {
  const layers = useWhiteboardStore((s) => s.layers);
  const activeLayerId = useWhiteboardStore((s) => s.activeLayerId);
  const addLayer = useWhiteboardStore((s) => s.addLayer);
  const removeLayer = useWhiteboardStore((s) => s.removeLayer);
  const updateLayer = useWhiteboardStore((s) => s.updateLayer);
  const setActiveLayer = useWhiteboardStore((s) => s.setActiveLayer);

  return (
    <div className="panel-section">
      <h3>图层</h3>
      <div style={{ marginBottom: 8 }}>
        <button className="btn-small" onClick={() => addLayer()}>
          + 新建图层
        </button>
      </div>
      {[...layers].reverse().map((layer) => (
        <div
          key={layer.id}
          className={`layer-item ${activeLayerId === layer.id ? 'active' : ''}`}
          onClick={() => setActiveLayer(layer.id)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateLayer(layer.id, { visible: !layer.visible });
            }}
            title={layer.visible ? '隐藏' : '显示'}
          >
            {layer.visible ? '👁' : '👁‍🗨'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateLayer(layer.id, { locked: !layer.locked });
            }}
            title={layer.locked ? '解锁' : '锁定'}
          >
            {layer.locked ? '🔒' : '🔓'}
          </button>
          <span className="layer-name">{layer.name}</span>
          {layers.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeLayer(layer.id);
              }}
              title="删除图层"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
