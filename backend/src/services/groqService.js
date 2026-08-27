const Groq = require('groq-sdk');
const logger = require('../config/logger');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateNote = async (prompt) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a helpful note-writing assistant. When given a topic or prompt, generate a well-structured note in HTML format. 
Use proper HTML tags: <h1> for title, <h2> for sections, <p> for paragraphs, <ul>/<li> for lists, <strong> for bold, <em> for italic.
Return ONLY a JSON object with two fields: "title" (string) and "content" (HTML string). No extra text, no markdown fences.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'groq/compound',
      temperature: 0.7,
      max_tokens: 2048,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from GROQ');

    const parsed = JSON.parse(response);
    if (!parsed.title || !parsed.content) throw new Error('Invalid response format');

    logger.info({ prompt: prompt.slice(0, 50) }, 'AI note generated');
    return { title: parsed.title, content: parsed.content };
  } catch (err) {
    logger.error({ err, prompt: prompt.slice(0, 50) }, 'GROQ generation failed');
    throw err;
  }
};

module.exports = { generateNote };
