'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Canvas, IText, FabricImage } from 'fabric';
import { useEditorStore } from '@/stores/editorStore';
import AuthGuard from '@/components/layout/AuthGuard';
import EditorHeader from '@/components/editor/EditorHeader';
import EditorToolbar from '@/components/editor/EditorToolbar';
import PageManager from '@/components/editor/PageManager';
import TextEditor from '@/components/editor/TextEditor';
import ImageUploader from '@/components/editor/ImageUploader';
import Spinner from '@/components/ui/Spinner';
import { CANVAS_WIDTH, CANVAS_HEIGHT, getCanvasScale } from '@/lib/fabric/setup';
import { PencilBrush } from 'fabric';
import type { PageState } from '@/types';
import type { TextOptions } from '@/components/editor/TextEditor';

export default function EditorPage() {
  return (
    <AuthGuard allowedRoles={['student']}>
      <EditorContent />
    </AuthGuard>
  );
}

function EditorContent() {
  const params = useParams();
  const bookId = params.bookId as string;
  const [loading, setLoading] = useState(true);
  const [showTextPanel, setShowTextPanel] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    setBookId,
    setBookTitle,
    setPages,
    currentPageIndex,
    activeTool,
    brushColor,
    brushSize,
    updatePageCanvas,
    pushUndo,
    setIsSaving,
    markSaved,
    markDirty,
    reset,
  } = useEditorStore();

  // 데이터 로드
  useEffect(() => {
    const loadBook = async () => {
      try {
        const res = await fetch(`/api/books/${bookId}`);
        if (res.ok) {
          const book = await res.json();

          setBookId(bookId);
          setBookTitle(book.title);

          const pageStates: PageState[] = (book.pages || []).map((p: Record<string, unknown>) => ({
            id: p.id as string,
            order: p.page_order as number,
            templateType: p.template_type as string,
            canvasJSON: p.canvas_data as Record<string, unknown>,
            textContent: p.text_content as string | null,
          }));

          if (pageStates.length === 0) {
            pageStates.push({
              id: 'temp-0',
              order: 0,
              templateType: 'full_illustration',
              canvasJSON: {},
              textContent: null,
            });
          }

          setPages(pageStates);
        } else {
          // API 실패 시 빈 페이지로 시작
          setBookId(bookId);
          setBookTitle('테스트 그림책');
          setPages([{
            id: 'temp-0',
            order: 0,
            templateType: 'full_illustration',
            canvasJSON: {},
            textContent: null,
          }]);
        }
      } catch {
        setBookId(bookId);
        setBookTitle('테스트 그림책');
        setPages([{
          id: 'temp-0',
          order: 0,
          templateType: 'full_illustration',
          canvasJSON: {},
          textContent: null,
        }]);
      }
      setLoading(false);
    };

    loadBook();
    return () => { reset(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  // Canvas 초기화
  useEffect(() => {
    if (loading || !canvasRef.current || fabricRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: '#ffffff',
      isDrawingMode: false,
      selection: true,
      preserveObjectStacking: true,
    });

    fabricRef.current = canvas;

    canvas.on('path:created', () => {
      handleCanvasChange();
    });

    canvas.on('object:modified', () => {
      handleCanvasChange();
    });

    handleResize();
    window.addEventListener('resize', handleResize);

    // 첫 페이지 로드
    loadCanvasFromPage(0);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const handleCanvasChange = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const json = canvas.toJSON();
    const idx = useEditorStore.getState().currentPageIndex;
    updatePageCanvas(idx, json);
    pushUndo(JSON.stringify(json));
    markDirty();
    scheduleAutoSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatePageCanvas, pushUndo, markDirty]);

  // 도구 변경
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (activeTool === 'select') {
      canvas.isDrawingMode = false;
      return;
    }

    if (activeTool === 'text') {
      canvas.isDrawingMode = false;
      setShowTextPanel(true);
      return;
    }

    setShowTextPanel(false);
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
        break;
      case 'marker':
        brush.width = brushSize * 3;
        brush.color = brushColor + '66';
        break;
      case 'eraser':
        brush.width = brushSize * 2;
        brush.color = '#ffffff';
        break;
    }

    canvas.freeDrawingBrush = brush;
  }, [activeTool, brushColor, brushSize]);

  // 페이지 전환
  useEffect(() => {
    if (loading) return;
    loadCanvasFromPage(currentPageIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageIndex]);

  const loadCanvasFromPage = (index: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const storePages = useEditorStore.getState().pages;
    const page = storePages[index];
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
  };

  const handleResize = () => {
    if (!containerRef.current || !canvasRef.current) return;
    const container = containerRef.current;
    const scale = getCanvasScale(container.clientWidth - 32, container.clientHeight - 32);

    const wrapper = canvasRef.current.parentElement;
    if (wrapper) {
      wrapper.style.transform = `scale(${scale})`;
      wrapper.style.transformOrigin = 'top center';
    }
  };

  // 텍스트 추가
  const handleAddText = (text: string, options: TextOptions) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const textObj = new IText(text, {
      left: CANVAS_WIDTH / 2 - 100,
      top: CANVAS_HEIGHT / 2 - 20,
      fontSize: options.fontSize,
      fontFamily: options.fontFamily,
      fill: options.fill,
      fontWeight: options.fontWeight,
    });

    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.renderAll();
    handleCanvasChange();
    setShowTextPanel(false);
  };

  // 이미지 추가
  const handleAddImage = (url: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    FabricImage.fromURL(url, { crossOrigin: 'anonymous' }).then((img) => {
      const maxWidth = CANVAS_WIDTH * 0.6;
      const maxHeight = CANVAS_HEIGHT * 0.6;
      const scale = Math.min(maxWidth / (img.width || 1), maxHeight / (img.height || 1), 1);

      img.set({
        left: CANVAS_WIDTH / 2 - ((img.width || 0) * scale) / 2,
        top: CANVAS_HEIGHT / 2 - ((img.height || 0) * scale) / 2,
        scaleX: scale,
        scaleY: scale,
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      handleCanvasChange();
    });
  };

  // 자동 저장
  const scheduleAutoSave = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 3000);
  };

  const autoSave = async () => {
    const state = useEditorStore.getState();
    if (!state.isDirty || state.isSaving) return;

    setIsSaving(true);

    try {
      // 타이틀 저장
      await fetch(`/api/books/${bookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: state.bookTitle }),
      });

      // 각 페이지 저장
      for (const page of state.pages) {
        if (page.id.startsWith('temp-')) {
          // 새 페이지 생성
          const res = await fetch('/api/pages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookId,
              templateType: page.templateType,
            }),
          });
          const created = await res.json();
          if (created.id) {
            page.id = created.id;
            // 캔버스 데이터 저장
            await fetch(`/api/pages/${created.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                canvas_data: page.canvasJSON,
                template_type: page.templateType,
                page_order: page.order,
              }),
            });
          }
        } else {
          await fetch(`/api/pages/${page.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              canvas_data: page.canvasJSON,
              template_type: page.templateType,
              page_order: page.order,
            }),
          });
        }
      }

      markSaved();
    } catch {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Spinner className="h-8 w-8 text-primary-600" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      <EditorHeader />
      <div className="flex-1 flex overflow-hidden">
        <EditorToolbar />

        {/* 캔버스 영역 */}
        <div
          ref={containerRef}
          className="flex-1 flex items-start justify-center overflow-auto bg-gray-100 p-4 relative"
        >
          <div className="shadow-lg bg-white">
            <canvas ref={canvasRef} />
          </div>

          {/* 텍스트 패널 (플로팅) */}
          {showTextPanel && (
            <div className="absolute top-4 right-4 bg-white border rounded-xl shadow-lg p-4 w-64 z-10">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold">텍스트 추가</h3>
                <button onClick={() => setShowTextPanel(false)} className="text-gray-400 hover:text-gray-600">
                  &times;
                </button>
              </div>
              <TextEditor onAddText={handleAddText} />
            </div>
          )}

          {/* 이미지 업로드 (플로팅) */}
          {activeTool === 'select' && (
            <div className="absolute bottom-4 right-4 z-10">
              <ImageUploader onImageAdd={handleAddImage} />
            </div>
          )}
        </div>

        <PageManager />
      </div>
    </div>
  );
}
