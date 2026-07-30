import express from 'express';
import { CategoryControllers } from './category.controller';
import { CategoryValidations } from './category.validation';
import validateRequest from '../../middlewares/validateRequest';
import validateParams from '../../middlewares/validateParams';
import { idParamValidationSchema } from '../../validations';
import { auth } from '../../middlewares/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Category
 *   description: Category operations
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories (public)
 *     description: Returns all service categories with service counts. No authentication required.
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: List of categories with service counts
 */
router.get('/', CategoryControllers.getAllCategoriesPublic);

/**
 * @swagger
 * /api/admin/categories:
 *   post:
 *     summary: Create a category
 *     tags: [Category]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Plumbing
 *               description:
 *                 type: string
 *                 example: Plumbing repair and installation services
 *     responses:
 *       201:
 *         description: Category created
 */
router.post(
  '/',
  auth('ADMIN'),
  validateRequest(CategoryValidations.createCategoryValidationSchema),
  CategoryControllers.createCategory
);

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   patch:
 *     summary: Update a category
 *     tags: [Category]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category updated
 */
router.patch(
  '/:id',
  auth('ADMIN'),
  validateParams(idParamValidationSchema),
  validateRequest(CategoryValidations.updateCategoryValidationSchema),
  CategoryControllers.updateCategory
);

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Category]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 */
router.delete(
  '/:id',
  auth('ADMIN'),
  validateParams(idParamValidationSchema),
  CategoryControllers.deleteCategory
);

export const CategoryRoutes = router;
