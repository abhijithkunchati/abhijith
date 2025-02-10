class QuestionSequences {
    constructor() {
        this.sequences = [];
        this.availableSequences = [];
        this.usedSequences = [];
        this.currentSequence = null;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.totalAttempts = 0;
        this.categorySelected = false;
        
        // DOM elements
        this.questionText = document.getElementById('questionText');
        this.currentQuestionSpan = document.getElementById('currentQuestion');
        this.totalQuestionsSpan = document.getElementById('totalQuestions');
        this.categoryText = document.getElementById('categoryText');
        this.nextBtn = document.getElementById('nextBtn');
        this.newSequenceBtn = document.getElementById('newSequenceBtn');
        this.scoreSpan = document.getElementById('score');
        this.totalAttemptsSpan = document.getElementById('totalAttempts');
        this.categoryButtons = document.getElementById('categoryButtons');
        
        // Event listeners
        this.nextBtn.addEventListener('click', this.handleNext.bind(this));
        this.newSequenceBtn.addEventListener('click', this.startNewSequence.bind(this));

        // Load data.txt automatically
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
                .filter(sequence => sequence !== null);
            
            if (this.sequences.length === 0) {
                this.questionText.textContent = 'No valid sequences found in data.txt!';
                return;
            }
            
            this.availableSequences = [...this.sequences];
            this.usedSequences = [];
            this.startNewSequence();
            
            this.nextBtn.disabled = false;
            this.newSequenceBtn.disabled = false;
        } catch (error) {
            console.error('Error reading file:', error);
            this.questionText.textContent = 'Error loading data.txt file!';
        }
    }

    getAllCategories() {
        return [...new Set(this.sequences.map(seq => seq[0]))];
    }

    createCategoryButtons() {
        this.categoryButtons.innerHTML = '';
        const categories = this.getAllCategories();
        categories.forEach(category => {
            const button = document.createElement('button');
            button.textContent = category;
            button.className = 'category-button';
            button.addEventListener('click', () => this.handleCategorySelect(category));
            this.categoryButtons.appendChild(button);
        });
    }

    handleCategorySelect(selectedCategory) {
        if (this.categorySelected) return;
        
        this.categorySelected = true;
        const correctCategory = this.currentSequence[0];
        const isCorrect = selectedCategory === correctCategory;
        
        // Update score
        this.totalAttempts++;
        if (isCorrect) this.score++;
        
        // Update UI
        this.scoreSpan.textContent = this.score;
        this.totalAttemptsSpan.textContent = this.totalAttempts;
        
        // Show visual feedback
        const buttons = this.categoryButtons.getElementsByClassName('category-button');
        Array.from(buttons).forEach(button => {
            if (button.textContent === selectedCategory) {
                button.classList.add(isCorrect ? 'correct' : 'incorrect');
            }
            if (!isCorrect && button.textContent === correctCategory) {
                button.classList.add('correct');
            }
            button.disabled = true;
        });
        
        // Show correct category
        this.categoryText.textContent = correctCategory;
    }
    
    startNewSequence() {
        if (this.availableSequences.length === 0) {
            this.availableSequences = [...this.usedSequences];
            this.usedSequences = [];
            alert('All categories completed! Starting new cycle...');
        }

        // If category wasn't selected in previous sequence, count it as wrong
        if (this.currentSequence && !this.categorySelected) {
            this.totalAttempts++;
            this.scoreSpan.textContent = this.score;
            this.totalAttemptsSpan.textContent = this.totalAttempts;
        }
        
        const randomIndex = Math.floor(Math.random() * this.availableSequences.length);
        this.currentSequence = this.availableSequences[randomIndex];
        this.currentQuestionIndex = 0;
        this.categorySelected = this.currentQuestionIndex > 0; // Only allow category selection for first question
        
        // Move sequence from available to used
        this.usedSequences.push(this.currentSequence);
        this.availableSequences.splice(randomIndex, 1);
        
        this.updateDisplay();
    }
    
    handleNext() {
        if (!this.currentSequence) return;

        // If category wasn't selected on first question, count it as wrong
        if (this.currentQuestionIndex === 0 && !this.categorySelected) {
            this.totalAttempts++;
            this.scoreSpan.textContent = this.score;
            this.totalAttemptsSpan.textContent = this.totalAttempts;
        }
        
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex >= this.currentSequence[1].length) {
            this.startNewSequence();
        } else {
            this.updateDisplay();
        }
    }
    
    updateDisplay() {
        if (!this.currentSequence) return;
        
        const [category, questions] = this.currentSequence;
        this.questionText.textContent = questions[this.currentQuestionIndex];
        this.currentQuestionSpan.textContent = this.currentQuestionIndex + 1;
        this.totalQuestionsSpan.textContent = questions.length;
        
        // Show category buttons only for the first question in a sequence
        if (this.currentQuestionIndex === 0) {
            this.categorySelected = false;
            this.createCategoryButtons();
            this.categoryText.textContent = '-';
        } else {
            this.categoryButtons.innerHTML = '';
            this.categorySelected = true;
            this.categoryText.textContent = category;
        }
    }
}

// Initialize the application
const app = new QuestionSequences();