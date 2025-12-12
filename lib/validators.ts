import { z } from 'zod';

export const SignupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100)
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100)
});

export const TenantCreateSchema = z.object({
  name: z.string().min(2).max(100)
});

export const InviteCreateSchema = z.object({
  email: z.string().email()
});

export const TaskCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).default(''),
  status: z.enum(['TODO', 'DOING', 'DONE']).default('TODO'),
  // Accepts the HTML datetime-local value like "2025-12-12T14:30"
  dueDate: z.string().optional().nullable(),
  assigneeId: z.string().uuid().optional().nullable()
});

export const TaskUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(['TODO', 'DOING', 'DONE']).optional(),
  // Accepts "YYYY-MM-DDTHH:mm" or null
  dueDate: z.string().nullable().optional(),
  assigneeId: z.string().uuid().nullable().optional()
});

export const TasksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(['TODO', 'DOING', 'DONE']).optional(),
  search: z.string().trim().max(200).optional()
});


