import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import { webhookCallback } from 'grammy';
import apiRouter from './api.js';
import adminRouter from './admin-api.js';
import { createBot } from './bot.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT       = process.env.PORT || 3000;
const WEBAPP_URL = process.env.WEBAPP_URL;
const BOT_TOKEN  = process.env.BOT_TOKEN;

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);
app.use('/api/admin', adminRouter);
app.use(express.static(path.join(__dirname, '../webapp')));
app.get('/admin', (_, res) => res.sendFile(path.join(__dirname, '../webapp/admin.html')));
app.get('*', (_, res) => res.sendFile(path.join(__dirname, '../webapp/index.html')));

app.listen(PORT, async () => {
  console.log(`🚀 Server: ${WEBAPP_URL || `http://localhost:${PORT}`}`);

  if (!BOT_TOKEN) {
    console.warn('⚠️  BOT_TOKEN not set — bot disabled');
    return;
  }

  const bot = createBot();
  bot.catch(e => console.error('Bot error:', e.message));

  if (WEBAPP_URL) {
    const webhookUrl = `${WEBAPP_URL}/webhook`;
    app.post('/webhook', webhookCallback(bot, 'express'));
    await bot.api.setWebhook(webhookUrl);
    console.log(`🤖 Bot webhook: ${webhookUrl}`);
  } else {
    bot.start({ onStart: () => console.log('🤖 Bot polling'), drop_pending_updates: true })
      .catch(e => console.error('Bot error:', e.message));
  }
});
