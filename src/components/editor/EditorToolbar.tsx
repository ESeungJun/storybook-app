'use client';

import { useEditorStore } from '@/stores/editorStore';
import { cn } from '@/lib/utils';
import type { EditorTool } from '@/types';
import ColorPicker from './ColorPicker';
import BrushSettings from './BrushSettings';
import UndoRedoControls from './UndoRedoControls';

const tools: { id: EditorTool; label: string; icon: string }[] = [
  { id: 'select', label: '선택', icon: '↖' },
  { id: 'pen', label: '펜', icon: '✒' },
  { id: 'pencil', label: '연필', icon: '✏' },
  { id: 'marker', label: '마커', icon: '🖍' },
  { id: 'eraser', label: '지우개', icon: '◻' },
  { id: 'text', label: '텍스트', icon: 'T' },
];

export default function EditorToolbar() {
  const { activeTool, setActiveTool } = useEditorStore();

  return (
    <div className="bg-white border-r border-gray-200 flex flex-col w-16 lg:w-56 flex-shrink-0">
      {/* 도구 버튼 */}
      <div className="p-2 space-y-1">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
              activeTool === tool.id
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <span className="text-lg w-6 text-center">{tool.icon}</span>
            <span className="hidden lg:inline">{tool.label}</span>
          </button>
        ))}
      </div>

      <div className="border-t border-gray-200 my-2" />

      {/* 브러시 설정 */}
      <div className="px-2">
        <BrushSettings />
      </div>

      <div className="border-t border-gray-200 my-2" />

      {/* 색상 선택 */}
      <div className="px-2 flex-1 overflow-y-auto">
        <ColorPicker />
      </div>

      <div className="border-t border-gray-200 my-2" />

      {/* Undo/Redo */}
      <div className="p-2">
        <UndoRedoControls />
      </div>
    </div>
  );
}
