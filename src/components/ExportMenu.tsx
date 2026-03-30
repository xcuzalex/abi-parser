import { useRef } from 'react';
import { useWhiteboardStore } from '../store';
import { exportToPNG, exportToJSON, importFromJSON } from '../utils/export';

export function ExportMenu() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportPNG = () => {
    const canvas = document.querySelector('.canvas-container canvas') as HTMLCanvasElement;
    if (canvas) exportToPNG(canvas);
  };

  const handleExportJSON = () => {
    const store = useWhiteboardStore.getState();
    exportToJSON(store.elements, store.layers);
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importFromJSON(file);
      const store = useWhiteboardStore.getState();
      store.pushHistory();

      // Merge imported data
      Object.entries(data.elements).forEach(([id, el]) => {
        store.addElement(el);
      });
    } catch (err) {
      alert('导入失败：无效的 JSON 文件');
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="panel-section">
      <h3>文件</h3>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button className="btn-small" onClick={handleExportPNG}>
          导出 PNG
        </button>
        <button className="btn-small" onClick={handleExportJSON}>
          导出 JSON
        </button>
        <button className="btn-small" onClick={() => fileInputRef.current?.click()}>
          导入 JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleImportJSON}
        />
      </div>
    </div>
  );
}
