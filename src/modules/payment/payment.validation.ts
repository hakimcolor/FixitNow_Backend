import { z } from 'zod';

const createCheckoutSessionValidationSchema = z.object({
  body: z
    .object({
      bookingId: z
        .string({ message: 'Booking ID is required' })
        .uuid({ message: 'Invalid Booking ID format' }),
    })
    .strict(),
});

export type TCreateCheckoutSessionPayload = z.infer<
  typeof createCheckoutSessionValidationSchema
>['body'];

const confirmPaymentValidationSchema = z.object({
  body: z
    .object({
      sessionId: z
        .string({ message: 'Session ID is required' })
        .min(1, { message: 'Session ID cannot be empty' }),
    })
    .strict(),
});

export type TConfirmPaymentPayload = z.infer<
  typeof confirmPaymentValidationSchema
>['body'];

export const PaymentValidations = {
  createCheckoutSessionValidationSchema,
  confirmPaymentValidationSchema,
};
