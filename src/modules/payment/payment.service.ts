import { prisma } from '../../lib/prisma';
import AppError from '../../utils/AppError';
import stripe from '../../lib/stripe';
import config from '../../config';
import type Stripe from 'stripe';
import { Prisma } from '../../../generated/prisma/client';
import { parsePagination, buildMeta } from '../../utils/pagination';

const createCheckoutSession = async (bookingId: string, userId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: true, payment: true },
  });

  if (!booking) {
    throw new AppError(404, 'Booking not found!');
  }

  if (booking.customerId !== userId) {
    throw new AppError(403, 'You are not authorized to pay for this booking!');
  }

  if (booking.status !== 'ACCEPTED') {
    throw new AppError(400, 'Booking must be accepted before payment!');
  }

  if (booking.payment && booking.payment.status === 'COMPLETED') {
    throw new AppError(400, 'This booking has already been paid!');
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: booking.service.title,
            description: booking.service.description,
          },
          unit_amount: Math.round(booking.servicePrice * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${config.frontendUrl}/payment/success?bookingId=${booking.id}`,
    cancel_url: `${config.frontendUrl}/payment/cancel?bookingId=${booking.id}`,
    metadata: {
      bookingId: booking.id,
      customerId: userId,
    },
  });

  await prisma.payment.upsert({
    where: { bookingId: booking.id },
    create: {
      bookingId: booking.id,
      amount: booking.servicePrice,
      transactionId: session.id,
      provider: 'STRIPE',
      status: 'PENDING',
      stripeCheckoutSessionId: session.id,
    },
    update: {
      amount: booking.servicePrice,
      transactionId: session.id,
      provider: 'STRIPE',
      status: 'PENDING',
      stripeCheckoutSessionId: session.id,
      paidAt: null,
    },
  });

  return { url: session.url, sessionId: session.id };
};

const getUserPaymentHistory = async (
  userId: string,
  role: string,
  query: import('../../interfaces/payloads').PaginationQuery
) => {
  const { page, limit, skip, take, sortBy, sortOrder } = parsePagination(query);
  const where: Prisma.PaymentWhereInput = {};

  if (role === 'CUSTOMER') {
    where.booking = { customerId: userId };
  }

  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take,
      orderBy: {
        [sortBy]: sortOrder,
      } as Prisma.PaymentOrderByWithRelationInput,
      include: {
        booking: {
          include: {
            service: true,
            customer: { select: { name: true, email: true } },
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

const getPaymentById = async (
  paymentId: string,
  userId: string,
  role: string
) => {
  const result = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        include: {
          service: true,
          customer: { select: { name: true, email: true } },
        },
      },
    },
  });

  if (!result) {
    throw new AppError(404, 'Payment not found!');
  }

  if (role === 'CUSTOMER' && result.booking.customerId !== userId) {
    throw new AppError(
      403,
      'You are not authorized to view this payment details'
    );
  }

  return result;
};

const markBookingPaid = async (session: Stripe.Checkout.Session) => {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) return;

  if (session.payment_status !== 'paid') return;

  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id;

  const amount = (session.amount_total ?? 0) / 100;

  const existingPayment = await prisma.payment.findUnique({
    where: { bookingId },
  });

  if (existingPayment && existingPayment.status === 'COMPLETED') {
    return;
  }

  await prisma.payment.upsert({
    where: { bookingId },
    create: {
      bookingId,
      amount,
      transactionId: paymentIntentId ?? session.id,
      provider: 'STRIPE',
      status: 'COMPLETED',
      stripeCheckoutSessionId: session.id,
      paidAt: new Date(),
    },
    update: {
      amount,
      transactionId: paymentIntentId ?? session.id,
      provider: 'STRIPE',
      status: 'COMPLETED',
      stripeCheckoutSessionId: session.id,
      paidAt: new Date(),
    },
  });

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'PAID' },
  });
};

const handleCheckoutSessionFailed = async (
  session: Stripe.Checkout.Session
) => {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) return;

  const existingPayment = await prisma.payment.findUnique({
    where: { bookingId },
  });

  if (!existingPayment || existingPayment.status === 'COMPLETED') {
    return;
  }

  await prisma.payment.update({
    where: { bookingId },
    data: { status: 'FAILED' },
  });
};

const handleChargeRefunded = async (charge: Stripe.Charge) => {
  const paymentIntentId =
    typeof charge.payment_intent === 'string'
      ? charge.payment_intent
      : charge.payment_intent?.id;

  if (!paymentIntentId) return;

  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { transactionId: paymentIntentId },
    });

    if (!payment || payment.status === 'REFUNDED') return;

    await tx.payment.update({
      where: { id: payment.id },
      data: { status: 'REFUNDED' },
    });

    await tx.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'CANCELLED' },
    });
  });
};

const handleStripeEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
      await markBookingPaid(event.data.object as Stripe.Checkout.Session);
      break;
    case 'checkout.session.async_payment_failed':
      await handleCheckoutSessionFailed(
        event.data.object as Stripe.Checkout.Session
      );
      break;
    case 'charge.refunded':
      await handleChargeRefunded(event.data.object as Stripe.Charge);
      break;
    default:
      break;
  }
};

const confirmPayment = async (sessionId: string, userId: string) => {
  // Look up the payment by its Stripe session ID
  const payment = await prisma.payment.findFirst({
    where: { stripeCheckoutSessionId: sessionId },
    include: { booking: true },
  });

  if (!payment) {
    throw new AppError(404, 'Payment record not found for this session!');
  }

  if (payment.booking.customerId !== userId) {
    throw new AppError(403, 'You are not authorized to confirm this payment!');
  }

  // Already confirmed — idempotent response
  if (payment.status === 'COMPLETED') {
    return payment;
  }

  // Ask Stripe for the current session status
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== 'paid') {
    throw new AppError(
      400,
      'Payment has not been completed on Stripe side yet!'
    );
  }

  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id;

  const amount = (session.amount_total ?? 0) / 100;

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        transactionId: paymentIntentId ?? sessionId,
        amount,
        paidAt: new Date(),
      },
    });

    await tx.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'PAID' },
    });
  });

  return prisma.payment.findUnique({
    where: { id: payment.id },
    include: { booking: { select: { id: true, status: true } } },
  });
};

export const PaymentServices = {
  createCheckoutSession,
  getUserPaymentHistory,
  getPaymentById,
  confirmPayment,
  handleStripeEvent,
};
