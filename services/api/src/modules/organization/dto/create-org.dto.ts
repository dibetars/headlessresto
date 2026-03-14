import { z } from 'zod';

export const createOrgSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  brand_assets: z.record(z.unknown()).optional(),
});

export type CreateOrgDto = z.infer<typeof createOrgSchema>;
