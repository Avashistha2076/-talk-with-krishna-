const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const fluteMusic = document.getElementById('fluteMusic');

// Set initial volume for music
fluteMusic.volume = 0.3;

function addMessage(message, isUser = false) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function playFluteMusic() {
    fluteMusic.currentTime = 0;
    fluteMusic.play();
}

function stopFluteMusic() {
    fluteMusic.pause();
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessageToChat('user', message);
    userInput.value = '';

    try {
        // Show loading message
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message krishna-message';
        loadingDiv.textContent = 'कृष्ण सोच रहे हैं...';
        chatMessages.appendChild(loadingDiv);

        // Send message to backend with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        // पहले सर्वर की जांच करें
        try {
            const testResponse = await fetch('http://localhost:3002/api/test');
            if (!testResponse.ok) {
                throw new Error('सर्वर से कनेक्ट नहीं हो पा रहा है।');
            }
        } catch (testError) {
            console.error('सर्वर टेस्ट एरर:', testError);
            throw new Error('सर्वर से कनेक्ट नहीं हो पा रहा है। कृपया सुनिश्चित करें कि सर्वर चल रहा है।');
        }

        const response = await fetch('http://localhost:3002/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ message }),
            signal: controller.signal,
            mode: 'cors',
            credentials: 'include'
        });

        clearTimeout(timeoutId);

        // Check if response is ok before trying to parse JSON
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        // Try to parse JSON response
        let data;
        try {
            data = await response.json();
        } catch (e) {
            console.error('JSON Parse Error:', e);
            throw new Error('सर्वर से अमान्य प्रतिक्रिया मिली है।');
        }
        
        // Remove loading message
        chatMessages.removeChild(loadingDiv);
        
        // Play flute music when receiving response
        playFluteMusic();
        
        // Add Krishna's response to chat
        if (data && data.response) {
            addMessageToChat('krishna', data.response);
        } else {
            throw new Error('अमान्य प्रतिक्रिया प्राप्त हुई।');
        }
        
        // Stop music after 5 seconds
        setTimeout(stopFluteMusic, 5000);
    } catch (error) {
        console.error('Error:', error);
        // Remove loading message if it exists
        const loadingDiv = document.querySelector('.krishna-message');
        if (loadingDiv) {
            chatMessages.removeChild(loadingDiv);
        }
        
        // Show specific error message based on error type
        let errorMessage = 'क्षमा करें, कुछ तकनीकी समस्या आ गई है। कृपया पुनः प्रयास करें।';
        
        if (error.name === 'AbortError') {
            errorMessage = 'सर्वर से जवाब नहीं मिल रहा है। कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'सर्वर से कनेक्ट नहीं हो पा रहा है। कृपया सुनिश्चित करें कि सर्वर चल रहा है और आपका इंटरनेट कनेक्शन सही है।';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        addMessageToChat('krishna', errorMessage);
    }
}

function addMessageToChat(sender, message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Handle Enter key press
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Add initial welcome message
window.addEventListener('load', () => {
    addMessageToChat('krishna', 'नमस्ते! मैं कृष्ण हूं। मैं आपकी कैसे मदद कर सकता हूं?');
}); 