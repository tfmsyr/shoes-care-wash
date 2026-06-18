import { z } from "zod";

// 🔹 Field reusable
export const nameSchema = z
  .string()
  .regex(/^[a-zA-Z\s]+$/, "Name must only contain letters")
  .min(3, "Name must be at least 3 characters");

export const phoneSchema = z
  .string()
  .regex(/^[0-9]+$/, "Phone must be numeric")
  .min(10, "Phone must be valid");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

// 🔹 Signup Schema
export const signUpSchema = z.object({
  name: nameSchema,
  businessName: z.string().min(3, "Business name is required"),
  businessAddress: z.string().min(5, "Business address is required"),
  phone: phoneSchema,
  password: passwordSchema,
});

// 🔹 Login Schema
export const loginSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
});

// 🔹 Forgot Password Schema
export const forgotPasswordSchema = z.object({
  phone: phoneSchema,
});

// 🔹 OTP Schema
export const otpSchema = z.object({
  otp: z
    .string()
    .regex(/^[0-9]+$/, "OTP must be numeric")
    .length(4, "OTP must be 4 digits"),
});

// 🔹 Confirm Password Schema
export const confirmPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
