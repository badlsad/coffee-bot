import { Router } from 'express';
import { Readable } from 'stream';
import db from './db.js';

const router = Router();
const photoCache = new Map(); // fileId -> { filePath, expires }

router.get('/categories', async (req, res) => {
  const cats = await db.category.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { drinks: { where: { isActive: true } } } } },
  });
  res.json(cats);
});

router.get('/categories/:id/drinks', async (req, res) => {
  const drinks = await db.drink.findMany({
    where: { categoryId: +req.params.id, isActive: true },
    select: { id: true, name: true, description: true, photoFileId: true },
    orderBy: { name: 'asc' },
  });
  res.json(drinks);
});

router.get('/drinks/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);
  const drinks = await db.drink.findMany({
    where: { name: { contains: q }, isActive: true },
    include: { category: { select: { name: true, emoji: true } } },
    take: 20,
  });
  res.json(drinks);
});

router.get('/drinks/:id', async (req, res) => {
  const drink = await db.drink.findUnique({
    where: { id: +req.params.id },
    include: {
      category: true,
      sizes: { include: { ingredients: { orderBy: { order: 'asc' } } }, orderBy: { id: 'asc' } },
      steps: { orderBy: { order: 'asc' } },
      techParams: true,
    },
  });
  if (!drink) return res.status(404).json({ error: 'Not found' });
  res.json(drink);
});

router.get('/photo/:fileId', async (req, res) => {
  const { fileId } = req.params;
  const TOKEN = process.env.BOT_TOKEN;

  try {
    const cached = photoCache.get(fileId);
    let filePath = cached?.expires > Date.now() ? cached.filePath : null;

    if (!filePath) {
      const r = await fetch(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${fileId}`);
      const data = await r.json();
      if (!data.ok) return res.status(404).send('Not found');
      filePath = data.result.file_path;
      photoCache.set(fileId, { filePath, expires: Date.now() + 3_600_000 });
    }

    const imgRes = await fetch(`https://api.telegram.org/file/bot${TOKEN}/${filePath}`);
    if (!imgRes.ok) return res.status(404).send('Not found');

    res.setHeader('Content-Type', imgRes.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    Readable.fromWeb(imgRes.body).pipe(res);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
