import { body } from 'express-validator';

export const createTransactionValidator = [
  body('dealId')
    .notEmpty()
    .withMessage('Deal ID is required'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 1 })
    .withMessage('Amount must be a positive number')
];
