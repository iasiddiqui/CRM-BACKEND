const { validationResult } = require('express-validator');
const validator = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: 'Invalid input data',
      details: errors.array()
    });
  }
  next();
};

const registerValidation = [
  validator.body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  validator.body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  validator.body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const loginValidation = [
  validator.body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  validator.body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const enquiryValidation = [
  validator.body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  validator.body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  validator.body('courseInterest')
    .trim()
    .notEmpty()
    .withMessage('Course interest is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Course interest must be between 1 and 255 characters'),
  validator.body('message')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Message must not exceed 1000 characters'),
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  enquiryValidation
};
