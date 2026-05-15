const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      success: false,
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message,
      },
    };
    return res.status(404).json(error);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error = {
      success: false,
      error: {
        code: 'DUPLICATE_FIELD',
        message,
      },
    };
    return res.status(400).json(error);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    error = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message,
      },
    };
    return res.status(400).json(error);
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      code: error.code || 'SERVER_ERROR',
      message: error.message || 'Server Error',
    },
  });
};

module.exports = errorHandler;
