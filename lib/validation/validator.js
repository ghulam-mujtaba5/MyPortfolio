// lib/validation/validator.js

export function validate(schema) {
  return (handler) => async (req, res) => {
    const methodHasBody =
      req.method === "POST" || req.method === "PUT" || req.method === "PATCH";

    if (methodHasBody && schema) {
      try {
        // Prefer Zod: schema.safeParse exists
        if (typeof schema.safeParse === "function") {
          const result = schema.safeParse(req.body);
          if (!result.success) {
            return res.status(400).json({
              success: false,
              message: "Validation failed",
              errors: result.error.errors.map((e) => ({
                message: e.message,
                path: e.path,
              })),
            });
          }
          // Replace body with parsed data for downstream handlers
          req.body = result.data;
        } else if (typeof schema.validateAsync === "function") {
          // Fallback: Joi-style schemas
          await schema.validateAsync(req.body, { abortEarly: false });
        }
      } catch (error) {
        // Normalize Joi error shape; for non-Joi unexpected errors, provide minimal info
        const errors = Array.isArray(error?.details)
          ? error.details.map((d) => ({ message: d.message, path: d.path }))
          : [{ message: error.message || "Validation error" }];
        return res.status(400).json({ success: false, message: "Validation failed", errors });
      }
    }

    return handler(req, res);
  };
}
