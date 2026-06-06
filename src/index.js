import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import apiRouter from './api.js';
import adminRouter from './admin-api.js';
import { createBot } from './bot.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);
app.use('/api/admin', adminRouter);
app.use(express.static(path.join(__dirname, '../webapp')));
app.get('/admin', (_, res) => res.sendFile(path.join(__dirname, '../webapp/admin.html')));
app.get('*', (_, res) => res.sendFile(path.join(__dirname, '../webapp/index.html')));

app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));

if (!process.env.BOT_TOKEN || process.env.BOT_TOKEN === 'fake') {
  console.warn('⚠️  BOT_TOKEN not set — bot disabled');
} else {
  const bot = createBot();
  bot.start({ onStart: () => console.log('🤖 Bot started'), drop_pending_updates: true })
    .catch(e => console.error('Bot error:', e.message));
}
