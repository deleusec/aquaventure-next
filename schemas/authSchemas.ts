import { z } from "zod";

// Validation pour l'inscription
export const registerSchema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Validation pour la connexion
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});