const Enquiry = require('../models/Enquiry');

const createPublicEnquiry = async (req, res, next) => {
  try {
    const { name, email, courseInterest, message } = req.body;

    const enquiry = await Enquiry.create({
      name,
      email,
      courseInterest,
      message: message || null
    });

    res.status(201).json({
      success: true,
      data: {
        enquiry: {
          id: enquiry.id,
          name: enquiry.name,
          email: enquiry.email,
          courseInterest: enquiry.course_interest,
          message: enquiry.message,
          isPublic: enquiry.is_public,
          createdAt: enquiry.created_at,
          updatedAt: enquiry.updated_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getUnclaimedEnquiries = async (req, res, next) => {
  try {
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 50);
    const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);

    const enquiries = await Enquiry.findUnclaimed(limit, offset);
    const total = await Enquiry.countUnclaimed();

    res.json({
      success: true,
      data: {
        enquiries: enquiries.map(e => ({
          id: e.id,
          name: e.name,
          email: e.email,
          courseInterest: e.course_interest,
          message: e.message,
          isPublic: e.is_public,
          claimedBy: e.claimed_by,
          createdAt: e.created_at,
          updatedAt: e.updated_at
        })),
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const claimEnquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate that id is a valid number
    const enquiryId = parseInt(id, 10);
    if (isNaN(enquiryId) || enquiryId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: 'Enquiry ID must be a positive number'
      });
    }

    const result = await Enquiry.claimById(enquiryId, userId);

    if (!result.success) {
      if (result.error === 'NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Enquiry not found'
        });
      }
      if (result.error === 'ALREADY_CLAIMED') {
        return res.status(409).json({
          success: false,
          error: 'Conflict',
          message: 'This enquiry has already been claimed'
        });
      }
    }

    const enquiry = result.enquiry;
    res.json({
      success: true,
      data: {
        enquiry: {
          id: enquiry.id,
          name: enquiry.name,
          email: enquiry.email,
          courseInterest: enquiry.course_interest,
          message: enquiry.message,
          isPublic: enquiry.is_public,
          claimedBy: enquiry.claimed_by,
          createdAt: enquiry.created_at,
          updatedAt: enquiry.updated_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMyEnquiries = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 50);
    const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);

    const enquiries = await Enquiry.findByClaimedBy(userId, limit, offset);
    const total = await Enquiry.countByClaimedBy(userId);

    res.json({
      success: true,
      data: {
        enquiries: enquiries.map(e => ({
          id: e.id,
          name: e.name,
          email: e.email,
          courseInterest: e.course_interest,
          message: e.message,
          isPublic: e.is_public,
          claimedBy: e.claimed_by,
          createdAt: e.created_at,
          updatedAt: e.updated_at
        })),
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPublicEnquiry,
  getUnclaimedEnquiries,
  claimEnquiry,
  getMyEnquiries
};
