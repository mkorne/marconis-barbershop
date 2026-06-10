const chatbotService = require('../services/chatbotService');
const logger = require('../config/logger');

/**
 * Handle chatbot conversation
 */
const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a string'
      });
    }

    const userMessage = message.trim();
    if (userMessage.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty'
      });
    }

    // Generate response using chatbot service
    const response = chatbotService.generateResponse(userMessage);

    logger.info(`Chatbot conversation - User: "${userMessage}" | Bot: "${response.substring(0, 50)}..."`);

    res.json({
      success: true,
      data: {
        userMessage: userMessage,
        botResponse: response,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Error in chatbot conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chatbot request',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

/**
 * Get chatbot service statistics
 */
const getStats = async (req, res) => {
  try {
    const stats = chatbotService.getStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Error getting chatbot stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chatbot statistics',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

/**
 * Get questions by category
 */
const getQuestionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    const questions = chatbotService.getQuestionsByCategory(category);

    res.json({
      success: true,
      data: {
        category,
        questions,
        count: questions.length
      }
    });

  } catch (error) {
    logger.error('Error getting questions by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get questions by category',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

/**
 * Get all available categories
 */
const getCategories = async (req, res) => {
  try {
    const categories = chatbotService.getCategories();

    res.json({
      success: true,
      data: {
        categories,
        count: categories.length
      }
    });

  } catch (error) {
    logger.error('Error getting chatbot categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chatbot categories',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

/**
 * Reload chatbot data (admin only)
 */
const reloadData = async (req, res) => {
  try {
    await chatbotService.reload();
    const stats = chatbotService.getStats();

    logger.info('Chatbot data reloaded by admin');

    res.json({
      success: true,
      message: 'Chatbot data reloaded successfully',
      data: stats
    });

  } catch (error) {
    logger.error('Error reloading chatbot data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reload chatbot data',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

/**
 * Get sample questions for testing
 */
const getSampleQuestions = async (req, res) => {
  try {
    const sampleQuestions = [
      "What's your pricing?",
      "Do you do kids cuts?",
      "Best haircut for round face?",
      "How to maintain a fade?",
      "Do you accept mobile money?",
      "What hair products do you use?",
      "How long does a haircut take?",
      "Do you do traditional Ghanaian styles?",
      "Can you fix a bad haircut?",
      "What time do you close?"
    ];

    res.json({
      success: true,
      data: {
        sampleQuestions,
        count: sampleQuestions.length
      }
    });

  } catch (error) {
    logger.error('Error getting sample questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sample questions'
    });
  }
};

module.exports = {
  chat,
  getStats,
  getQuestionsByCategory,
  getCategories,
  reloadData,
  getSampleQuestions
};
