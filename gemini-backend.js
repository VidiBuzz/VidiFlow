// This is your backend server file (e.g., gemini-backend.js or located at /api/analyze.js for Vercel)
// It uses the Express.js framework to create a simple server.

// You'll need to install express and node-fetch:
// npm install express node-fetch

const express = require('express');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

// This allows your server to understand JSON in request bodies
app.use(express.json());

// This is the core of your backend. It's an "endpoint" that the frontend will call.
// It listens for POST requests at the URL /api/analyze
app.post('/api/analyze', async (req, res) => {
    // 1. Get the prompt from the request that the frontend sent.
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    // 2. Get your secret Google Gemini API key from environment variables.
    // NEVER hardcode this in your file.
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        // This is an error on the server side, so we send a 500 status.
        console.error('Gemini API key is not set in environment variables.');
        return res.status(500).json({ error: 'Server configuration error.' });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    // 3. Prepare the payload to send to the Gemini API.
    const payload = {
        contents: [{
            role: "user",
            parts: [{ text: prompt }]
        }]
    };

    try {
        // 4. Call the Gemini API from your backend.
        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!geminiResponse.ok) {
            // If the Gemini API returns an error, forward that information.
            const errorData = await geminiResponse.json();
            console.error('Gemini API Error:', errorData);
            return res.status(geminiResponse.status).json({ error: 'Failed to get response from AI model.' });
        }

        const geminiData = await geminiResponse.json();

        // 5. Send the successful response from Gemini back to your frontend.
        res.status(200).json(geminiData);

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
