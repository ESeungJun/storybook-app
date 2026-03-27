'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Canvas, PencilBrush } from 'fabric';
import { CANVAS_WIDTH, CANVAS_HEIGHT, getCanvasScale } from '@/lib/fabric/setup';
import { useEditorStore } from '@/stores/editorStore';

export default function EditorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    activeTool,
    brushColor,
    brushSize,
    currentPageIndex,
    pages,
    updatePageCanvas,
    pushUndo,
  } = useEditorStore();

  // Canvas 초기화
  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: '#ffffff',
      isDrawingMode: false,
      selection: true,
      preserveObjectStacking: true,
    });

    fabricRef.current = canvas;

    // 이벤트 리스너
    canvas.on('path:created', () => {
      saveCanvasState();
    });

    canvas.on('object:modified', () => {
      saveCanvasState();
    });

    // 리사이즈 처리
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveCanvasState = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const json = canvas.toJSON();
    const currentIndex = useEditorStore.getState().currentPageIndex;
    updatePageCanvas(currentIndex, json);
    pushUndo(JSON.stringify(json));
  }, [updatePageCanvas, pushUndo]);

  // 도구 변경 시 브러시 업데이트
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (activeTool === 'select' || activeTool === 'text') {
      canvas.isDrawingMode = false;
      return;
    }

    canvas.isDrawingMode = true;
    const brush = new PencilBrush(canvas);

    switch (activeTool) {
      case 'pen':
        brush.width = brushSize;
        brush.color = brushColor;
        break;
      case 'pencil':
        brush.width = Math.max(1, brushSize * 0.7);
        brush.color = brushColor;
        (brush as PencilBrush).decimate = 2;
        break;
      case 'marker':
        brush.width = brushSize * 3;
        brush.color = brushColor + '66'; // 투명도
        break;
      case 'eraser':
        brush.width = brushSize * 2;
        brush.color = '#ffffff';
        break;
    }

    canvas.freeDrawingBrush = brush;
  }, [activeTool, brushColor, brushSize]);

  // 페이지 전환 시 캔버스 로드
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const page = pages[currentPageIndex];
    if (!page) return;

    const canvasData = page.canvasJSON;
    if (canvasData && Object.keys(canvasData).length > 0) {
      canvas.loadFromJSON(canvasData).then(() => {
        canvas.renderAll();
      });
    } else {
      canvas.clear();
      canvas.backgroundColor = '#ffffff';
      canvas.renderAll();
    }
  }, [currentPageIndex, pages]);

  const handleResize = () => {
    if (!containerRef.current || !fabricRef.current) return;
    const container = containerRef.current;
    const scale = getCanvasScale(container.clientWidth, container.clientHeight);

    const wrapper = canvasRef.current?.parentElement;
    if (wrapper) {
      wrapper.style.transform = `scale(${scale})`;
      wrapper.style.transformOrigin = 'top center';
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-start justify-center overflow-auto bg-gray-100 p-4"
    >
      <div className="shadow-lg">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

// Canvas 인스턴스를 외부에서 접근하기 위한 함수
export function getCanvasInstance(): Canvas | null {
  return null; // EditorCanvas에서 ref로 관리
}
