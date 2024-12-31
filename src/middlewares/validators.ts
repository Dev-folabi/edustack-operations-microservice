import { NextFunction, Request, Response } from "express";
import { body, param, validationResult } from "express-validator";

// Middleware to handle validation errors
const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: errors.array()[0].msg || "Invalid data sent",
      errors: errors.array(),
    });
    return;
  }
  next();
};

// Validator for creating a class
export const validateCreateClass = [
  body("label")
    .notEmpty()
    .withMessage("Label is required")
    .isString()
    .withMessage("Label must be a string"),
  body("section")
    .optional()
    .isArray()
    .withMessage("Section must be an array")
    .custom((value: unknown[]) => {
      if (!value.every((item) => typeof item === "string")) {
        throw new Error("Each section must be a string");
      }
      return true;
    }),
  body("school_id")
    .notEmpty()
    .withMessage("School IDs are required")
    .isArray()
    .withMessage("School IDs must be an array")
    .custom((value: unknown[]) => {
      if (!value.every((item) => typeof item === "string")) {
        throw new Error("Each school ID must be a string");
      }
      return true;
    }),
  handleValidationErrors,
];

// Validator for updating a class
export const validateUpdateClass = [
  param("id")
    .notEmpty()
    .withMessage("Class ID is required")
    .isString()
    .withMessage("Class ID must be a string"),
  body("label").optional().isString().withMessage("Label must be a string"),
  body("section")
    .optional()
    .isArray()
    .withMessage("Section must be an array")
    .custom((value: unknown[]) => {
      if (!value.every((item) => typeof item === "string")) {
        throw new Error("Each section must be a string");
      }
      return true;
    }),
  body("school_id")
    .optional()
    .isArray()
    .withMessage("School IDs must be an array")
    .custom((value: unknown[]) => {
      if (!value.every((item) => typeof item === "string")) {
        throw new Error("Each school ID must be a string");
      }
      return true;
    }),
  handleValidationErrors,
];
