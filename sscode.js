<!-- 
    ================================================================
    SERVER-SIDE CODE (FOR DEPLOYMENT REFERENCE)
    ================================================================
    
    The JavaScript code below is NOT for the browser. It's a serverless function.
    To make the "Get AI Analysis" feature work on a public website, you need to:
    
    1.  Choose a hosting provider that supports serverless functions (e.g., Vercel, Netlify).
    2.  Create a file named `analyze.js` inside a folder named `/api` in your project's root.
    3.  Copy the code below and paste it into that `/api/analyze.js` file.
    4.  Get a Gemini API key from Google AI Studio.
    5.  In your hosting provider's project settings, create a secret "Environment Variable".
        - Name: GEMINI_API_KEY
        - Value: [Paste your secret key here]
    6.  Deploy your project. The host will automatically create a secure backend endpoint
        at `/api/analyze` that the frontend can now call safely.
    
    /* --- START: /api/analyze.js --- */
    /*
    export default async function handler(req, res) {
      // Only allow POST requests
      if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
      }

      const { prompt } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      // Retrieve the secret API key from environment variables
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
          return res.status(500).json({ error: 'API key not configured on the server.' });
      }

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      };

      try {
        const geminiResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!geminiResponse.ok) {
          const errorBody = await geminiResponse.text();
          console.error('Gemini API Error:', errorBody);
          return res.status(geminiResponse.status).json({ error: `Gemini API request failed: ${errorBody}` });
        }

        const data = await geminiResponse.json();

        const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Could not retrieve AI analysis. Please try again.";
        
        // Send the successful response back to the frontend
        res.status(200).json({ analysis: analysisText });

      } catch (error) {
        console.error('Error in serverless function:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
      }
    }
    */
    /* --- END: /api/analyze.js --- */
    
    -->