require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');

const app = express();
const port = process.env.PORT || 3002;

// OpenAI कॉन्फ़िगरेशन
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// CORS कॉन्फ़िगरेशन
const corsOptions = {
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001', 'http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:8000', 'http://127.0.0.1:8000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Accept'],
    credentials: true
};

// मिडलवेयर
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// टेस्ट एंडपॉइंट
app.get('/api/test', (req, res) => {
    res.json({ message: 'सर्वर काम कर रहा है!' });
});

// कृष्ण की पर्सनैलिटी प्रॉम्प्ट
const krishnaPrompt = `तुम भगवान कृष्ण हो। तुम्हारी बातचीत का तरीका दयालु, ज्ञानी और आध्यात्मिक होना चाहिए। 
तुम हिंदी में बात करते हो और अपने जवाबों में गीता के उपदेशों का उल्लेख करते हो। 
तुम्हारे जवाब छोटे और सारगर्भित होने चाहिए। 
तुम अपने जवाबों में "मैं" का उपयोग करते हो जैसे "मैं तुम्हें बताता हूं" या "मेरा मानना है"।
तुम्हारे जवाबों में आध्यात्मिक ज्ञान और प्रेम का मिश्रण होना चाहिए।`;

// चैट एंडपॉइंट
app.post('/api/chat', async (req, res) => {
    try {
        if (!req.body.message) {
            return res.status(400).json({ 
                error: 'कृपया एक संदेश भेजें।' 
            });
        }

        const { message } = req.body;
        console.log('प्राप्त संदेश:', message);
        
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: krishnaPrompt },
                { role: "user", content: message }
            ],
            max_tokens: 150,
            temperature: 0.7,
        });

        const response = completion.choices[0].message.content;
        console.log('AI का जवाब:', response);
        
        // सुनिश्चित करें कि रिस्पांस एक वैध स्ट्रिंग है
        if (!response || typeof response !== 'string') {
            throw new Error('अमान्य AI प्रतिक्रिया');
        }
        
        res.json({ response });
    } catch (error) {
        console.error('एरर विवरण:', error);
        
        let errorMessage = 'क्षमा करें, कुछ तकनीकी समस्या आ गई है। कृपया पुनः प्रयास करें।';
        
        if (error.response) {
            console.error('OpenAI API एरर:', error.response.data);
            errorMessage = 'AI सर्विस में कुछ समस्या है। कृपया कुछ समय बाद पुनः प्रयास करें।';
        } else if (error.request) {
            console.error('नेटवर्क एरर:', error.request);
            errorMessage = 'इंटरनेट कनेक्शन में समस्या है। कृपया अपना कनेक्शन जांचें।';
        }
        
        res.status(500).json({ error: errorMessage });
    }
});

// सर्वर स्टार्ट
app.listen(port, () => {
    console.log(`सर्वर पोर्ट ${port} पर चल रहा है`);
    console.log(`OpenAI API की स्थिति: ${process.env.OPENAI_API_KEY ? 'कॉन्फ़िगर की गई' : 'कॉन्फ़िगर नहीं की गई'}`);
}); 