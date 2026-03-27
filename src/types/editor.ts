import type { TemplateType } from './database';

export type BrushType = 'pen' | 'pencil' | 'marker' | 'eraser';
export type EditorTool = 'select' | 'pen' | 'pencil' | 'marker' | 'eraser' | 'text';

export interface TemplateZone {
  type: 'illustration' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TemplateDefinition {
  type: TemplateType;
  label: string;
  zones: TemplateZone[];
}

export interface PageState {
  id: string;
  order: number;
  templateType: TemplateType;
  canvasJSON: Record<string, unknown>;
  textContent: string | null;
  thumbnailUrl?: string;
}
