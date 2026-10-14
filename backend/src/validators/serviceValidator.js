import { body } from 'express-validator';

export const createServiceValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5 })
    .withMessage('Title must be at least 5 characters long'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 1 })
    .withMessage('Price must be a positive number'),
  body('deliveryTime')
    .optional(),
  body('deliveryDays')
    .optional()
    .isNumeric()
    .withMessage('Delivery days must be a number')
];

export const updateServiceValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage('Title must be at least 5 characters long'),
  body('description')
    .optional()
    .trim(),
  body('category')
    .optional()
    .trim(),
  body('price')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Price must be a positive number'),
  body('deliveryTime')
    .optional(),
  body('deliveryDays')
    .optional()
    .isNumeric()
    .withMessage('Delivery days must be a number')
];
