const { generateNote } = require('../services/groqService');
const logger = require('../config/logger');

const generate = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt?.trim()) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const note = await generateNote(prompt.trim());
    logger.info({ userId: req.user._id }, 'AI note generated');
    return res.status(200).json({ note });
  } catch (err) {
    logger.error({ err }, 'AI generate failed');
    return res.status(500).json({ message: 'Failed to generate note. Please try again.' });
  }
};

module.exports = { generate };
