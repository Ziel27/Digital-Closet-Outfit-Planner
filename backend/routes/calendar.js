import express from "express";
import { authenticate } from "../middleware/auth.js";
import { body, param, query, validationResult } from "express-validator";
import mongoose from "mongoose";
import * as calendarController from "../controllers/calendarController.js";

const router = express.Router();

// Validation middleware for creating calendar events
const validateCalendarEvent = [
  body("outfitId")
    .notEmpty()
    .withMessage("Outfit ID is required")
    .isMongoId()
    .withMessage("Outfit ID must be a valid MongoDB ObjectId"),
  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be a valid ISO 8601 date")
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      // Allow dates from today onwards (can schedule for today or future)
      if (date < now) {
        throw new Error("Date cannot be in the past");
      }

      // Limit to 1 year in the future
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      if (date > maxDate) {
        throw new Error("Date cannot be more than 1 year in the future");
      }

      return true;
    }),
  body("occasion")
    .optional()
    .isIn(["casual", "formal", "sporty", "party", "work", "other"])
    .withMessage(
      "Occasion must be one of: casual, formal, sporty, party, work, other"
    ),
  body("location")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Location must be between 1 and 100 characters"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes must not exceed 500 characters"),
];

// Validation middleware for updating calendar events
const validateCalendarEventUpdate = [
  body("outfitId")
    .optional()
    .isMongoId()
    .withMessage("Outfit ID must be a valid MongoDB ObjectId"),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be a valid ISO 8601 date")
    .custom((value) => {
      if (!value) return true;
      const date = new Date(value);
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      // Allow dates from today onwards
      if (date < now) {
        throw new Error("Date cannot be in the past");
      }

      // Limit to 1 year in the future
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      if (date > maxDate) {
        throw new Error("Date cannot be more than 1 year in the future");
      }

      return true;
    }),
  body("occasion")
    .optional()
    .isIn(["casual", "formal", "sporty", "party", "work", "other"])
    .withMessage(
      "Occasion must be one of: casual, formal, sporty, party, work, other"
    ),
  body("location")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Location must be between 1 and 100 characters"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes must not exceed 500 characters"),
];

// Validation for query parameters
const validateDateQuery = [
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date")
    .custom((value, { req }) => {
      if (value && req.query.startDate) {
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(value);
        if (endDate < startDate) {
          throw new Error("End date must be after start date");
        }
      }
      return true;
    }),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

// Validation for date parameter
const validateDateParam = [
  param("date").isISO8601().withMessage("Date must be a valid ISO 8601 date"),
];

// Validation for ID parameter
const validateIdParam = [
  param("id")
    .isMongoId()
    .withMessage("Calendar event ID must be a valid MongoDB ObjectId"),
];

// Validation for style suggestions
const validateStyleSuggestions = [
  body("location")
    .notEmpty()
    .withMessage("Location is required")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Location must be between 1 and 100 characters"),
  body("occasion")
    .optional()
    .isIn(["casual", "formal", "sporty", "party", "work", "other"])
    .withMessage(
      "Occasion must be one of: casual, formal, sporty, party, work, other"
    ),
  body("outfitId")
    .optional()
    .isMongoId()
    .withMessage("Outfit ID must be a valid MongoDB ObjectId"),
];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// Routes
router.get(
  "/",
  authenticate,
  validateDateQuery,
  handleValidation,
  calendarController.getCalendarEvents
);
router.get(
  "/date/:date",
  authenticate,
  validateDateParam,
  handleValidation,
  calendarController.getCalendarEventByDate
);
router.get(
  "/:id",
  authenticate,
  validateIdParam,
  handleValidation,
  calendarController.getCalendarEventById
);
router.post(
  "/",
  authenticate,
  validateCalendarEvent,
  handleValidation,
  calendarController.createCalendarEvent
);
router.put(
  "/:id",
  authenticate,
  validateIdParam,
  validateCalendarEventUpdate,
  handleValidation,
  calendarController.updateCalendarEvent
);
router.delete(
  "/:id",
  authenticate,
  validateIdParam,
  handleValidation,
  calendarController.deleteCalendarEvent
);
router.post(
  "/suggestions",
  authenticate,
  validateStyleSuggestions,
  handleValidation,
  calendarController.getStyleSuggestions
);

export default router;
