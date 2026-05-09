export interface User {
  id: number;
  email: string;
  role: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface Score {
  id: number;
  category: string;
  score: number;
  note?: string;
  reviewer_id: number;
  created_at: string;
}

export interface Candidate {
  id: number;
  name: string;
  email: string;
  role_applied: string;
  skills: string[];
  status: string;
  internal_notes?: string;
  created_at: string;
  scores: Score[];
}

export interface AISummary {
  summary: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}