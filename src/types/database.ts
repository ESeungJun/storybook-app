export type UserRole = 'student' | 'teacher';
export type BookStatus = 'draft' | 'submitted' | 'approved' | 'rejected';
export type TemplateType =
  | 'full_illustration'
  | 'illustration_top'
  | 'illustration_bottom'
  | 'illustration_left'
  | 'full_text';

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  author_id: string;
  status: BookStatus;
  cover_image_url: string | null;
  teacher_comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookWithAuthor extends Book {
  profiles: Pick<Profile, 'name'>;
}

export interface Page {
  id: string;
  book_id: string;
  page_order: number;
  template_type: TemplateType;
  canvas_data: Record<string, unknown>;
  text_content: string | null;
  created_at: string;
}
