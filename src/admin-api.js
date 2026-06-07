import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import db from './db.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

router.use((req, res, next) => {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return res.status(503).json({ error: 'Admin disabled: set ADMIN_SECRET' });
  if (req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// ─── Categories ───────────────────────────────────────────────────────────────

router.get('/categories', async (req, res) => {
  const cats = await db.category.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { drinks: true } } },
  });
  res.json(cats);
});

router.post('/categories', async (req, res) => {
  const { name, emoji } = req.body;
  if (!name || !emoji) return res.status(400).json({ error: 'name and emoji required' });
  const last = await db.category.findFirst({ orderBy: { order: 'desc' } });
  const cat = await db.category.create({ data: { name, emoji, order: (last?.order ?? 0) + 1 } });
  res.json(cat);
});

router.put('/categories/:id', async (req, res) => {
  const { name, emoji, order } = req.body;
  const data = {};
  if (name  !== undefined) data.name  = name;
  if (emoji !== undefined) data.emoji = emoji;
  if (order !== undefined) data.order = +order;
  const cat = await db.category.update({ where: { id: +req.params.id }, data });
  res.json(cat);
});

router.delete('/categories/:id', async (req, res) => {
  await db.category.delete({ where: { id: +req.params.id } });
  res.json({ ok: true });
});

// ─── Drinks ───────────────────────────────────────────────────────────────────

router.get('/drinks', async (req, res) => {
  const drinks = await db.drink.findMany({
    include: { category: { select: { name: true, emoji: true } } },
    orderBy: [{ categoryId: 'asc' }, { name: 'asc' }],
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

router.post('/drinks', async (req, res) => {
  const { name, description, categoryId } = req.body;
  if (!name || !categoryId) return res.status(400).json({ error: 'name and categoryId required' });
  const drink = await db.drink.create({ data: { name, description: description || null, categoryId: +categoryId } });
  res.json(drink);
});

router.put('/drinks/:id', async (req, res) => {
  const { name, description, categoryId, isActive } = req.body;
  const data = {};
  if (name        !== undefined) data.name        = name;
  if (description !== undefined) data.description = description || null;
  if (categoryId  !== undefined) data.categoryId  = +categoryId;
  if (isActive    !== undefined) data.isActive     = isActive;
  const drink = await db.drink.update({ where: { id: +req.params.id }, data });
  res.json(drink);
});

router.delete('/drinks/:id', async (req, res) => {
  await db.drink.delete({ where: { id: +req.params.id } });
  res.json({ ok: true });
});

// ─── Sizes ────────────────────────────────────────────────────────────────────

router.post('/drinks/:id/sizes', async (req, res) => {
  const { label, volumeMl } = req.body;
  if (!label) return res.status(400).json({ error: 'label required' });
  const size = await db.drinkSize.create({
    data: { drinkId: +req.params.id, label, volumeMl: volumeMl ? +volumeMl : null },
  });
  res.json(size);
});

router.put('/sizes/:id', async (req, res) => {
  const { label, volumeMl } = req.body;
  const size = await db.drinkSize.update({
    where: { id: +req.params.id },
    data: { label, volumeMl: volumeMl ? +volumeMl : null },
  });
  res.json(size);
});

router.delete('/sizes/:id', async (req, res) => {
  await db.drinkSize.delete({ where: { id: +req.params.id } });
  res.json({ ok: true });
});

// ─── Ingredients ──────────────────────────────────────────────────────────────

router.post('/sizes/:id/ingredients', async (req, res) => {
  const { name, amount, unit } = req.body;
  if (!name || !amount || !unit) return res.status(400).json({ error: 'name, amount, unit required' });
  const last = await db.ingredient.findFirst({
    where: { drinkSizeId: +req.params.id }, orderBy: { order: 'desc' },
  });
  const ingr = await db.ingredient.create({
    data: { drinkSizeId: +req.params.id, name, amount, unit, order: (last?.order ?? 0) + 1 },
  });
  res.json(ingr);
});

router.put('/ingredients/:id', async (req, res) => {
  const { name, amount, unit } = req.body;
  const data = {};
  if (name   !== undefined) data.name   = name;
  if (amount !== undefined) data.amount = amount;
  if (unit   !== undefined) data.unit   = unit;
  const ingr = await db.ingredient.update({ where: { id: +req.params.id }, data });
  res.json(ingr);
});

router.delete('/ingredients/:id', async (req, res) => {
  await db.ingredient.delete({ where: { id: +req.params.id } });
  res.json({ ok: true });
});

// ─── Steps ────────────────────────────────────────────────────────────────────

router.post('/drinks/:id/steps', async (req, res) => {
  const { description } = req.body;
  if (!description) return res.status(400).json({ error: 'description required' });
  const last = await db.step.findFirst({ where: { drinkId: +req.params.id }, orderBy: { order: 'desc' } });
  const step = await db.step.create({
    data: { drinkId: +req.params.id, description, order: (last?.order ?? 0) + 1 },
  });
  res.json(step);
});

router.put('/steps/:id', async (req, res) => {
  const { description } = req.body;
  const step = await db.step.update({ where: { id: +req.params.id }, data: { description } });
  res.json(step);
});

router.delete('/steps/:id', async (req, res) => {
  await db.step.delete({ where: { id: +req.params.id } });
  res.json({ ok: true });
});

// ─── Tech Params ──────────────────────────────────────────────────────────────

router.post('/drinks/:id/params', async (req, res) => {
  const { name, value, unit } = req.body;
  if (!name || !value) return res.status(400).json({ error: 'name and value required' });
  const param = await db.techParam.create({
    data: { drinkId: +req.params.id, name, value, unit: unit || '' },
  });
  res.json(param);
});

router.put('/params/:id', async (req, res) => {
  const { name, value, unit } = req.body;
  const data = {};
  if (name  !== undefined) data.name  = name;
  if (value !== undefined) data.value = value;
  if (unit  !== undefined) data.unit  = unit;
  const param = await db.techParam.update({ where: { id: +req.params.id }, data });
  res.json(param);
});

router.delete('/params/:id', async (req, res) => {
  await db.techParam.delete({ where: { id: +req.params.id } });
  res.json({ ok: true });
});

// ─── Photo upload ─────────────────────────────────────────────────────────────

router.post('/drinks/:id/photo', upload.single('photo'), async (req, res) => {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (!cloudinaryUrl) return res.status(503).json({ error: 'CLOUDINARY_URL not configured' });

  if (!req.file) return res.status(400).json({ error: 'No file' });

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'coffee-bot', resource_type: 'image' },
      (err, r) => err ? reject(err) : resolve(r)
    ).end(req.file.buffer);
  });

  const drink = await db.drink.update({
    where: { id: +req.params.id },
    data: { photoUrl: result.secure_url },
  });
  res.json({ photoUrl: drink.photoUrl });
});

router.delete('/drinks/:id/photo', async (req, res) => {
  await db.drink.update({ where: { id: +req.params.id }, data: { photoUrl: null, photoFileId: null } });
  res.json({ ok: true });
});

export default router;
