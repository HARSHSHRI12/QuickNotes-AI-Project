const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { generateNotes } = require('../controllers/generateController');
const auth = require('../middleware/auth');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50
});

router.post('/', limiter, auth, generateNotes);

module.exports = router;