const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    phone_number: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number').optional().or(z.literal('')),
    role: z.enum(['CUSTOMER', 'PROVIDER']).default('CUSTOMER'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().min(1, 'EMAIL_OR_MOBILE_REQUIRED_FOR_SECURE_AUTH'),
    password: z.string().min(1, 'Password is required'),
  }),
});

module.exports = { registerSchema, loginSchema };
