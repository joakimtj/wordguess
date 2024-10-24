import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';

const app = express();
const port = 3001;  // Make sure this is different from your React port (usually 3000)

// Enable CORS for your React app
app.use("/*", cors());

const openai = new OpenAI();

app.get('/api/word', async (req: any, res: any) => {
    try {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a word game assistant. Generate a 5-letter word and a short, clever hint for it. The hint should not directly give away the word but should be helpful. Respond in JSON format with 'word' and 'hint' keys. The word should be in capital letters."
                },
                {
                    role: "user",
                    content: "Generate a word and hint"
                }
            ],
            model: "gpt-4o-mini",
            temperature: 1,
            response_format: { type: "json_object" },
        });

        const response = completion.choices[0].message.content;
        if (!response) {
            throw new Error("No response from OpenAI");
        }

        const data = JSON.parse(response);
        const { word, hint } = data;

        if (!word || word.length !== 5) {
            return res.status(500).json({ error: "Invalid word generated" });
        }

        res.json({ word, hint });
    } catch (error) {
        console.error('Error generating word:', error);
        res.status(500).json({ error: "Failed to generate word" });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});