const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Database errors
  if (err.code === '23505') { // Unique violation
    return res.status(409).json({
      success: false,
      error: 'Conflict',
      message: 'Resource already exists'
    });
  }

  if (err.code === '23503') { // Foreign key violation
    return res.status(400).json({
      success: false,
      error: 'Invalid reference',
      message: 'Referenced resource does not exist'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
};

module.exports = errorHandler;
