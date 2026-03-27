'use client';

import { useEditorStore } from '@/stores/editorStore';

export default function BrushSettings() {
  const { brushSize, setBrushSize } = useEditorStore();

  return (
    <div>
      <p className="text-xs text-gray-500 mb-1 hidden lg:block">굵기: {brushSize}px</p>
      <input
        type="range"
        min={1}
        max={50}
        value={brushSize}
        onChange={(e) => setBrushSize(Number(e.target.value))}
        className="w-full accent-primary-600"
      />
      <div className="flex justify-between mt-1">
        {[1, 5, 15, 30, 50].map((size) => (
          <button
            key={size}
            onClick={() => setBrushSize(size)}
            className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded"
          >
            <div
              className="rounded-full bg-gray-800"
              style={{ width: Math.min(size, 20), height: Math.min(size, 20) }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
