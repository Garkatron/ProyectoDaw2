import { z } from "zod";

const RegisterSchema = z.object({
  username: z
    .string()
    .min(2, "Name is too short")
    .regex(/^[A-Za-z\s]+$/, "Name cannot contain special characters or numbers"),

  email: z.string().email("Invalid email address"),

  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default RegisterSchema;