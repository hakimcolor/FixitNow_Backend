import { prisma } from '../../lib/prisma';
import AppError from '../../utils/AppError';
import { parsePagination, buildMeta } from '../../utils/pagination';
import { Prisma, BookingStatus } from '../../../generated/prisma/client';
import type { PaginationQuery } from '../../interfaces/payloads';
import { assertTransition } from '../booking/bookingStatus';
import type { TUpdateProfilePayload } from './technician.validation';

const getTechnicianBookings = async (
  userId: string,
  query: PaginationQuery
) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!technicianProfile) {
    throw new AppError(404, 'Technician profile not found!');
  }

  const { page, limit, skip, take, sortBy, sortOrder } = parsePagination(query);
  const where = { technicianProfileId: technicianProfile.id };

  const [data, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take,
      orderBy: {
        [sortBy]: sortOrder,
      } as Prisma.BookingOrderByWithRelationInput,
      include: {
        service: true,
        customer: { select: { name: true, email: true } },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

const updateBookingStatus = async (
  bookingId: string,
  userId: string,
  status: BookingStatus
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new AppError(404, 'Booking not found!');
  }

  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!technicianProfile) {
    throw new AppError(404, 'Technician profile not found!');
  }

  if (booking.technicianProfileId !== technicianProfile.id) {
    throw new AppError(403, 'You are not authorized to update this booking!');
  }

  assertTransition(booking.status, status);

  const result = await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
    include: {
      service: true,
      customer: { select: { name: true, email: true } },
    },
  });

  return result;
};

const updateProfile = async (
  userId: string,
  payload: TUpdateProfilePayload
) => {
  const result = await prisma.technicianProfile.update({
    where: { userId },
    data: payload,
  });

  return result;
};

const updateAvailability = async (
  userId: string,
  availabilityData: Prisma.InputJsonValue
) => {
  const result = await prisma.technicianProfile.update({
    where: { userId },
    data: { availability: availabilityData },
  });

  return result;
};

type TechnicianQuery = PaginationQuery & {
  location?: string;
  minRating?: string;
  minHourlyRate?: string;
  maxHourlyRate?: string;
};

const getAllTechnicians = async (query: TechnicianQuery) => {
  const { page, limit, skip, take, sortBy, sortOrder } = parsePagination(query);
  const where: Prisma.TechnicianProfileWhereInput = {
    user: { status: 'ACTIVE' },
  };

  if (query.location) {
    where.location = { contains: query.location, mode: 'insensitive' };
  }

  if (query.minRating) {
    where.averageRating = { gte: parseFloat(query.minRating) };
  }

  if (query.minHourlyRate || query.maxHourlyRate) {
    where.hourlyRate = {};
    if (query.minHourlyRate)
      where.hourlyRate.gte = parseFloat(query.minHourlyRate);
    if (query.maxHourlyRate)
      where.hourlyRate.lte = parseFloat(query.maxHourlyRate);
  }

  const [data, total] = await Promise.all([
    prisma.technicianProfile.findMany({
      where,
      skip,
      take,
      orderBy: {
        [sortBy]: sortOrder,
      } as Prisma.TechnicianProfileOrderByWithRelationInput,
      include: {
        user: { select: { name: true, email: true, status: true } },
      },
    }),
    prisma.technicianProfile.count({ where }),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

const getTechnicianById = async (id: string) => {
  const result = await prisma.technicianProfile.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      services: true,
      reviews: {
        include: {
          customer: { select: { name: true } },
        },
      },
    },
  });

  if (!result) {
    throw new AppError(404, 'Technician not found!');
  }

  return result;
};

export const TechnicianServices = {
  getTechnicianBookings,
  updateBookingStatus,
  updateProfile,
  updateAvailability,
  getAllTechnicians,
  getTechnicianById,
};
