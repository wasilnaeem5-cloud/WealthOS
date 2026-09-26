import { z } from 'zod';

export const userProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name is too long'),
  age: z
    .number({ message: 'Age must be a number' })
    .int('Age must be a whole number')
    .min(13, 'User must be at least 13 years old')
    .max(120, 'Age exceeds realistic limit'),
  currency: z.string().default('USD'),
  onboardingCompleted: z.boolean().optional(),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
