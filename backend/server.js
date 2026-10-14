'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => {
  res.json({
    service: 'TARA API',
    status: 'ok',
    message: 'TARA backend is online. AI and sync endpoints are not configured yet.'
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'tara-api',
    time: new Date().toISOString()
  });
});

// Keep unfinished features explicit rather than pretending to sync or answer with AI.
app.all('/api/*path', (_req, res) => {
  res.status(501).json({
    ok: false,
    error: 'not_implemented',
    message: 'This TARA API feature has not been implemented yet.'
  });
});

const port = Number(process.env.PORT) || 10000;
app.listen(port, '0.0.0.0', () => {
  console.log(`TARA API listening on port ${port}`);
});
