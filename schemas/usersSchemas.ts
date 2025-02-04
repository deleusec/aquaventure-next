import { z } from 'zod';

export const updateUserSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    role: z.enum(["user", "admin"]).optional(),
});
