const { body, validationResult } = require('express-validator');

// Reusable validation result handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    return res.status(400).json({
      success: false,
      message: errorMessages.join(', '),
      errors: errors.array()
    });
  }
  next();
};

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').trim().isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  body('role')
    .optional()
    .isIn(['PATIENT', 'DOCTOR'])
    .withMessage('Role must be either PATIENT or DOCTOR. Admin self-registration is disabled.'),
  validate
];

const validateLogin = [
  body('email').trim().isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
  validate
];

const validateAppointmentBooking = [
  body('doctorId').notEmpty().withMessage('Doctor ID is required.'),
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be in YYYY-MM-DD format.'),
  body('timeSlot').notEmpty().withMessage('Time slot is required.'),
  validate
];

module.exports = {
  validateRegister,
  validateLogin,
  validateAppointmentBooking
};
