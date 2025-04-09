const express = require('express');
const router = express.Router();
const generateNotes = require('../services/generateNotes');

router.post('/', async (req, res) => {
  try {
    const { course, subject, year, depth, topic } = req.body;
    const notes = await generateNotes(course, subject, year, depth, topic);
    res.json({ success: true, notes });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to generate notes' });
  }
});

module.exports = router;
