const { ZodError } = require('zod');
const AppError = require('../utils/AppError');

const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Update request with parsed/coerced values
    req.body = parsed.body ?? req.body;
    req.query = parsed.query ?? req.query;
    req.params = parsed.params ?? req.params;

    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const issues = err.errors || err.issues || [];
      const message = issues.length > 0 
        ? issues.map((e) => e.message).join(', ')
        : err.message || 'Validation failed';
      return next(new AppError(message, 400));
    }

    // Technical bug in the validator or schema itself
    // Let the global error handler deal with the internal failure
    next(err);
  }
};

module.exports = validate;
