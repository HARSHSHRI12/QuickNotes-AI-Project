const express = require('express');
const router = express.Router();
const { saveSubmission } = require('../controllers/submissionController');
const auth = require('../middleware/auth');

router.post('/', auth, saveSubmission);

module.exports = router;