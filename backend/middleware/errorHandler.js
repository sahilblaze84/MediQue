/**
 * Global error handling middleware
 */

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle specific error types
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(409).json({ 
      error: 'Duplicate entry',
      message: 'A record with this information already exists'
    });
  }
  
  if (err.code === 'SQLITE_ERROR') {
    return res.status(500).json({ 
      error: 'Database error',
      message: 'An error occurred while accessing the database'
    });
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation error',
      message: err.message
    });
  }
  
  // Handle JWT errors (when authentication is added)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      error: 'Invalid token',
      message: 'Authentication failed'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      error: 'Token expired',
      message: 'Authentication token has expired'
    });
  }
  
  // Default error response
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * 404 handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
};

/**
 * Async handler wrapper to catch errors in async routes
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
