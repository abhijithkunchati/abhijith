class QuestionSequences {
    constructor() {
        this.sequences = [];
        this.availableSequences = [];
        this.usedSequences = [];
        this.currentSequence = null;
        this.currentQuestionIndex = 0;
        
        // DOM elements
        this.fileInput = document.getElementById('fileInput');
        this.questionText = document.getElementById('questionText');
        this.currentQuestionSpan = document.getElementById('currentQuestion');
        this.totalQuestionsSpan = document.getElementById('totalQuestions');
        this.categoryText = document.getElementById('categoryText');
        this.nextBtn = document.getElementById('nextBtn');
        this.newSequenceBtn = document.getElementById('newSequenceBtn');
        
        // Event listeners
        this.fileInput.addEventListener('change', this.handleFileUpload.bind(this));
        this.nextBtn.addEventListener('click', this.handleNext.bind(this));
        this.newSequenceBtn.addEventListener('click', this.startNewSequence.bind(this));
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
    
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            this.sequences = text.split('\n')
                .map(line => this.parseLine(line))
                .filter(sequence => sequence !== null);
            
            if (this.sequences.length === 0) {
                alert('No valid sequences found in file!');
                return;
            }
            
            this.availableSequences = [...this.sequences];
            this.usedSequences = [];
            this.startNewSequence();
            
            this.nextBtn.disabled = false;
            this.newSequenceBtn.disabled = false;
        } catch (error) {
            console.error('Error reading file:', error);
            alert('Error reading file!');
        }
    }
    
    startNewSequence() {
        if (this.availableSequences.length === 0) {
            this.availableSequences = [...this.usedSequences];
            this.usedSequences = [];
            alert('All categories completed! Starting new cycle...');
        }
        
        const randomIndex = Math.floor(Math.random() * this.availableSequences.length);
        this.currentSequence = this.availableSequences[randomIndex];
        this.currentQuestionIndex = 0;
        
        // Move sequence from available to used
        this.usedSequences.push(this.currentSequence);
        this.availableSequences.splice(randomIndex, 1);
        
        this.updateDisplay();
    }
    
    handleNext() {
        if (!this.currentSequence) return;
        
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
        this.categoryText.textContent = category;
    }
}

// Initialize the application
const app = new QuestionSequences(); 