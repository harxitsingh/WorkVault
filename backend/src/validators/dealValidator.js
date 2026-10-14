import { body } from 'express-validator';

export const createDealValidator = [
  body('serviceId')
    .notEmpty()
    .withMessage('Service ID is required'),
  body('freelancerId')
    .optional()
    .notEmpty()
    .withMessage('Freelancer ID must not be empty'),
  body('title')
    .optional()
    .trim(),
  body('amount')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Amount must be a positive number')
];

export const updateDealStatusValidator = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['CREATED', 'FUNDED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'RELEASED', 'CANCELLED', 'DISPUTED'])
    .withMessage('Invalid deal status')
];
