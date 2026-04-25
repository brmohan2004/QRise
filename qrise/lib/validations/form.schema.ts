import { z } from 'zod';

export const FormFieldSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'email', 'phone', 'dropdown', 'checkbox', 'date', 'file', 'signature']),
  label: z.string().min(1).max(200),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  helperText: z.string().optional(),
});

export const CreateFormSchema = z.object({
  name: z.string().min(1).max(200),
  fields: z.array(FormFieldSchema).min(1),
  successMessage: z.string().optional(),
});

export const UpdateFormSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  fields: z.array(FormFieldSchema).optional(),
  successMessage: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const FormSubmissionSchema = z.record(z.string(), z.any());
