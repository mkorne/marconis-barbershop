const fs = require('fs').promises;
const path = require('path');
const logger = require('../config/logger');

class ChatbotService {
  constructor() {
    this.questionsData = null;
    this.isLoaded = false;
    this.dataPath = path.join(__dirname, '../data/ghana_barber_questions_2000.json');
    this.fallbackPath = path.join(__dirname, '../data/ghana_barber_questions_sample.json');
  }

  /**
   * Initialize the chatbot service by loading question data
   */
  async initialize() {
    try {
      await this.loadQuestionsData();
      logger.info(`Chatbot service initialized with ${this.questionsData?.questions?.length || 0} questions`);
    } catch (error) {
      logger.error('Failed to initialize chatbot service:', error);
      throw error;
    }
  }

  /**
   * Load questions data from JSON file
   */
  async loadQuestionsData() {
    try {
      // Try to load the main questions file first
      let dataPath = this.dataPath;
      
      // Check if main file exists, if not use fallback
      try {
        await fs.access(this.dataPath);
        logger.info('Loading main ghana_barber_questions_2000.json file');
      } catch {
        logger.warn('Main questions file not found, using sample data');
        dataPath = this.fallbackPath;
      }

      const jsonData = await fs.readFile(dataPath, 'utf8');
      this.questionsData = JSON.parse(jsonData);
      this.isLoaded = true;

      logger.info(`Loaded ${this.questionsData.questions.length} questions from ${path.basename(dataPath)}`);
      
    } catch (error) {
      logger.error('Error loading questions data:', error);
      // Use hardcoded fallback if all else fails
      this.questionsData = this.getHardcodedFallback();
      this.isLoaded = true;
    }
  }

  /**
   * Generate AI response based on user question
   */
  generateResponse(userQuestion) {
    if (!this.isLoaded || !this.questionsData) {
      return this.getDefaultResponse();
    }

    const normalizedQuestion = userQuestion.toLowerCase().trim();
    
    try {
      // Try to find exact or close matches first
      const directMatch = this.findDirectMatch(normalizedQuestion);
      if (directMatch) {
        return directMatch.response;
      }

      // Try keyword-based matching
      const keywordMatch = this.findKeywordMatch(normalizedQuestion);
      if (keywordMatch) {
        return keywordMatch.response;
      }

      // Try category-based matching
      const categoryMatch = this.findCategoryMatch(normalizedQuestion);
      if (categoryMatch) {
        return categoryMatch.response;
      }

      // Use fallback response
      return this.getFallbackResponse();

    } catch (error) {
      logger.error('Error generating chatbot response:', error);
      return this.getDefaultResponse();
    }
  }

  /**
   * Find direct question match or variation match
   */
  findDirectMatch(question) {
    for (const item of this.questionsData.questions) {
      // Check main question
      if (item.question.toLowerCase().includes(question) || 
          question.includes(item.question.toLowerCase())) {
        return item;
      }

      // Check variations
      if (item.variations) {
        for (const variation of item.variations) {
          if (variation.toLowerCase().includes(question) || 
              question.includes(variation.toLowerCase())) {
            return item;
          }
        }
      }
    }
    return null;
  }

  /**
   * Find matches based on keywords
   */
  findKeywordMatch(question) {
    let bestMatch = null;
    let maxMatches = 0;

    for (const item of this.questionsData.questions) {
      let matchCount = 0;
      
      if (item.keywords) {
        for (const keyword of item.keywords) {
          if (question.includes(keyword.toLowerCase())) {
            matchCount++;
          }
        }
      }

      if (matchCount > maxMatches) {
        maxMatches = matchCount;
        bestMatch = item;
      }
    }

    return maxMatches >= 2 ? bestMatch : null; // Require at least 2 keyword matches
  }

  /**
   * Find matches based on category keywords
   */
  findCategoryMatch(question) {
    if (!this.questionsData.categories_info) {
      return null;
    }

    let bestCategory = null;
    let maxMatches = 0;

    // Check which category has the most keyword matches
    for (const [categoryName, categoryInfo] of Object.entries(this.questionsData.categories_info)) {
      let matchCount = 0;
      
      if (categoryInfo.common_keywords) {
        for (const keyword of categoryInfo.common_keywords) {
          if (question.includes(keyword.toLowerCase())) {
            matchCount++;
          }
        }
      }

      if (matchCount > maxMatches) {
        maxMatches = matchCount;
        bestCategory = categoryName;
      }
    }

    if (bestCategory && maxMatches > 0) {
      // Find a random question from the best matching category
      const categoryQuestions = this.questionsData.questions.filter(
        q => q.category === bestCategory
      );
      
      if (categoryQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * categoryQuestions.length);
        return categoryQuestions[randomIndex];
      }
    }

    return null;
  }

  /**
   * Get a random fallback response
   */
  getFallbackResponse() {
    if (this.questionsData?.fallback_responses?.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.questionsData.fallback_responses.length);
      return this.questionsData.fallback_responses[randomIndex];
    }
    
    return this.getDefaultResponse();
  }

  /**
   * Get default response when nothing else works
   */
  getDefaultResponse() {
    return "Thanks for your question! At Marconi's, we pride ourselves on traditional barbering techniques combined with modern styles. Our shop has been serving the community since 2010 with quality cuts and a welcoming atmosphere. Is there anything specific you'd like to know about our services or haircare?";
  }

  /**
   * Get hardcoded fallback data when file loading fails
   */
  getHardcodedFallback() {
    return {
      metadata: {
        version: "1.0",
        description: "Hardcoded fallback questions",
        total_questions: 5
      },
      questions: [
        {
          id: 1,
          category: "pricing",
          question: "What are your prices?",
          keywords: ["price", "cost", "how much"],
          response: "Our pricing is: Classic Haircut ₵50, Beard Trim ₵30, Haircut + Beard ₵70, Hot Towel Shave ₵40, Kids Cut ₵35. We accept cash and Mobile Money.",
          variations: ["How much", "Cost", "Price"]
        },
        {
          id: 2,
          category: "services",
          question: "What services do you offer?",
          keywords: ["services", "offer", "haircut", "beard"],
          response: "We offer: Classic Haircuts, Beard Trims, Hot Towel Shaves, Kids Cuts, Hair Treatments, and Facial Massage. All services include complimentary neck shave.",
          variations: ["Services", "What do you do", "Offerings"]
        }
      ],
      fallback_responses: [
        "Thanks for your question! We're here to help with all your barbering needs.",
        "Great question! Our experienced barbers can assist you with that."
      ]
    };
  }

  /**
   * Reload questions data (useful for updates)
   */
  async reload() {
    logger.info('Reloading chatbot questions data...');
    await this.loadQuestionsData();
  }

  /**
   * Get service statistics
   */
  getStats() {
    if (!this.isLoaded || !this.questionsData) {
      return { loaded: false, questions: 0, categories: 0 };
    }

    return {
      loaded: this.isLoaded,
      questions: this.questionsData.questions?.length || 0,
      categories: this.questionsData.metadata?.categories?.length || 0,
      version: this.questionsData.metadata?.version || '1.0'
    };
  }

  /**
   * Search for questions by category
   */
  getQuestionsByCategory(category) {
    if (!this.isLoaded || !this.questionsData) {
      return [];
    }

    return this.questionsData.questions.filter(q => 
      q.category?.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Get all available categories
   */
  getCategories() {
    if (!this.isLoaded || !this.questionsData) {
      return [];
    }

    return this.questionsData.metadata?.categories || [];
  }
}

// Create singleton instance
const chatbotService = new ChatbotService();

module.exports = chatbotService;
