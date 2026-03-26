import { z } from 'zod'

export const leadSchema = z.object({
  restaurantName: z.string().min(1).max(200),
  contactPerson: z.string().min(1).max(200),
  email: z.string().email().max(254),
  phone: z.string().max(30).optional(),
  numLocations: z.string().max(20).optional(),
  planInterest: z.string().max(50).optional(),
  teamSize: z.string().max(20).optional(),
  preferredTime: z.string().max(100).optional(),
  message: z.string().max(2000).optional(),
  currentSystem: z.string().max(200).optional(),
  integrationNeeds: z.string().max(1000).optional(),
  source: z.enum(['homepage', 'get-started', 'book-demo', 'contact']),
})

export const profileSchema = z.object({
  full_name: z.string().min(1).max(200).optional(),
  email: z.string().email().max(254).optional(),
})

export const restaurantSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  currency: z.string().length(3).optional(),
  timezone: z.string().max(50).optional(),
  tax_rate: z.number().min(0).max(100).optional(),
})
