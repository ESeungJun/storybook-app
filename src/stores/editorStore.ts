'use client';

import { create } from 'zustand';
import type { EditorTool, PageState, TemplateType } from '@/types';

interface EditorState {
  // Book
  bookId: string | null;
  bookTitle: string;

  // Pages
  pages: PageState[];
  currentPageIndex: number;

  // Tools
  activeTool: EditorTool;
  brushColor: string;
  brushSize: number;

  // Undo/Redo
  undoStack: string[];
  redoStack: string[];

  // Save state
  isSaving: boolean;
  isDirty: boolean;
  lastSavedAt: string | null;

  // Actions
  setBookId: (id: string) => void;
  setBookTitle: (title: string) => void;
  setPages: (pages: PageState[]) => void;
  setCurrentPageIndex: (index: number) => void;
  addPage: (page: PageState) => void;
  deletePage: (index: number) => void;
  updatePageCanvas: (index: number, canvasJSON: Record<string, unknown>) => void;
  updatePageTemplate: (index: number, templateType: TemplateType) => void;
  updatePageText: (index: number, text: string) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  setActiveTool: (tool: EditorTool) => void;
  setBrushColor: (color: string) => void;
  setBrushSize: (size: number) => void;
  pushUndo: (snapshot: string) => void;
  undo: () => string | null;
  redo: () => string | null;
  clearHistory: () => void;
  setIsSaving: (saving: boolean) => void;
  markDirty: () => void;
  markSaved: () => void;
  reset: () => void;
}

const MAX_UNDO = 30;

const initialState = {
  bookId: null,
  bookTitle: '제목 없음',
  pages: [],
  currentPageIndex: 0,
  activeTool: 'pen' as EditorTool,
  brushColor: '#000000',
  brushSize: 3,
  undoStack: [],
  redoStack: [],
  isSaving: false,
  isDirty: false,
  lastSavedAt: null,
};

export const useEditorStore = create<EditorState>((set, get) => ({
  ...initialState,

  setBookId: (id) => set({ bookId: id }),
  setBookTitle: (title) => set({ bookTitle: title, isDirty: true }),

  setPages: (pages) => set({ pages }),

  setCurrentPageIndex: (index) => set({
    currentPageIndex: index,
    undoStack: [],
    redoStack: [],
  }),

  addPage: (page) =>
    set((state) => ({
      pages: [...state.pages, page],
      isDirty: true,
    })),

  deletePage: (index) =>
    set((state) => {
      const pages = state.pages.filter((_, i) => i !== index);
      const newIndex = Math.min(state.currentPageIndex, pages.length - 1);
      return {
        pages: pages.map((p, i) => ({ ...p, order: i })),
        currentPageIndex: Math.max(0, newIndex),
        isDirty: true,
      };
    }),

  updatePageCanvas: (index, canvasJSON) =>
    set((state) => {
      const pages = [...state.pages];
      if (pages[index]) {
        pages[index] = { ...pages[index], canvasJSON };
      }
      return { pages, isDirty: true };
    }),

  updatePageTemplate: (index, templateType) =>
    set((state) => {
      const pages = [...state.pages];
      if (pages[index]) {
        pages[index] = { ...pages[index], templateType };
      }
      return { pages, isDirty: true };
    }),

  updatePageText: (index, text) =>
    set((state) => {
      const pages = [...state.pages];
      if (pages[index]) {
        pages[index] = { ...pages[index], textContent: text };
      }
      return { pages, isDirty: true };
    }),

  reorderPages: (fromIndex, toIndex) =>
    set((state) => {
      const pages = [...state.pages];
      const [moved] = pages.splice(fromIndex, 1);
      pages.splice(toIndex, 0, moved);
      return {
        pages: pages.map((p, i) => ({ ...p, order: i })),
        currentPageIndex: toIndex,
        isDirty: true,
      };
    }),

  setActiveTool: (tool) => set({ activeTool: tool }),
  setBrushColor: (color) => set({ brushColor: color }),
  setBrushSize: (size) => set({ brushSize: size }),

  pushUndo: (snapshot) =>
    set((state) => ({
      undoStack: [...state.undoStack.slice(-MAX_UNDO + 1), snapshot],
      redoStack: [],
    })),

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return null;
    const stack = [...state.undoStack];
    const snapshot = stack.pop()!;
    set({ undoStack: stack });
    return snapshot;
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return null;
    const stack = [...state.redoStack];
    const snapshot = stack.pop()!;
    set({ redoStack: stack });
    return snapshot;
  },

  clearHistory: () => set({ undoStack: [], redoStack: [] }),

  setIsSaving: (saving) => set({ isSaving: saving }),
  markDirty: () => set({ isDirty: true }),
  markSaved: () => set({ isDirty: false, isSaving: false, lastSavedAt: new Date().toISOString() }),

  reset: () => set(initialState),
}));
