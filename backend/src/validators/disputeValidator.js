import { body } from 'express-validator';

export const createDisputeValidator = [
  body('dealId')
    .notEmpty()
    .withMessage('Deal ID is required'),
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Reason is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
];

export const updateDisputeStatusValidator = [
  body('status')
    .optional()
    .isIn(['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'])
    .withMessage('Invalid dispute status'),
  body('resolution')
    .optional()
    .trim()
];
