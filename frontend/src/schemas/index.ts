import { z } from 'zod';

export const userRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const tokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
});

export const scoreBaseSchema = z.object({
  category: z.string(),
  score: z.number().min(1).max(5),
  note: z.string().optional(),
});

export const scoreCreateSchema = scoreBaseSchema.extend({
  candidate_id: z.number(),
});

export const scoreResponseSchema = scoreBaseSchema.extend({
  id: z.number(),
  reviewer_id: z.number(),
  created_at: z.string(),
});

export const candidateBaseSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  role_applied: z.string(),
  skills: z.array(z.string()),
});

export const candidateCreateSchema = candidateBaseSchema;

export const candidateUpdateSchema = z.object({
  status: z.string().min(1, "Status is required"),
  internal_notes: z.string().optional(),
});

export const candidateResponseSchema = candidateBaseSchema.extend({
  id: z.number(),
  status: z.string(),
  internal_notes: z.string().optional(),
  created_at: z.string(),
  scores: z.array(scoreResponseSchema),
});

export const aiSummarySchema = z.object({
  summary: z.string(),
});

// Form schemas
export const loginFormSchema = z.object({
  username: z.string().email(),
  password: z.string().min(1),
});

export const registerFormSchema = userRegisterSchema;

export const candidateFormSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role_applied: z.string().min(1),
  skills: z.string().transform(s => s.split(',').map(s => s.trim()).filter(s => s.length > 0)),
});

export const scoreFormSchema = scoreBaseSchema;