export const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.status) {
    return res.status(err.status).json({
      success: false,
      errors: err.errors || [err.message]
    });
  }

  res.status(500).json({
    success: false,
    errors: ["Internal server error"]
  });
}

