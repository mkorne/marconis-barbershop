const express = require('express');
const { body, param, validationResult } = require('express-validator');
const chatbotController = require('../controllers/chatbotController');
const { authenticateAdmin } = require('../middleware/adminAuth');

const router = express.Router();

/**
 * POST /api/chatbot/chat
 * Send a message to the chatbot and get a response
 * Body:
 * - message: string (required) - The user's message
 */
router.post('/chat',
  [
    body('message')
      .notEmpty()
      .withMessage('Message is required')
      .isString()
      .withMessage('Message must be a string')
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('Message must be between 1 and 500 characters')
  ],
  chatbotController.chat
);

/**
 * GET /api/chatbot/stats
 * Get chatbot service statistics
 */
router.get('/stats', chatbotController.getStats);

/**
 * GET /api/chatbot/categories
 * Get all available question categories
 */
router.get('/categories', chatbotController.getCategories);

/**
 * GET /api/chatbot/category/:category
 * Get questions by specific category
 * Params:
 * - category: string - The category name
 */
router.get('/category/:category',
  [
    param('category')
      .notEmpty()
      .withMessage('Category is required')
      .isString()
      .withMessage('Category must be a string')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Category must be between 1 and 50 characters')
  ],
  chatbotController.getQuestionsByCategory
);

/**
 * GET /api/chatbot/sample-questions
 * Get sample questions for testing the chatbot
 */
router.get('/sample-questions', chatbotController.getSampleQuestions);

/**
 * POST /api/chatbot/reload
 * Reload chatbot data from JSON file (admin only)
 * Note: In production, this should be protected with admin authentication
 */
router.post('/reload',
  authenticateAdmin,
  chatbotController.reloadData
);

// Validation error handling middleware
router.use((req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
});

module.exports = router;
