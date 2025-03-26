require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const morgan = require('morgan');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// Configuration
const config = {
  port: process.env.PORT || 3500,
  apiKey: process.env.API_KEY,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // 100 requests per window
  },
  requestTimeout: 30000 // 30 seconds
};

if (!config.apiKey) throw new Error('Missing API_KEY in environment variables');

// AI Service
const genAi = new GoogleGenerativeAI(config.apiKey);
const textModel = genAi.getGenerativeModel({ model: 'gemini-1.5-flash' });
const visionModel = genAi.getGenerativeModel({ model: 'gemini-1.5-pro' });

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(rateLimit(config.rateLimit));

// Request timeout middleware (Fixed)
app.use((req, res, next) => {
  req.abortController = new AbortController();

  req.timeoutId = setTimeout(() => {
    if (req.abortController) {
      req.abortController.abort();
    }
    if (!res.headersSent) {
      res.status(504).json({ error: "Request timeout" });
    }
  }, config.requestTimeout);

  req.on('close', () => {
    if (req.abortController) {
      req.abortController.abort();
    }
  });

  next();
});

// Cleanup middleware
app.use((req, res, next) => {
  res.on('finish', () => clearTimeout(req.timeoutId));
  next();
});

// Prompt Templates
const PROMPT_TEMPLATES = {
  basic: (prompt, context) => `
    Create concise notes on "${prompt}" for ${context.subject}.
    Format: ${context.formatPreference || 'bullet points'}.
    Key topics: ${context.importantTopics || 'all relevant'}.
    Keep it under 300 words.
  `,

  advanced: (prompt, context) => `
    Create comprehensive notes on "${prompt}" for ${context.subject}.
    Course: ${context.course}, Year: ${context.yearSem}.
    Include:
    1. Detailed explanations with examples
    2. Key formulas/theorems (boxed)
    3. 1-2 diagrams (describe with ALT text)
    4. Real-world applications
    5. Summary section
    Format: ${context.formatPreference || 'structured markdown'}.
  `
};

// Function to generate AI text
const generateAIText = async (prompt, signal) => {
  try {
    const result = await textModel.generateContent(prompt, { signal });
    return result.response.text();
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Request aborted');
    throw new Error('AI text generation failed');
  }
};

// Function to generate AI image (if advanced mode)
const generateAIImage = async (prompt, signal) => {
  try {
    const imagePrompt = `Create a detailed diagram about: ${prompt}. Include labels and annotations.`;
    const result = await visionModel.generateContent(imagePrompt, { signal });
    
    // Assuming AI returns an actual image URL instead of text
    return [{ 
      url: result.response.text(), 
      altText: `Diagram explaining ${prompt}` 
    }];
  } catch (error) {
    console.error('Image generation error:', error.message);
    return []; // Return empty array if image fails
  }
};

// API Endpoints
app.post('/api/generate', [
  body('prompt').isString().trim().notEmpty(),
  body('advancedMode').isBoolean(),
  body('subject').isString().trim().notEmpty(),
  body('userContext').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { prompt, advancedMode, subject, userContext } = req.body;
    const template = advancedMode ? PROMPT_TEMPLATES.advanced : PROMPT_TEMPLATES.basic;
    const fullPrompt = template(prompt, { subject, ...userContext });

    // Generate AI content
    const textResponse = await generateAIText(fullPrompt, req.abortController.signal);

    // Generate AI images if advanced mode
    const images = advancedMode ? await generateAIImage(prompt, req.abortController.signal) : [];

    res.json({ success: true, textResponse, images });
  } catch (error) {
    if (error.message === 'Request aborted') {
      console.log('Request aborted by client');
      return;
    }
    console.error('Generation error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Server Start
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
