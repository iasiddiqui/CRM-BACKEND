const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {
  createPublicEnquiry,
  getUnclaimedEnquiries,
  claimEnquiry,
  getMyEnquiries
} = require('../controllers/enquiryController');
const { validate, enquiryValidation } = require('../utils/validators');

// Public endpoint - no authentication required
router.post('/public', enquiryValidation, validate, createPublicEnquiry);

// Protected endpoints - authentication required
router.get('/unclaimed', authenticate, getUnclaimedEnquiries);
router.post('/:id/claim', authenticate, claimEnquiry);
router.get('/mine', authenticate, getMyEnquiries);

module.exports = router;
