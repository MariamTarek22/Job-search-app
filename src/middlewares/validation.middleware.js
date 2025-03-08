import Joi from "joi";
import { isValidId } from "./auth.middleware.js";

export const generalValidations = {
  attachment: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().required(),
    destination: Joi.string().required(),
    filename: Joi.string().required(),
    path: Joi.string().required(),
    size: Joi.number().required(),
  }),
  objectId: Joi.custom(isValidId),
};

export const isValid = (schema) => {
  return (req, res, next) => {
    // Combine request body, params, and query into a single data object
    const data = { ...req.body, ...req.params, ...req.query };
    // to handle req file uploads in form data that is not in req.body but in req.file or request.files
    if (req.file || req.files) data.attachment = req.file || req.files;
    // Validate the data using the schema
    const { error } = schema.validate(data, { abortEarly: false });

    if (error) {
      // Map validation errors into an array of messages
      const errorMessages = error.details.map((detail) => detail.message);

      // Pass the error to the global error handler with a 400 status code
      return next(new Error(errorMessages.join(", "), { cause: 400 }));
    }

    // If validation passes, move to the next middleware
    next();
  };
};
