import express from 'express';
import { AdminControllers } from './admin.controller';
import { AdminValidations } from './admin.validation';
import validateRequest from '../../middlewares/validateRequest';
import validateParams from '../../middlewares/validateParams';
import {
  idParamValidationSchema,
  paginationQuerySchema,
} from '../../validations';
import { auth } from '../../middlewares/auth';
import validateQuery from '../../middlewares/validateQuery';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin operations
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get(
  '/users',
  auth('ADMIN'),
  validateQuery(paginationQuerySchema),
  AdminControllers.getAllUsers
);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   patch:
 *     summary: Toggle user status
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, BANNED]
 *     responses:
 *       200:
 *         description: User status updated
 */
router.patch(
  '/users/:id',
  auth('ADMIN'),
  validateParams(idParamValidationSchema),
  validateRequest(AdminValidations.toggleUserStatusValidationSchema),
  AdminControllers.toggleUserStatus
);

/**
 * @swagger
 * /api/admin/bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get(
  '/bookings',
  auth('ADMIN'),
  validateQuery(paginationQuerySchema),
  AdminControllers.getAllBookings
);

export const AdminRoutes = router;
