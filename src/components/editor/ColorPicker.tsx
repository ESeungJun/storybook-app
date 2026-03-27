'use client';

import { useEditorStore } from '@/stores/editorStore';
import { cn } from '@/lib/utils';

const COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#cccccc', '#ffffff',
  '#ff0000', '#ff4444', '#ff8888', '#ffcccc',
  '#ff6600', '#ff9933', '#ffcc66', '#ffeecc',
  '#ffff00', '#ffff66', '#ffffcc',
  '#00cc00', '#33cc33', '#66ff66', '#ccffcc',
  '#0066ff', '#3399ff', '#66ccff', '#cceeff',
  '#6600cc', '#9933ff', '#cc66ff', '#eeccff',
  '#ff0099', '#ff66cc', '#ffccee',
  '#663300', '#996633', '#cc9966',
];

export default function ColorPicker() {
  const { brushColor, setBrushColor } = useEditorStore();

  return (
    <div>
      <p className="text-xs text-gray-500 mb-2 hidden lg:block">색상</p>
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-1">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => setBrushColor(color)}
            className={cn(
              'w-6 h-6 rounded-full border-2 transition-transform hover:scale-110',
              brushColor === color ? 'border-primary-500 scale-110' : 'border-gray-200'
            )}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {/* 커스텀 색상 */}
      <div className="mt-2 flex items-center gap-2">
        <input
          type="color"
          value={brushColor}
          onChange={(e) => setBrushColor(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-0"
        />
        <span className="text-xs text-gray-500 hidden lg:inline">{brushColor}</span>
      </div>
    </div>
  );
}
