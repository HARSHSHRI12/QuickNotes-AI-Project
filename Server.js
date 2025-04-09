require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const morgan = require('morgan');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const nodemailer = require('nodemailer');
const connectDB = require('./config/db');
// const questionRoutes = require('./routes/questionRoutes');
const { Storage } = require('@google-cloud/storage');
const sharp = require('sharp');
const QuickDB = require("./QuickDB");
//create an authentication 
const passport=require('./security/auth');
const user=require('./model/User');

const app = express();

app.use(passport.initialize());
const localauthmiddleware=passport.authenticate('local',{session:false});
//use passport.js
app.use(logRequest);

//import routes
const UserRoutes=require('./Routers/UserRoutes');

//use itemRoutes
app.use('/User',UserRoutes)

// Configuration
const config = {
  port: process.env.PORT || 3500,
  apiKey: process.env.API_KEY,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  dbUrl: process.env.MONGO_URI,
  gcsBucket: process.env.GCS_BUCKET_NAME,
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100
  },
  apiRateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 50
  },
  uploadRateLimit: {
    windowMs: 60 * 60 * 1000,
    max: 5
  },
  requestTimeout: 30000,
  maxFileSize: 15 * 1024 * 1024 // 15MB
};

// Initialize services
const db = QuickDB(config);
const genAi = new GoogleGenerativeAI(config.apiKey);
const textModel = genAi.getGenerativeModel({ model: 'gemini-1.5-pro' });
const visionModel = genAi.getGenerativeModel({ model: 'gemini-pro-vision' });
const imageModel = genAi.getGenerativeModel({ model: 'imagegeneration' });

// Initialize GCS only if bucket name is provided
let bucket;
if (config.gcsBucket) {
  const storage = new Storage();
  bucket = storage.bucket(config.gcsBucket);
}
// Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3501',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Rate limiters
const generalLimiter = rateLimit(config.rateLimit);
const apiLimiter = rateLimit(config.apiRateLimit);
const uploadLimiter = rateLimit(config.uploadRateLimit);

// File upload configuration
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and image files are allowed'), false);
  }
};

const multerStorage = multer.memoryStorage();
const upload = multer({ 
  storage: multerStorage,
  fileFilter,
  limits: { fileSize: config.maxFileSize }
});

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper Functions
const uploadToGCS = async (buffer, filename, contentType) => {
  const file = bucket.file(filename);
  await file.save(buffer, {
    metadata: { contentType },
    resumable: false
  });
  await file.makePublic();
  return `https://storage.googleapis.com/${config.gcsBucket}/${filename}`;
};

const generateImage = async (prompt) => {
  try {
    const result = await imageModel.generateContent({
      prompt: `${prompt}. Create a detailed, educational diagram or illustration.`,
      size: "1024x1024",
      quality: "hd"
    });
    const imageBuffer = Buffer.from(result.response.image, 'base64');
    
    // Optimize image
    const optimizedImage = await sharp(imageBuffer)
      .resize(800, 800, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer();
    
    const imageUrl = await uploadToGCS(
      optimizedImage,
      `generated-images/${Date.now()}.jpg`,
      'image/jpeg'
    );
    
    return {
      url: imageUrl,
      description: prompt
    };
  } catch (error) {
    console.error('Image generation failed:', error);
    return null;
  }
};

const generateAdvancedNotes = async (query) => {
  try {
    // Step 1: Generate structured notes
    const notesResult = await textModel.generateContent(`
      Create comprehensive, advanced study notes with the following structure:
      
      1. [Concept Name]
         - Definition: Clear, concise definition
         - Key Points: Bulleted list of 3-5 key aspects
         - Diagram Description: Detailed description of a helpful diagram
         - Real-world Example: Practical application
         - Common Misconceptions: 1-2 common misunderstandings
         - Memory Aid: Mnemonic or memory technique
      
      2. [Next Concept]
         - (Same structure as above)
      
      Include markdown formatting with headings, bold for key terms, and italics for examples.
      Content to create notes from: "${query}"
    `);
    
    const notes = notesResult.response.text();
    
    // Step 2: Extract diagram descriptions for image generation
    const diagramPrompts = await extractDiagramPrompts(notes);
    
    // Step 3: Generate images for diagrams
    const imagePromises = diagramPrompts.map(prompt => generateImage(prompt));
    const images = (await Promise.all(imagePromises)).filter(img => img !== null);
    
    // Step 4: Enhance notes with image references
    let enhancedNotes = notes;
    images.forEach((img, index) => {
      enhancedNotes += `\n\n![Diagram ${index + 1}](${img.url} "${img.description}")`;
    });
    
    // Step 5: Add summary tables
    const tablesResult = await textModel.generateContent(`
      Create summary comparison tables for the key concepts in these notes:
      ${enhancedNotes}
      
      Format as markdown tables with clear headers and row/column organization.
    `);
    
    enhancedNotes += `\n\n${tablesResult.response.text()}`;
    
    return {
      notes: enhancedNotes,
      images
    };
  } catch (error) {
    console.error('Advanced notes generation failed:', error);
    throw new Error('Failed to generate advanced notes');
  }
};

const extractDiagramPrompts = async (notes) => {
  try {
    const result = await textModel.generateContent(`
      Extract 2-3 most important diagram descriptions from these notes to visualize:
      ${notes}
      
      Return as a JSON array of strings:
      ["description 1", "description 2"]
    `);
    
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error('Failed to extract diagram prompts:', error);
    return [];
  }
};

//generateNotes function 
const generateNotes = async (topic, depth = "medium") => {
  try {
    const prompt = `
      Generate detailed study notes on the topic: "${topic}" with a ${depth} level of explanation.
      
      Include:
      - A brief introduction
      - Key concepts and definitions
      - Important points and explanations
      - Examples or applications
      - A summary or key takeaways

      Format with clear section headings and markdown formatting for readability.
    `;

    const result = await textModel.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Notes generation failed:', error);
    return 'Notes generation failed. Please try again later.';
  }
};

//generateQuiz function
const generateQuiz = async (notes, advanced = false) => {
  try {
    const prompt = advanced ? `
      Create an advanced 10-question assessment based on these notes:
      ${notes}
      
      Include:
      - 4 multiple choice questions
      - 3 true/false questions
      - 2 short answer questions
      - 1 diagram interpretation question
      
      Provide detailed explanations for each answer.
      Format with clear section headings and markdown formatting.
    ` : `
      Create a 5-question multiple choice quiz based on these notes: 
      ${notes}
      Format each question with the question text followed by 4 options labeled A-D.
    `;
    
    const result = await textModel.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Quiz generation failed:', error);
    return 'Quiz generation failed. Please try again later.';
  }
};

// API Endpoints
app.post('/api/upload', uploadLimiter, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded or invalid file type' 
      });
    }

    let notes, quiz, images = [];
    const advancedMode = req.body.advancedMode === 'true';

    if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(req.file.buffer);
      
      if (advancedMode) {
        const result = await generateAdvancedNotes(data.text);
        notes = result.notes;
        images = result.images;
        quiz = await generateQuiz(notes, true);
      } else {
        notes = await generateNotes(data.text);
        quiz = await generateQuiz(notes);
      }
    } else if (req.file.mimetype.startsWith('image/')) {
      const query = req.body.query || 'Extract key information from this image and create detailed study notes';
      const processedText = await processImage(req.file.buffer, req.file.mimetype, query);
      
      if (advancedMode) {
        const result = await generateAdvancedNotes(processedText);
        notes = result.notes;
        images = result.images;
        quiz = await generateQuiz(notes, true);
      } else {
        notes = processedText;
        quiz = await generateQuiz(notes);
      }
    }

    await db.createConversation({
      user: req.user?.id || 'anonymous',
      query: 'File Upload',
      response: notes,
      source: 'upload',
      metadata: {
        fileType: req.file.mimetype,
        advancedMode,
        images: images.map(img => img.url)
      }
    });

    res.json({ 
      success: true, 
      notes,
      quiz,
      images,
      metadata: {
        advancedMode,
        containsImages: images.length > 0
      }
    });
  } catch (error) {
    console.error('File processing error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'File processing failed' 
    });
  }
});

app.post('/api/generate', [
  body('query').isString().trim().notEmpty().withMessage('User message is required'),
  body('subject').isString().trim().notEmpty().withMessage('Subject is required'),
  body('course').isString().trim().notEmpty().withMessage('Course is required'),
  body('classLevel').optional().isString().trim(),
  body('yearSem').optional().isString().trim(),
  body('importantTopics').optional().isString().trim(),
  body('formatPreference')
    .isIn(['bullet-points', 'paragraph', 'outline', 'qna', 'visual-notes'])
    .withMessage('Invalid format preference'),
  body('userId').optional().isString().trim(),
  body('advancedMode').optional().isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array()
    });
  }

  try {
    const { 
      query,
      subject,
      course,
      classLevel,
      yearSem,
      importantTopics,
      formatPreference,
      userId,
      advancedMode
    } = req.body;

    const fullQuery = `${query}\n\nAdditional Context:\n` +
      `- Course: ${course}\n` +
      `- Subject: ${subject}\n` +
      (classLevel ? `- Class Level: ${classLevel}\n` : '') +
      (yearSem ? `- Year/Semester: ${yearSem}\n` : '') +
      (importantTopics ? `- Important Topics: ${importantTopics}\n` : '') +
      `- Format Preference: ${formatPreference}` +
      (advancedMode ? `\n- Note Type: Advanced (with diagrams, examples, and enhanced formatting)` : '');

    let notes, quiz, images = [];
    
    if (advancedMode) {
      const result = await generateAdvancedNotes(fullQuery);
      notes = result.notes;
      images = result.images;
      quiz = await generateQuiz(notes, true);
    } else {
      notes = await generateNotes(fullQuery);
      quiz = await generateQuiz(notes);
    }

    await db.createConversation({ 
      user: userId || 'anonymous',
      query: fullQuery,
      response: notes,
      source: 'api',
      metadata: {
        subject,
        course,
        classLevel,
        yearSem,
        importantTopics,
        formatPreference,
        advancedMode,
        images: images.map(img => img.url)
      }
    });

    res.json({ 
      success: true,
      notes,
      quiz,
      images,
      metadata: {
        formatUsed: formatPreference,
        isAdvanced: advancedMode,
        containsImages: images.length > 0
      }
    });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate notes',
      details: error.message
    });
  }
});

// API Endpoints
app.post('/api/upload', uploadLimiter, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded or invalid file type' 
      });
    }

    let notes, quiz;
    const advancedMode = req.body.advancedMode === 'true';

    if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(req.file.buffer);
      notes = await generateNotes(data.text, advancedMode);
      quiz = await generateQuiz(notes);
    } else if (req.file.mimetype.startsWith('image/')) {
      const query = req.body.query || 'Extract key information from this image and create detailed study notes';
      notes = await processImage(req.file.buffer, req.file.mimetype, query);
      quiz = await generateQuiz(notes);
    }

    const conversation = await db.createConversation({
      user: req.user?.id || 'anonymous',
      query: 'File Upload',
      response: notes,
      source: 'upload',
      metadata: {
        fileType: req.file.mimetype,
        advancedMode
      }
    });

    res.json({ 
      success: true, 
      notes,
      quiz,
      metadata: {
        fileType: req.file.mimetype,
        advancedMode
      }
    });
  } catch (error) {
    console.error('File processing error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'File processing failed' 
    });
  }
});

app.post('/api/generate', [
  body('query').isString().trim().notEmpty().withMessage('User message is required'),
  body('subject').isString().trim().notEmpty().withMessage('Subject is required'),
  body('course').isString().trim().notEmpty().withMessage('Course is required'),
  body('classLevel').optional().isString().trim(),
  body('yearSem').optional().isString().trim(),
  body('importantTopics').optional().isString().trim(),
  body('formatPreference')
    .isIn(['bullet-points', 'paragraph', 'outline', 'qna'])
    .withMessage('Invalid format preference'),
  body('userId').optional().isString().trim(),
  body('advancedMode').optional().isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array()
    });
  }

  try {
    const { 
      query,
      subject,
      course,
      classLevel,
      yearSem,
      importantTopics,
      formatPreference,
      userId,
      advancedMode
    } = req.body;

    console.log('Generating notes for:', {
      subject,
      course,
      classLevel,
      format: formatPreference,
      advancedMode
    });

    const fullQuery = `${query}\n\nAdditional Context:\n` +
      `- Course: ${course}\n` +
      `- Subject: ${subject}\n` +
      (classLevel ? `- Class Level: ${classLevel}\n` : '') +
      (yearSem ? `- Year/Semester: ${yearSem}\n` : '') +
      (importantTopics ? `- Important Topics: ${importantTopics}\n` : '') +
      `- Format Preference: ${formatPreference}` +
      (advancedMode ? `\n- Note Type: Advanced (with diagrams, examples, and enhanced formatting)` : '');

    const [apiData, notes] = await Promise.all([
      fetchDataFromAPIs(fullQuery),
      generateNotes(fullQuery, advancedMode)
    ]);
    
    const quiz = await generateQuiz(notes);

    await db.createConversation({ 
      user: userId || 'anonymous',
      query: fullQuery,
      response: notes,
      source: 'api',
      metadata: {
        subject,
        course,
        classLevel,
        yearSem,
        importantTopics,
        formatPreference,
        advancedMode
      }
    });

    res.json({ 
      success: true,
      notes,
      quiz,
      additionalData: apiData,
      metadata: {
        formatUsed: formatPreference,
        isAdvanced: advancedMode
      }
    });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate notes',
      details: error.message
    });
  }
});

app.post('/api/contact', generalLimiter, [
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('message').isString().trim().notEmpty().withMessage('Message is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    const { name, email, message } = req.body;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      replyTo: email,
      to: process.env.EMAIL_USER,
      subject: `Contact Form Submission from ${name}`,
      text: `From: ${name} <${email}>\n\nMessage:\n${message}`,
      html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
             <p><strong>Message:</strong></p>
             <p>${message.replace(/\n/g, '<br>')}</p>`
    };

    await transporter.sendMail(mailOptions);
    res.json({ 
      success: true, 
      message: 'Email sent successfully' 
    });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Email sending failed. Please try again later.' 
    });
  }
});

// Error Handling
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'POST /api/generate',
      'POST /api/upload',
      'POST /api/contact'
    ]
  });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    message: err.message
  });
});

// Server Startup
const startServer = async () => {
  try {
    await db.connect();
    
    const server = app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
      console.log(`API Documentation: http://localhost:${config.port}/`);
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(async () => {
        await db.disconnect();
        process.exit(0);
      });
    });

    //for save submission history
    app.post('/api/submissions', async (req, res) => {
      const { userId, code, language, input, output } = req.body;
      const submission = new Submission({ userId, code, language, input, output, date: new Date() });
      await submission.save();
      res.status(201).json({ message: 'Saved' });
    });
    

    process.on('SIGINT', () => {
      console.log('SIGINT received. Shutting down gracefully...');
      server.close(async () => {
        await db.disconnect();
        process.exit(0);
      });
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();