import { Router } from 'express'
import { body, param, query } from 'express-validator'
import * as Controller from './customer.controller'
import { validate } from '@/middleware/validate'
import { isAuthenticated } from '@/middleware/auth'

const router = Router()

// Get all customers
router.get('/', isAuthenticated, Controller.getAllCustomers)

// Get customer by ID
router.get(
    '/:id',
    isAuthenticated,
    param('id').isUUID().withMessage('Invalid customer ID'),
    validate,
    Controller.getCustomer
)

// Get customer details
router.get(
    '/:id/details',
    isAuthenticated,
    param('id').isUUID().withMessage('Invalid customer ID'),
    validate,
    Controller.getCustomerDetails
)

// Get customer stats
router.get('/stats', isAuthenticated, Controller.getCustomerStats)

// Create new customer
router.post(
    '/',
    isAuthenticated,
    body('name').notEmpty().withMessage('Customer name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('company').optional().isString(),
    body('phone').optional().isString(),
    body('website').optional().isURL().withMessage('Website must be a valid URL'),
    body('industry').optional().isString(),
    body('companySize').optional().isString(),
    body('subscriptionPlan').optional().isIn(['basic', 'professional', 'enterprise']),
    body('status').optional().isIn(['active', 'inactive', 'pending']),
    body('monthlyRevenue').optional().isFloat({ min: 0 }),
    body('projectsCount').optional().isInt({ min: 0 }),
    validate,
    Controller.createCustomer
)

// Update customer
router.put(
    '/:id',
    isAuthenticated,
    param('id').isUUID().withMessage('Invalid customer ID'),
    body('name').optional().notEmpty().withMessage('Customer name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('company').optional().isString(),
    body('phone').optional().isString(),
    body('website').optional().isURL().withMessage('Website must be a valid URL'),
    body('industry').optional().isString(),
    body('companySize').optional().isString(),
    body('subscriptionPlan').optional().isIn(['basic', 'professional', 'enterprise']),
    body('status').optional().isIn(['active', 'inactive', 'pending']),
    body('monthlyRevenue').optional().isFloat({ min: 0 }),
    body('projectsCount').optional().isInt({ min: 0 }),
    validate,
    Controller.updateCustomer
)

// Delete customer
router.delete(
    '/:id',
    isAuthenticated,
    param('id').isUUID().withMessage('Invalid customer ID'),
    validate,
    Controller.deleteCustomer
)

export default router