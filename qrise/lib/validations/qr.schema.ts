import { z } from 'zod';

export const RoutingConditionSchema = z.object({
  field: z.enum(['device', 'os', 'country', 'language', 'time_range']),
  op: z.enum(['eq', 'in', 'between']),
  value: z.union([z.string(), z.array(z.string())]),
});

export const RoutingRuleSchema = z.object({
  priority: z.number().int().min(0).max(100),
  conditions: z.array(RoutingConditionSchema),
  targetUrl: z.string().url(),
  label: z.string().max(100).optional(),
});

export const QRActionSchema = z.object({
  label: z.string().max(100),
  actionType: z.enum(['url', 'phone', 'email', 'map', 'download', 'whatsapp']),
  actionValue: z.string(),
  icon: z.string().max(50).optional(),
  displayOrder: z.number().int().min(0).max(10),
});

export const QRDesignConfigSchema = z.object({
  dotColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  bgColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  logoUrl: z.string().url().optional(),
  frameStyle: z.enum(['none', 'simple', 'rounded', 'badge_below', 'badge_above', 'bubble']).optional(),
  dotStyle: z.enum(['square', 'dots', 'rounded', 'extra_rounded']).optional(),
});

export const CreateURLQRSchema = z.object({
  name: z.string().min(1).max(200),
  targetUrl: z.string().url(),
  isDynamic: z.boolean().default(true),
  design: QRDesignConfigSchema.optional(),
});

export const CreateSmartRoutingQRSchema = z.object({
  name: z.string().min(1).max(200),
  defaultUrl: z.string().url(),
  rules: z.array(RoutingRuleSchema).min(1).max(10),
  isDynamic: z.boolean().default(true),
  design: QRDesignConfigSchema.optional(),
});

export const CreatePasswordQRSchema = z.object({
  name: z.string().min(1).max(200),
  targetUrl: z.string().url(),
  password: z.string().min(4).max(100),
  isDynamic: z.boolean().default(false),
  design: QRDesignConfigSchema.optional(),
});

export const CreateMultiActionQRSchema = z.object({
  name: z.string().min(1).max(200),
  actions: z.array(QRActionSchema).min(1).max(8),
  design: QRDesignConfigSchema.optional(),
});

export const CreateBulkQRSchema = z.object({
  name: z.string().min(1).max(200),
  totalRows: z.number().int().min(1).max(10000),
  design: QRDesignConfigSchema.optional(),
});

export const UpdateQRSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  targetUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
  design: QRDesignConfigSchema.optional(),
});
