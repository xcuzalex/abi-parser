import type { WhiteboardElement, Layer } from '../types';

export function exportToPNG(
  canvas: HTMLCanvasElement,
  fileName: string = 'whiteboard.png'
) {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export function exportToJSON(
  elements: Record<string, WhiteboardElement>,
  layers: Layer[],
  fileName: string = 'whiteboard.json'
) {
  const data = JSON.stringify({ elements, layers }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = fileName;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

export function importFromJSON(
  file: File
): Promise<{ elements: Record<string, WhiteboardElement>; layers: Layer[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (err) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function importImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });
}
