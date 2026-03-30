import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { StylePanel } from './components/StylePanel';
import { LayerPanel } from './components/LayerPanel';
import { BottomBar } from './components/BottomBar';
import { ExportMenu } from './components/ExportMenu';
import { useKeyboard } from './hooks/useKeyboard';

export function App() {
  useKeyboard();

  return (
    <div className="app-container">
      <Canvas />
      <Toolbar />
      <div className="side-panel">
        <ExportMenu />
        <StylePanel />
        <LayerPanel />
      </div>
      <BottomBar />
    </div>
  );
}
