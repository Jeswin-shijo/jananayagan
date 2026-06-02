import {z} from 'zod';

export const loginSchema = z.object({
  phone: z
    .string()
    .min(10, 'Enter a valid 10-digit phone number')
    .max(10, 'Enter a valid 10-digit phone number')
    .regex(/^[6-9]\d{9}$/, 'Enter a valid Indian mobile number'),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

export const reportProblemSchema = z.object({
  category: z.string().min(1, 'Please select a category'),
  subCategory: z.string().optional(),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(500, 'Description cannot exceed 500 characters'),
  address: z.string().min(5, 'Please provide a location'),
  priority: z.enum(['low', 'medium', 'high']),
});

export const petitionSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  category: z.string().min(1, 'Please select a category'),
  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  targetSignatures: z
    .number()
    .min(10, 'Target must be at least 10 signatures')
    .max(100000, 'Target cannot exceed 100,000'),
  constituency: z.string().min(1, 'Please select a constituency'),
});

export const volunteerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .length(10, 'Enter a valid 10-digit number')
    .regex(/^[6-9]\d{9}$/, 'Enter a valid Indian mobile number'),
  area: z.string().min(2, 'Please provide an area'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type OTPFormData = z.infer<typeof otpSchema>;
export type ReportProblemFormData = z.infer<typeof reportProblemSchema>;
export type PetitionFormData = z.infer<typeof petitionSchema>;
export type VolunteerFormData = z.infer<typeof volunteerSchema>;
