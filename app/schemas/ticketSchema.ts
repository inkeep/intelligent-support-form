import { z } from 'zod';

export const TicketSchema = z.object({
  name: z.string().trim().min(1, {
    message: 'Please enter your name.',
  }),
  email: z
    .string()
    .trim()
    .min(1, {
      message: 'Please enter your email.',
    })
    .email({
      message: 'Please enter a valid email.',
    }),
  message: z.string().trim().min(1, {
    message: 'Please enter a message.',
  }),
  subject: z.string().default('General Inquiry'),
  priority: z.enum(['urgent', 'high', 'medium', 'low']).default('medium'),
  ticketType: z.enum([
    'talk_to_sales',
    'issue_in_production',
    'issue_in_development',
    'report_bug',
    'onboarding_help',
    'account_management',
    'feature_request',
  ]).default('issue_in_production'),
  organizationId: z.number().optional(),
});

export type TicketSchemaType = z.infer<typeof TicketSchema>; 