const router = require('express').Router();
console.log('--- Auth Routes Initializing (Switch-Role active) ---');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  registerFarmer,
  loginFarmer,
  forgotPassword,
  resetPassword,
  loginExpert,
  registerExpert,
  loginShop,
  registerShop,
  switchRole,
  getMe,
} = require('../controllers/authController');

// Role switching - Moved to top for priority
router.post('/switch-role', protect, switchRole);

// Farmer auth
router.post(
  '/farmer/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  registerFarmer
);

router.post(
  '/farmer/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  loginFarmer
);

router.post(
  '/farmer/forgot-password',
  [body('email').isEmail().withMessage('Valid email is required')],
  validate,
  forgotPassword
);

router.put(
  '/reset-password/:resetToken',
  [body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')],
  validate,
  resetPassword
);

// Expert auth
router.post(
  '/expert/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('specialty').notEmpty().withMessage('Specialty is required'),
  ],
  validate,
  registerExpert
);

router.post(
  '/expert/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  loginExpert
);

// Shop auth
router.post(
  '/shop/register',
  [
    body('name').notEmpty().withMessage('Shop name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  registerShop
);

router.post(
  '/shop/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  loginShop
);

// Get current user (all roles)
router.get('/me', protect, getMe);

module.exports = router;
