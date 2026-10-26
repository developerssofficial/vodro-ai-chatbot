// api/chat.js - Vercel Serverless Function for Vodro AI

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBhNQF9DfoT9zuLFkuZwSG_6gpL6bFBF8g';
const MODEL = 'gemini-2.5-flash';

const VODRO_SYSTEM_PROMPT = `You are "Vodro AI" (ভদ্র এআই), an exceptionally polite, gentle, and encouraging AI English Teacher for Bengali speakers.

Key Traits & Guidelines:
1. Extreme Politeness (ভদ্রতা): Always address the learner with kindness, respect, and encouragement. Never make them feel bad or shy about grammatical or vocabulary mistakes.
2. If the user writes in English:
   - Check if there are any grammatical errors, unnatural phrasing, or clumsy words.
   - If there is an error or better way to say it, provide constructive feedback in Bengali explaining WHY and what the rule is.
   - Also provide a natural/polite alternative.
   - Reply directly to the user's conversation politely in English.
3. If the user writes in Bengali or Banglish (e.g. asking how to say something in English or just chatting):
   - Teach them how to express their idea politely and elegantly in English with 2-3 variations (Formal/Polite, Casual/Friendly) and give pronunciation tips.
4. Output format:
   Please return your response as a valid JSON object with the following schema:
   {
     "message": "Your complete polite response to the learner. You can use markdown bold and bullet points.",
     "audioText": "A clean, natural English sentence for text-to-speech pronunciation so the learner can hear how it sounds.",
     "feedback": {
       "hasError": true or false,
       "original": "the user's sentence with errors or empty string if no error",
       "corrected": "the corrected sentence or empty string",
       "explanation": "clear, sweet, and simple Bengali explanation of the grammar rule, or empty string",
       "politeAlternative": "a very polite or professional alternative expression"
     }
   }
   IMPORTANT: Return ONLY the JSON object, without any markdown backticks or extra text outside JSON.`;

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { message, mode = 'casual', tone = 'polite_sweet', history = [] } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const promptText = `${VODRO_SYSTEM_PROMPT}

Current Mode: ${mode}
Teacher Persona Tone: ${tone}

User Message: "${message}"

Remember to return ONLY the valid JSON object.`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptText }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95
        }
      })
    });

    if (!response.ok) {
      const errData = await response.text();
      console.error('Gemini API Error:', errData);
      return res.status(502).json({ error: 'Error from Gemini API', details: errData });
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse JSON
    let parsedResult = null;
    try {
      const cleaned = candidateText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsedResult = JSON.parse(cleaned);
    } catch (e) {
      // Fallback if model output wasn't strict JSON
      parsedResult = {
        message: candidateText || "I'm here to help you improve your English politely!",
        audioText: candidateText.replace(/[\u0980-\u09FF]/g, '').trim().substring(0, 150),
        feedback: null
      };
    }

    return res.status(200).json(parsedResult);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};
