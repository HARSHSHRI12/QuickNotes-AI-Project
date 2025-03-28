require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const speech = require('@google-cloud/speech');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const nodemailer = require('nodemailer');

const app = express();

// Configuration
const config = {
  port: process.env.PORT || 3500,
  apiKey: process.env.API_KEY,
  frontendUrl: process.env.FRONTEND_URL || 'http://127.0.0.1:3501',
  dbUrl: process.env.MONGO_URI,
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100
  },
  requestTimeout: 30000
};

if (!config.apiKey || !config.dbUrl) throw new Error('Missing API_KEY or MONGO_URI in environment variables');

mongoose.connect(config.dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
const Conversation = mongoose.model('Conversation', new mongoose.Schema({
  user: String,
  query: String,
  response: String,
  timestamp: { type: Date, default: Date.now }
}));

const genAi = new GoogleGenerativeAI(config.apiKey);
const textModel = genAi.getGenerativeModel({ model: 'gemini-1.5-flash' });

app.use(helmet());
app.use(cors({ origin: config.frontendUrl, methods: ['GET', 'POST'], allowedHeaders: ['Content-Type'] }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(rateLimit(config.rateLimit));

const fetchDataFromAPIs = async (query) => {
  try {
    const responses = await Promise.all([
      axios.get(`https://api1.example.com/search?q=${query}`),
      axios.get(`https://api2.example.com/search?q=${query}`),
      axios.get(`https://api3.example.com/search?q=${query}`)
    ]);
    return responses.map(res => res.data).flat();
  } catch (error) {
    console.error("Error fetching from APIs:", error.message);
    return [];
  }
};

const generateNotes = async (query) => {
  try {
    const result = await textModel.generateContent(`Extract key points from: "${query}"`);
    return result.response.text();
  } catch (error) {
    throw new Error('AI text generation failed');
  }
};

const generateQuiz = async (notes) => {
  try {
    const result = await textModel.generateContent(`Create a quiz based on: ${notes}`);
    return result.response.text();
  } catch (error) {
    return 'Quiz generation failed.';
  }
};

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/api/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const data = await pdfParse(req.file.buffer);
    res.json({ success: true, text: data.text });
  } catch (error) {
    res.status(500).json({ error: 'File processing failed' });
  }
});

app.post('/api/generate', [body('query').isString().trim().notEmpty()], async (req, res) => {
  try {
    const { query } = req.body;
    const apiData = await fetchDataFromAPIs(query);
    const notes = await generateNotes(query);
    const quiz = await generateQuiz(notes);
    const conversation = new Conversation({ user: 'User', query, response: notes });
    await conversation.save();
    res.json({ success: true, notes, quiz, additionalData: apiData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER,
      subject: `Contact Form Submission from ${name}`,
      text: message
    });
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Email sending failed' });
  }
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
