const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { validate, registerValidation, loginValidation } = require('../utils/validators');

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);

module.exports = router;
