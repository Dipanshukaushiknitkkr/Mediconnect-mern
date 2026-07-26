const express = require('express');
const router = express.Router();
const { triageSymptoms } = require('../controllers/aiController');

router.post('/triage', triageSymptoms);

module.exports = router;
