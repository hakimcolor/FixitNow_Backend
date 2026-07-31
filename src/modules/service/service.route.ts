import express from 'express';
import { ServiceControllers } from './service.controller';
import validateParams from '../../middlewares/validateParams';
import validateQuery from '../../middlewares/validateQuery';
import {
  idParamValidationSchema,
  paginationQuerySchema,
} from '../../validations';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Service
 *   description: Service operations
 */

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Get all services
 *     tags: [Service]
 *     responses:
 *       200:
 *         description: List of services
 */
router.get(
  '/',
  validateQuery(paginationQuerySchema),
  ServiceControllers.getAllServices
);

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Get service by ID
 *     tags: [Service]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service details
 */
router.get(
  '/:id',
  validateParams(idParamValidationSchema),
  ServiceControllers.getServiceById
);

export const ServiceRoutes = router;
