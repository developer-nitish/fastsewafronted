const express = require('express');
const router = express.Router();

const { chat, downloadPdf } = require('../controllers/chatController');

router.post('/chat', chat);
router.get('/download-pdf/:file', downloadPdf);

module.exports = router;
