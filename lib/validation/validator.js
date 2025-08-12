// lib/validation/validator.js

export function validate(schema) {
  return (handler) => async (req, res) => {
    // Only validate for methods that typically have a request body
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      try {
        // Validate the request body against the provided schema
        await schema.validateAsync(req.body, { abortEarly: false });
      } catch (error) {
        // If validation fails, return a 400 Bad Request with validation details
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details.map(d => ({ message: d.message, path: d.path })),
        });
      }
    }
    // If validation passes or is not applicable, proceed to the handler
    return handler(req, res);
  };
}
