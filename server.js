import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Environment validation
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

// Logger
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type}] ${message}`);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Trading Signal Endpoint
app.post('/api/signal', async (req, res) => {
  try {
    // Validate API key
    if (!CLAUDE_API_KEY) {
      log('Missing CLAUDE_API_KEY environment variable', 'ERROR');
      return res.status(500).json({
        error: 'Server configuration error: API key not set',
        hint: 'Set CLAUDE_API_KEY in .env file'
      });
    }

    const { pair, strategy, price } = req.body;

    // Validate request
    if (!pair || !strategy || price === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: pair, strategy, price'
      });
    }

    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({
        error: 'Price must be a positive number'
      });
    }

    log(`Signal request: ${pair} @ $${price} using ${strategy}`, 'REQUEST');

    // Create Claude prompt
    const prompt = `You are an expert crypto trading analyst. Generate a trading signal for ${pair}.

Current price: $${price}
Strategy: ${strategy}

Return ONLY a raw JSON object (no markdown, no backticks) with this exact structure:
{"action":"BUY","confidence":82,"reason":"Bullish technical setup","sl":3050,"tp":3300}

Requirements:
- action MUST be: BUY, SELL, or HOLD
- confidence: number 0-100
- reason: brief analysis (max 50 chars)
- sl: stop loss price (optional, number)
- tp: take profit price (optional, number)

Return ONLY valid JSON.`;

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      log(`Claude API error: ${response.status}`, 'ERROR');
      
      if (response.status === 401) {
        return res.status(401).json({
          error: 'Invalid API key. Check your CLAUDE_API_KEY in .env'
        });
      }
      if (response.status === 429) {
        return res.status(429).json({
          error: 'Rate limited. Please wait before trying again.'
        });
      }
      
      return res.status(response.status).json({
        error: errorData.error?.message || 'Claude API error'
      });
    }

    const data = await response.json();
    let rawText = data.content?.[0]?.text || '{}';

    // Clean up response (remove markdown if present)
    rawText = rawText.replace(/```json|```/g, '').trim();

    // Parse JSON
    let signal;
    try {
      signal = JSON.parse(rawText);
    } catch (parseError) {
      log(`Failed to parse Claude response: ${rawText}`, 'WARN');
      return res.status(500).json({
        error: 'Failed to parse AI response. Try again.'
      });
    }

    // Validate parsed signal
    const validActions = ['BUY', 'SELL', 'HOLD'];
    if (!validActions.includes(signal.action)) {
      signal.action = 'HOLD';
    }

    if (typeof signal.confidence !== 'number' || signal.confidence < 0 || signal.confidence > 100) {
      signal.confidence = 50;
    }

    log(`Signal generated: ${signal.action} (confidence: ${signal.confidence}%)`, 'SUCCESS');

    res.json({
      success: true,
      pair,
      strategy,
      price,
      ...signal,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    log(`Unexpected error: ${error.message}`, 'ERROR');
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Market Analysis Endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    if (!CLAUDE_API_KEY) {
      return res.status(500).json({
        error: 'Server configuration error: API key not set'
      });
    }

    const { question } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({
        error: 'Missing required field: question (string)'
      });
    }

    if (question.length > 500) {
      return res.status(400).json({
        error: 'Question too long (max 500 characters)'
      });
    }

    log(`Analysis request: ${question.substring(0, 50)}...`, 'REQUEST');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `You are a crypto trading expert. Answer this question briefly (2-3 sentences max): ${question}`
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({
        error: errorData.error?.message || 'Claude API error'
      });
    }

    const data = await response.json();
    const analysis = data.content?.[0]?.text || 'No analysis available';

    log(`Analysis completed`, 'SUCCESS');

    res.json({
      success: true,
      question,
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    log(`Unexpected error: ${error.message}`, 'ERROR');
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Start server
app.listen(PORT, () => {
  log(`Server started on http://localhost:${PORT}`, 'START');
  log(`Health check: GET http://localhost:${PORT}/health`, 'INFO');
  log(`Signal API: POST http://localhost:${PORT}/api/signal`, 'INFO');
  log(`Analysis API: POST http://localhost:${PORT}/api/analyze`, 'INFO');
  log(`Environment: ${process.env.NODE_ENV || 'development'}`, 'INFO');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log('SIGTERM received, shutting down gracefully...', 'WARN');
  process.exit(0);
});

process.on('SIGINT', () => {
  log('SIGINT received, shutting down...', 'WARN');
  process.exit(0);
});
