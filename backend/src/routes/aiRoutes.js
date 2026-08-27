const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { generate } = require('../controllers/aiController');

router.use(authMiddleware);
router.post('/generate', generate);

module.exports = router;
