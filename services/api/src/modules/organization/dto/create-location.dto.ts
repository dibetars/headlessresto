import { z } from 'zod';

export const createLocationSchema = z.object({
  name: z.string().min(1).max(200),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  zip: z.string().max(20).optional(),
  timezone: z.string().default('America/New_York'),
  operating_hours: z.record(z.unknown()).optional(),
});

export type CreateLocationDto = z.infer<typeof createLocationSchema>;
