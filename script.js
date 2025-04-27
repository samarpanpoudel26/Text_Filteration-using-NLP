// Common English stop words and filler words
const stopWords = new Set([
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours",
    "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers",
    "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves",
    "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are",
    "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does",
    "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until",
    "while", "of", "at", "by", "for", "with", "about", "against", "between", "into",
    "through", "during", "before", "after", "above", "below", "to", "from", "up", "down",
    "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here",
    "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more",
    "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so",
    "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now",
    "um", "uh", "like", "you know", "actually", "basically", "literally", "well"
]);

// Speech Recognition Setup
let recognition = null;
try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
} catch(e) {
    console.error('Speech recognition not supported:', e);
}

// Microphone button functionality
const micButton = document.getElementById('micButton');
let isRecording = false;

micButton.addEventListener('click', toggleRecording);

function toggleRecording() {
    if (!recognition) {
        alert('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
        return;
    }

    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

function startRecording() {
    try {
        recognition.start();
        isRecording = true;
        micButton.classList.add('recording');
        micButton.title = 'Click to stop recording';
    } catch(e) {
        console.error('Error starting recording:', e);
    }
}

function stopRecording() {
    try {
        recognition.stop();
        isRecording = false;
        micButton.classList.remove('recording');
        micButton.title = 'Click to start recording';
    } catch(e) {
        console.error('Error stopping recording:', e);
    }
}

// Handle speech recognition results
if (recognition) {
    recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join(' ');
        
        document.getElementById('inputText').value = transcript;
        
        // Auto filter the text after speech recognition
        if (event.results[event.results.length - 1].isFinal) {
            filterText();
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        stopRecording();
    };

    recognition.onend = () => {
        if (isRecording) {
            // Restart recognition if it ends while we're still recording
            recognition.start();
        }
    };
}

// Function to get input text and update output
function getInputAndUpdate(transformFunction) {
    const inputText = document.getElementById('inputText').value;
    const transformedText = transformFunction(inputText);
    document.getElementById('outputText').textContent = transformedText;
}

// Convert text to uppercase
function convertToUpperCase() {
    getInputAndUpdate(text => text.toUpperCase());
}

// Convert text to lowercase
function convertToLowerCase() {
    getInputAndUpdate(text => text.toLowerCase());
}

// Capitalize first letter of each word
function capitalizeWords() {
    getInputAndUpdate(text => {
        return text
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    });
}

// Remove extra spaces
function removeExtraSpaces() {
    getInputAndUpdate(text => {
        return text
            .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
            .trim();               // Remove leading and trailing spaces
    });
}

function filterText() {
    const inputText = document.getElementById('inputText').value;
    if (!inputText.trim()) {
        return;
    }

    // Use compromise for natural language processing
    const doc = nlp(inputText);
    
    // Tokenize and process the text
    const words = inputText.toLowerCase().split(/\s+/);
    const filteredWords = words.filter(word => {
        // Remove punctuation and check if it's not a stop word
        const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
        return cleanWord.length > 2 && !stopWords.has(cleanWord);
    });

    // Get statistics
    const originalWordCount = words.length;
    const filteredWordCount = filteredWords.length;
    const reductionPercent = Math.round((1 - filteredWordCount / originalWordCount) * 100);

    // Update statistics display
    document.getElementById('originalWords').textContent = originalWordCount;
    document.getElementById('filteredWords').textContent = filteredWordCount;
    document.getElementById('reductionPercent').textContent = reductionPercent + '%';

    // Join the filtered words back together
    const filteredText = filteredWords.join(' ');
    
    // Update the output
    document.getElementById('outputText').textContent = filteredText;
}

// Clear all text and stats
function clearText() {
    document.getElementById('inputText').value = '';
    document.getElementById('outputText').textContent = '';
    document.getElementById('originalWords').textContent = '0';
    document.getElementById('filteredWords').textContent = '0';
    document.getElementById('reductionPercent').textContent = '0%';
    
    // Stop recording if active
    if (isRecording) {
        stopRecording();
    }
} 