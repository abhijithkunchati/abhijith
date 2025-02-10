class CategoryQuiz {
    constructor() {
        this.sequences = [];
        this.currentQuestion = null;
        this.score = 0;
        this.totalAttempts = 0;
        
        // DOM elements
        this.questionText = document.getElementById('questionText');
        this.scoreElement = document.getElementById('score');
        this.totalAttemptsElement = document.getElementById('totalAttempts');
        this.categoryGrid = document.getElementById('categoryGrid');
        
        // Load data and initialize the game
        this.loadDataFile();
    }
    
    parseLine(line) {
        line = line.trim();
        if (!line) return null;
        
        // Find all quoted questions
        const questions = line.match(/"([^"]*)"/g)?.map(q => q.slice(1, -1));
        if (!questions) return null;
        
        // Get category (text before first quote)
        const category = line.split('"')[0].trim();
        if (!category) return null;
        
        return [category, questions];
    }
    
    async loadDataFile() {
        try {
            const response = await fetch('data.txt');
            if (!response.ok) {
                throw new Error('Failed to load data.txt');
            }
            const text = await response.text();
            this.sequences = text.split('\n')
                .map(line => this.parseLine(line))
                .filter(sequence => sequence !== null)
                .slice(0, 16); // Only take the first 16 categories
            
            if (this.sequences.length === 0) {
                this.questionText.textContent = 'No valid sequences found in data.txt!';
                return;
            }
            
            this.setupCategoryGrid();
        } catch (error) {
            console.error('Error reading file:', error);
            this.questionText.textContent = 'Error loading data.txt file!';
        }
    }
    
    setupCategoryGrid() {
        this.categoryGrid.innerHTML = ''; // Clear existing buttons
        
        // Shuffle the sequences to randomize button positions
        const shuffledSequences = [...this.sequences].sort(() => Math.random() - 0.5);
        
        shuffledSequences.forEach((sequence, index) => {
            const button = document.createElement('button');
            button.className = 'category-button';
            button.textContent = '?';
            button.dataset.category = sequence[0];
            button.dataset.index = index;
            
            button.addEventListener('click', () => this.handleCategoryClick(button, sequence));
            this.categoryGrid.appendChild(button);
        });
    }
    
    handleCategoryClick(button, sequence) {
        if (button.classList.contains('disabled')) return;
        
        const isCorrect = sequence[0] === this.currentQuestion?.[0];
        button.textContent = sequence[0]; // Reveal the category
        
        if (!this.currentQuestion) {
            // First click - set the current question
            this.currentQuestion = sequence;
            const randomQuestionIndex = Math.floor(Math.random() * sequence[1].length);
            this.questionText.textContent = sequence[1][randomQuestionIndex];
            button.classList.add('disabled');
        } else {
            // Subsequent clicks - check if the answer is correct
            this.totalAttempts++;
            if (isCorrect) {
                this.score++;
                button.classList.add('correct');
            } else {
                button.classList.add('incorrect');
            }
            
            // Update score
            this.scoreElement.textContent = this.score;
            this.totalAttemptsElement.textContent = this.totalAttempts;
            
            // Reset for next question
            setTimeout(() => {
                // Find a new random sequence that hasn't been used
                const availableButtons = Array.from(document.querySelectorAll('.category-button:not(.disabled)'));
                if (availableButtons.length > 0) {
                    const randomButton = availableButtons[Math.floor(Math.random() * availableButtons.length)];
                    const sequenceIndex = parseInt(randomButton.dataset.index);
                    this.currentQuestion = this.sequences[sequenceIndex];
                    const randomQuestionIndex = Math.floor(Math.random() * this.currentQuestion[1].length);
                    this.questionText.textContent = this.currentQuestion[1][randomQuestionIndex];
                    randomButton.classList.add('disabled');
                } else {
                    // Game over
                    this.questionText.textContent = `Game Over! Final Score: ${this.score}/${this.totalAttempts}`;
                    setTimeout(() => {
                        if (confirm('Play again?')) {
                            this.resetGame();
                        }
                    }, 1500);
                }
            }, 1000);
        }
    }
    
    resetGame() {
        this.score = 0;
        this.totalAttempts = 0;
        this.currentQuestion = null;
        this.scoreElement.textContent = '0';
        this.totalAttemptsElement.textContent = '0';
        this.questionText.textContent = 'Select a category to start!';
        this.setupCategoryGrid();
    }
}

// Initialize the application
const app = new CategoryQuiz();