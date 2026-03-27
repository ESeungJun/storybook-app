'use client';

import { useEditorStore } from '@/stores/editorStore';

export default function UndoRedoControls() {
  const { undoStack, redoStack, undo, redo } = useEditorStore();

  return (
    <div className="flex gap-1">
      <button
        onClick={() => undo()}
        disabled={undoStack.length === 0}
        className="flex-1 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        title="실행 취소"
      >
        ↩ <span className="hidden lg:inline">취소</span>
      </button>
      <button
        onClick={() => redo()}
        disabled={redoStack.length === 0}
        className="flex-1 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        title="다시 실행"
      >
        ↪ <span className="hidden lg:inline">재실행</span>
      </button>
    </div>
  );
}
