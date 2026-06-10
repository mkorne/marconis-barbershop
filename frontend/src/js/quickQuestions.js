/**
 * Dynamic Quick Questions Manager
 * Handles shuffling and displaying random questions for the chatbot interface
 */

class QuickQuestionsManager {
    constructor(containerId, chatInputId, shuffleInterval = 15000) {
        this.container = document.getElementById(containerId);
        this.chatInput = document.getElementById(chatInputId);
        this.shuffleInterval = shuffleInterval;
        this.currentQuestions = [];
        this.allQuestions = [
            // Pricing & Services
            "What's your pricing?",
            "Do you offer combo packages?",
            "What payment methods do you accept?",
            "How much for a kids cut?",
            "Student discount cut price?",
            "Teachers cut",
            "Students cut",
            "Teacher's cut price?",
            "Do you do loyalty discounts?",
            "Any weekend specials?",
            
            // Haircut Types & Styles
            "Best haircut for round face?",
            "Best haircut for oval face?",
            "Best haircut for square face?",
            "Best haircut for blacks?",
            "What's a good professional haircut?",
            "Trending haircut styles 2024?",
            "Classic vs modern cuts?",
            "Low maintenance haircuts?",
            
            // Specific Services
            "Do you do kids cuts?",
            "Do you do beard trims?",
            "Hot towel shave available?",
            "Do you do hair coloring?",
            "Eyebrow trimming service?",
            "Scalp treatment options?",
            "Hair relaxing service?",
            "Do you do cornrows?",
            "Dreadlock maintenance?",
            
            // Maintenance & Care
            "How to maintain a fade?",
            "How often should I cut my hair?",
            "How to care for natural hair?",
            "Best hair products to use?",
            "How to prevent dandruff?",
            "Hair washing frequency?",
            "How to style my hair daily?",
            "Tips for healthy hair?",
            
            // Business & Booking
            "What are your opening hours?",
            "Do I need an appointment?",
            "Can I book online?",
            "Where are you located?",
            "Do you do home service?",
            "How long does a haircut take?",
            "Can I walk in?",
            "What's your busiest time?",
            
            // Face Shape & Style Advice
            "Haircut for receding hairline?",
            "Best cut for thick hair?",
            "Best cut for thin hair?",
            "Haircut for curly hair?",
            "Professional business cut?",
            "Casual weekend style?",
            "Age-appropriate cuts?",
            "Trendy Ghana cuts?",
            
            // Special Occasions
            "Wedding haircut style?",
            "Job interview haircut?",
            "Party/event styling?",
            "First date haircut?",
            "Graduation haircut?",
            "Special occasion packages?",
            
            // Hair Problems & Solutions
            "How to fix bad haircut?",
            "Hair thinning solutions?",
            "Cowlick management?",
            "Uneven hair growth?",
            "Hair breakage prevention?",
            "Dry scalp treatment?",
            "Oily hair management?",
            "Gray hair coverage?",
            
            // Barber Experience
            "How experienced are your barbers?",
            "Do you specialize in African hair?",
            "Traditional vs modern techniques?",
            "Barber recommendations?",
            "Can I request a specific barber?",
            "What tools do you use?",
            
            // Seasonal & Trending
            "Summer haircut styles?",
            "Rainy season hair care?",
            "Back to school cuts?",
            "Holiday special styles?",
            "New year new look?",
            "Trending celebrity cuts?",
            
            // Aftercare & Products
            "What products do you recommend?",
            "Hair oil recommendations?",
            "Best shampoo for my hair type?",
            "How to style at home?",
            "Beard care products?",
            "Hair growth products?",
            
            // Location & Cultural
            "Best Ghanaian haircut styles?",
            "Traditional African cuts?",
            "Modern African styles?",
            "Accra barbershop quality?",
            "Local hair trends?",
            "Cultural haircut significance?"
        ];
        
        this.questionsPerDisplay = 8; // How many questions to show at once
        this.init();
    }

    init() {
        if (!this.container || !this.chatInput) {
            console.error('QuickQuestionsManager: Required elements not found');
            return;
        }

        // Immediately show first set of questions without delay
        this.currentQuestions = this.getRandomQuestions();
        this.renderQuestionsImmediate(this.currentQuestions);
        
        this.startAutoShuffle();
        this.setupEventListeners();
    }

    /**
     * Fisher-Yates shuffle algorithm
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Get random questions for display
     */
    getRandomQuestions() {
        const shuffled = this.shuffleArray(this.allQuestions);
        return shuffled.slice(0, this.questionsPerDisplay);
    }

    /**
     * Render questions to the container (immediate - no delays)
     */
    renderQuestionsImmediate(questions) {
        // Clear existing questions and loading state
        this.container.innerHTML = '';
        
        // Add CSS classes for responsive grid
        this.container.className = 'mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 opacity-100';
        
        questions.forEach(question => {
            const button = document.createElement('button');
            button.className = 'quick-question bg-gray-200 hover:bg-gray-300 p-2 rounded text-sm transition-colors duration-200 hover:shadow-md';
            button.textContent = question;
            button.setAttribute('data-question', question);
            
            // Add click animation
            button.addEventListener('mousedown', () => {
                button.classList.add('scale-95', 'bg-gray-400');
            });
            
            button.addEventListener('mouseup', () => {
                button.classList.remove('scale-95', 'bg-gray-400');
            });
            
            this.container.appendChild(button);
        });
    }

    /**
     * Render questions to the container (with animation for shuffles)
     */
    renderQuestions(questions) {
        // Clear existing questions
        this.container.innerHTML = '';
        
        // Add CSS classes for responsive grid
        this.container.className = 'mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2';
        
        questions.forEach(question => {
            const button = document.createElement('button');
            button.className = 'quick-question bg-gray-200 hover:bg-gray-300 p-2 rounded text-sm transition-colors duration-200 hover:shadow-md';
            button.textContent = question;
            button.setAttribute('data-question', question);
            
            // Add click animation
            button.addEventListener('mousedown', () => {
                button.classList.add('scale-95', 'bg-gray-400');
            });
            
            button.addEventListener('mouseup', () => {
                button.classList.remove('scale-95', 'bg-gray-400');
            });
            
            this.container.appendChild(button);
        });

        // Add smooth fade-in animation
        this.container.classList.add('opacity-0');
        setTimeout(() => {
            this.container.classList.remove('opacity-0');
            this.container.classList.add('opacity-100', 'transition-opacity', 'duration-500');
        }, 50);
    }

    /**
     * Shuffle and display new questions
     */
    shuffleAndDisplay() {
        const fadeOut = () => {
            this.container.classList.add('opacity-50', 'transition-opacity', 'duration-300');
            
            setTimeout(() => {
                this.currentQuestions = this.getRandomQuestions();
                this.renderQuestions(this.currentQuestions);
                
                // Fade back in
                setTimeout(() => {
                    this.container.classList.remove('opacity-50');
                    this.container.classList.add('opacity-100');
                }, 100);
            }, 300);
        };

        fadeOut();
    }

    /**
     * Start automatic shuffling
     */
    startAutoShuffle() {
        setInterval(() => {
            this.shuffleAndDisplay();
        }, this.shuffleInterval);
    }

    /**
     * Setup event listeners for question buttons
     */
    setupEventListeners() {
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-question')) {
                const question = e.target.getAttribute('data-question');
                this.selectQuestion(question);
                
                // Add visual feedback
                e.target.classList.add('bg-yellow-200', 'scale-95');
                setTimeout(() => {
                    e.target.classList.remove('bg-yellow-200', 'scale-95');
                }, 200);
            }
        });
    }

    /**
     * Handle question selection
     */
    selectQuestion(question) {
        if (this.chatInput) {
            this.chatInput.value = question;
            this.chatInput.focus();
            
            // Add a gentle shake animation to draw attention to the input
            this.chatInput.classList.add('ring-2', 'ring-yellow-400');
            setTimeout(() => {
                this.chatInput.classList.remove('ring-2', 'ring-yellow-400');
            }, 1000);

            // Trigger input event for any listeners
            this.chatInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    /**
     * Add new questions to the pool
     */
    addQuestions(newQuestions) {
        if (Array.isArray(newQuestions)) {
            this.allQuestions.push(...newQuestions);
            console.log(`Added ${newQuestions.length} new questions to the pool`);
        }
    }

    /**
     * Remove questions from the pool
     */
    removeQuestions(questionsToRemove) {
        if (Array.isArray(questionsToRemove)) {
            questionsToRemove.forEach(question => {
                const index = this.allQuestions.indexOf(question);
                if (index > -1) {
                    this.allQuestions.splice(index, 1);
                }
            });
            console.log(`Removed ${questionsToRemove.length} questions from the pool`);
        }
    }

    /**
     * Update shuffle interval
     */
    setShuffleInterval(newInterval) {
        this.shuffleInterval = newInterval;
        console.log(`Shuffle interval updated to ${newInterval}ms`);
    }

    /**
     * Manually trigger shuffle
     */
    manualShuffle() {
        this.shuffleAndDisplay();
    }

    /**
     * Get current stats
     */
    getStats() {
        return {
            totalQuestions: this.allQuestions.length,
            currentQuestions: this.currentQuestions.length,
            questionsPerDisplay: this.questionsPerDisplay,
            shuffleInterval: this.shuffleInterval
        };
    }

    /**
     * Pause auto-shuffle
     */
    pause() {
        if (this.shuffleTimer) {
            clearInterval(this.shuffleTimer);
            this.shuffleTimer = null;
        }
    }

    /**
     * Resume auto-shuffle
     */
    resume() {
        if (!this.shuffleTimer) {
            this.startAutoShuffle();
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuickQuestionsManager;
}

// Global initialization when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Quick Questions Manager for chatbot
    window.quickQuestionsManager = new QuickQuestionsManager(
        'quick-questions-container',
        'chatbot-input',
        15000 // Shuffle every 15 seconds
    );
    
    console.log('Quick Questions Manager initialized with', window.quickQuestionsManager.getStats());
});
