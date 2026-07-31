import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FixItNow API',
      version: '1.0.0',
      description:
        'API documentation for FixItNow — Home Service Booking Platform',
    },
    servers: [
      {
        url: process.env.BACKEND_URL || 'http://localhost:5001',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
        },
      },
    },
    security: [{ cookieAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication' },
      { name: 'Service', description: 'Services' },
      { name: 'Technician', description: 'Technician operations' },
      { name: 'Category', description: 'Categories' },
      { name: 'Booking', description: 'Bookings' },
      { name: 'Payment', description: 'Payments' },
      { name: 'Review', description: 'Reviews' },
      { name: 'Admin', description: 'Admin operations' },
    ],
    paths: {
      // AUTH
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register new user (CUSTOMER or TECHNICIAN)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password', 'role'],
                  properties: {
                    name: { type: 'string', example: 'John Doe' },
                    email: { type: 'string', example: 'john@gmail.com' },
                    password: { type: 'string', example: 'password123' },
                    role: {
                      type: 'string',
                      enum: ['CUSTOMER', 'TECHNICIAN'],
                      example: 'CUSTOMER',
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'User registered' },
            409: { description: 'Email exists' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'admin@gmail.com' },
                    password: { type: 'string', example: 'password123' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Login successful, sets cookies' } },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current user profile',
          security: [{ cookieAuth: [] }],
          responses: {
            200: { description: 'User profile' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout user',
          responses: { 200: { description: 'Logged out' } },
        },
      },
      '/api/auth/refresh-token': {
        post: {
          tags: ['Auth'],
          summary: 'Refresh access token',
          responses: { 200: { description: 'Token refreshed' } },
        },
      },
      // CATEGORIES
      '/api/categories': {
        get: {
          tags: ['Category'],
          summary: 'Get all categories (public)',
          responses: { 200: { description: 'List of categories' } },
        },
      },
      '/api/admin/categories': {
        get: {
          tags: ['Category'],
          summary: 'Get all categories (Admin)',
          security: [{ cookieAuth: [] }],
          responses: { 200: { description: 'List of categories' } },
        },
        post: {
          tags: ['Category'],
          summary: 'Create category (Admin)',
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string', example: 'Electrical' },
                    description: {
                      type: 'string',
                      example: 'Electrical repair services',
                    },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Category created' } },
        },
      },
      '/api/admin/categories/{id}': {
        patch: {
          tags: ['Category'],
          summary: 'Update category (Admin)',
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Category updated' } },
        },
        delete: {
          tags: ['Category'],
          summary: 'Delete category (Admin)',
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: { 200: { description: 'Category deleted' } },
        },
      },
      // SERVICES
      '/api/services': {
        get: {
          tags: ['Service'],
          summary: 'Get all services (public)',
          parameters: [
            {
              in: 'query',
              name: 'page',
              schema: { type: 'integer', default: 1 },
            },
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer', default: 10 },
            },
            { in: 'query', name: 'search', schema: { type: 'string' } },
            { in: 'query', name: 'categoryId', schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'List of services' } },
        },
        post: {
          tags: ['Service'],
          summary: 'Create service (Technician)',
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'description', 'price', 'categoryId'],
                  properties: {
                    title: {
                      type: 'string',
                      example: 'Home Electrical Repair',
                    },
                    description: {
                      type: 'string',
                      example: 'Full electrical wiring service',
                    },
                    price: { type: 'number', example: 120 },
                    categoryId: { type: 'string', example: 'uuid-here' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Service created' } },
        },
      },
      '/api/services/{id}': {
        get: {
          tags: ['Service'],
          summary: 'Get service by ID',
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: { 200: { description: 'Service details' } },
        },
        patch: {
          tags: ['Service'],
          summary: 'Update service (Technician)',
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    price: { type: 'number' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Service updated' } },
        },
        delete: {
          tags: ['Service'],
          summary: 'Delete service (Technician)',
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: { 200: { description: 'Service deleted' } },
        },
      },
      // TECHNICIANS
      '/api/technicians': {
        get: {
          tags: ['Technician'],
          summary: 'Get all technicians (public)',
          parameters: [
            {
              in: 'query',
              name: 'page',
              schema: { type: 'integer', default: 1 },
            },
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer', default: 10 },
            },
            { in: 'query', name: 'location', schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'List of technicians' } },
        },
      },
      '/api/technicians/{id}': {
        get: {
          tags: ['Technician'],
          summary: 'Get technician by ID with reviews',
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: { 200: { description: 'Technician profile' } },
        },
      },
      '/api/technician/profile': {
        put: {
          tags: ['Technician'],
          summary: 'Update technician profile',
          security: [{ cookieAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    bio: { type: 'string' },
                    skills: { type: 'array', items: { type: 'string' } },
                    experience: { type: 'integer' },
                    hourlyRate: { type: 'number' },
                    location: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Profile updated' } },
        },
      },
      '/api/technician/availability': {
        put: {
          tags: ['Technician'],
          summary: 'Update availability',
          security: [{ cookieAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    availability: {
                      type: 'object',
                      example: {
                        monday: ['09:00-12:00'],
                        tuesday: ['14:00-18:00'],
                      },
                    },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Availability updated' } },
        },
      },
      '/api/technician/bookings': {
        get: {
          tags: ['Technician'],
          summary: "Get technician's bookings",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: 'query',
              name: 'page',
              schema: { type: 'integer', default: 1 },
            },
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer', default: 10 },
            },
            {
              in: 'query',
              name: 'status',
              schema: {
                type: 'string',
                enum: [
                  'REQUESTED',
                  'ACCEPTED',
                  'PAID',
                  'IN_PROGRESS',
                  'COMPLETED',
                  'DECLINED',
                  'CANCELLED',
                ],
              },
            },
          ],
          responses: { 200: { description: "Technician's bookings" } },
        },
      },
      '/api/technician/bookings/{id}': {
        patch: {
          tags: ['Technician'],
          summary: 'Update booking status',
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: {
                      type: 'string',
                      enum: [
                        'ACCEPTED',
                        'DECLINED',
                        'IN_PROGRESS',
                        'COMPLETED',
                      ],
                    },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Booking updated' } },
        },
      },
      '/api/technician/services': {
        get: {
          tags: ['Technician'],
          summary: "Get technician's own services",
          security: [{ cookieAuth: [] }],
          responses: { 200: { description: "Technician's services" } },
        },
      },
      // BOOKINGS
      '/api/bookings': {
        post: {
          tags: ['Booking'],
          summary: 'Create booking (Customer)',
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: [
                    'serviceId',
                    'scheduledDate',
                    'timeSlot',
                    'contactNumber',
                  ],
                  properties: {
                    serviceId: { type: 'string' },
                    scheduledDate: { type: 'string', example: '2025-08-15' },
                    timeSlot: { type: 'string', example: '09:00-12:00' },
                    contactNumber: { type: 'string', example: '01711223344' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Booking created' } },
        },
        get: {
          tags: ['Booking'],
          summary: "Get user's bookings",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: 'query',
              name: 'page',
              schema: { type: 'integer', default: 1 },
            },
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer', default: 10 },
            },
          ],
          responses: { 200: { description: 'List of bookings' } },
        },
      },
      '/api/bookings/{id}': {
        get: {
          tags: ['Booking'],
          summary: 'Get booking by ID',
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: { 200: { description: 'Booking details' } },
        },
      },
      '/api/bookings/{id}/cancel': {
        patch: {
          tags: ['Booking'],
          summary: 'Cancel booking (Customer)',
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['reason'],
                  properties: {
                    reason: { type: 'string', example: 'Change of plans' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Booking cancelled' } },
        },
      },
      // PAYMENTS
      '/api/payments/create': {
        post: {
          tags: ['Payment'],
          summary: 'Create Stripe checkout session (Customer)',
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['bookingId'],
                  properties: { bookingId: { type: 'string' } },
                },
              },
            },
          },
          responses: {
            200: { description: 'Checkout session created, returns url' },
          },
        },
      },
      '/api/payments/confirm': {
        post: {
          tags: ['Payment'],
          summary: 'Confirm payment manually (Customer)',
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['sessionId'],
                  properties: { sessionId: { type: 'string' } },
                },
              },
            },
          },
          responses: { 200: { description: 'Payment confirmed' } },
        },
      },
      '/api/payments': {
        get: {
          tags: ['Payment'],
          summary: 'Get payment history',
          security: [{ cookieAuth: [] }],
          responses: { 200: { description: 'Payment history' } },
        },
      },
      '/api/payments/{id}': {
        get: {
          tags: ['Payment'],
          summary: 'Get payment by ID',
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: { 200: { description: 'Payment details' } },
        },
      },
      // REVIEWS
      '/api/reviews': {
        post: {
          tags: ['Review'],
          summary: 'Create review (Customer, booking must be COMPLETED)',
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['bookingId', 'rating'],
                  properties: {
                    bookingId: { type: 'string' },
                    rating: {
                      type: 'integer',
                      minimum: 1,
                      maximum: 5,
                      example: 5,
                    },
                    comment: { type: 'string', example: 'Excellent service!' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Review created' } },
        },
      },
      // ADMIN
      '/api/admin/users': {
        get: {
          tags: ['Admin'],
          summary: 'Get all users (Admin)',
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: 'query',
              name: 'page',
              schema: { type: 'integer', default: 1 },
            },
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer', default: 10 },
            },
          ],
          responses: { 200: { description: 'List of users' } },
        },
      },
      '/api/admin/users/{id}': {
        patch: {
          tags: ['Admin'],
          summary: 'Ban or unban user (Admin)',
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: { type: 'string', enum: ['ACTIVE', 'BANNED'] },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'User status updated' } },
        },
      },
      '/api/admin/bookings': {
        get: {
          tags: ['Admin'],
          summary: 'Get all bookings (Admin)',
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: 'query',
              name: 'page',
              schema: { type: 'integer', default: 1 },
            },
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer', default: 10 },
            },
          ],
          responses: { 200: { description: 'All bookings' } },
        },
      },
      '/api/admin/bookings/{id}': {
        get: {
          tags: ['Admin'],
          summary: 'Get booking by ID (Admin)',
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: { 200: { description: 'Booking details' } },
        },
      },
      '/api/admin/payments': {
        get: {
          tags: ['Admin'],
          summary: 'Get all payments (Admin)',
          security: [{ cookieAuth: [] }],
          responses: { 200: { description: 'All payments' } },
        },
      },
      '/api/admin/payments/{id}': {
        get: {
          tags: ['Admin'],
          summary: 'Get payment by ID (Admin)',
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: { 200: { description: 'Payment details' } },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
