import { Bot, InlineKeyboard } from 'grammy';
import db from './db.js';

export function createBot() {
  const bot = new Bot(process.env.BOT_TOKEN);
  const ADMIN_IDS = (process.env.ADMIN_IDS || '').split(',').map(Number).filter(Boolean);
  const WEBAPP_URL = process.env.WEBAPP_URL;

  // Multi-step admin flows: chatId -> { type, step, data }
  const flows = new Map();

  const isAdmin = ctx => ADMIN_IDS.includes(ctx.from?.id);

  const adminOnly = async (ctx, next) => {
    if (!isAdmin(ctx)) return ctx.reply('❌ Нет доступа');
    return next();
  };

  function nextStep(id) {
    return `Добавьте размеры: /newsize ${id} S 150\nДобавьте ингредиенты: /newingredient [sizeId] Эспрессо 30 мл\nДобавьте шаги: /newstep ${id} Текст шага\nДобавьте параметры: /newtechparam ${id} Температура 65 °C`;
  }

  // ─── Пользовательские команды ────────────────────────────────────────────────

  const isHttps = WEBAPP_URL?.startsWith('https://');

  bot.command('start', async ctx => {
    if (!WEBAPP_URL) return ctx.reply('Бот настраивается, попробуйте позже.');
    if (isHttps) {
      const kb = new InlineKeyboard().webApp('☕ Открыть тех. карту', WEBAPP_URL);
      return ctx.reply(
        '👋 Привет! Я помогу найти рецепт любого напитка.\n\nНажми кнопку ниже, чтобы открыть тех. карту:',
        { reply_markup: kb }
      );
    }
    await ctx.reply(
      `👋 Привет! Я помогу найти рецепт любого напитка.\n\nОткрой тех. карту: ${WEBAPP_URL}`
    );
  });

  bot.command('search', async ctx => {
    const q = ctx.message.text.replace('/search', '').trim();
    if (!q) return ctx.reply('Использование: /search <название напитка>');

    const drinks = await db.drink.findMany({
      where: { name: { contains: q }, isActive: true },
      include: { category: true },
      take: 10,
    });

    if (!drinks.length) return ctx.reply(`По запросу "${q}" ничего не найдено.`);

    if (isHttps) {
      const kb = new InlineKeyboard();
      drinks.forEach(d => {
        kb.webApp(`${d.category.emoji} ${d.name}`, `${WEBAPP_URL}#drink_${d.id}`).row();
      });
      return ctx.reply(`🔍 Найдено: ${drinks.length}`, { reply_markup: kb });
    }
    const list = drinks.map(d => `${d.category.emoji} ${d.name}: ${WEBAPP_URL}#drink_${d.id}`).join('\n');
    await ctx.reply(`🔍 Найдено: ${drinks.length}\n\n${list}`);
  });

  // ─── Админ-команды ───────────────────────────────────────────────────────────

  bot.command('admin', adminOnly, async ctx => {
    const [cats, drinks] = await Promise.all([db.category.count(), db.drink.count()]);
    await ctx.reply(
      `⚙️ *Панель администратора*\n\n` +
      `Категорий: ${cats} | Напитков: ${drinks}\n\n` +
      `*Категории*\n` +
      `/listcategories — список\n` +
      `/newcategory ☕ Название\n` +
      `/delcategory [id]\n\n` +
      `*Напитки*\n` +
      `/listdrinks — список\n` +
      `/newdrink — добавить (диалог)\n` +
      `/deldrink [id]\n` +
      `/toggledrink [id] — вкл/выкл\n\n` +
      `*Рецепт*\n` +
      `/newsize [drinkId] [S/M/L] [мл]\n` +
      `/listsizes [drinkId]\n` +
      `/newingredient [sizeId] [название] [кол-во] [ед]\n` +
      `/newstep [drinkId] [текст]\n` +
      `/newtechparam [drinkId] [название] [значение] [ед]\n` +
      `/clearsteps [drinkId]\n` +
      `/clearparams [drinkId]\n` +
      `/clearingredients [sizeId]`,
      { parse_mode: 'Markdown' }
    );
  });

  bot.command('listcategories', adminOnly, async ctx => {
    const cats = await db.category.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { drinks: true } } },
    });
    if (!cats.length) return ctx.reply('Категорий нет. Добавьте: /newcategory ☕ Название');
    const text = cats.map(c => `[${c.id}] ${c.emoji} ${c.name} — ${c._count.drinks} напитков`).join('\n');
    await ctx.reply(`📂 Категории:\n\n${text}`);
  });

  bot.command('newcategory', adminOnly, async ctx => {
    const parts = ctx.message.text.split(' ').slice(1);
    if (parts.length < 2) return ctx.reply('Использование: /newcategory ☕ Название');
    const emoji = parts[0];
    const name = parts.slice(1).join(' ');
    const last = await db.category.findFirst({ orderBy: { order: 'desc' } });
    const cat = await db.category.create({ data: { emoji, name, order: (last?.order ?? 0) + 1 } });
    await ctx.reply(`✅ Категория создана: [${cat.id}] ${cat.emoji} ${cat.name}`);
  });

  bot.command('delcategory', adminOnly, async ctx => {
    const id = parseInt(ctx.message.text.split(' ')[1]);
    if (!id) return ctx.reply('Использование: /delcategory [id]');
    await db.category.delete({ where: { id } });
    await ctx.reply(`🗑️ Категория #${id} удалена`);
  });

  bot.command('listdrinks', adminOnly, async ctx => {
    const drinks = await db.drink.findMany({
      orderBy: { id: 'asc' },
      include: { category: true },
    });
    if (!drinks.length) return ctx.reply('Напитков нет.');
    const text = drinks
      .map(d => `${d.isActive ? '✅' : '⛔'} [${d.id}] ${d.name} (${d.category.emoji}${d.category.name})`)
      .join('\n');
    await ctx.reply(`☕ Напитки:\n\n${text}`);
  });

  // Интерактивный диалог добавления напитка
  bot.command('newdrink', adminOnly, async ctx => {
    const cats = await db.category.findMany({ orderBy: { order: 'asc' } });
    if (!cats.length) return ctx.reply('Сначала создайте категории: /newcategory ☕ Название');

    const kb = new InlineKeyboard();
    cats.forEach(c => kb.text(`${c.emoji} ${c.name}`, `flow:cat:${c.id}`).row());
    kb.text('❌ Отмена', 'flow:cancel');

    flows.set(ctx.chat.id, { type: 'newdrink', step: 'category', data: {} });
    await ctx.reply('Выберите категорию:', { reply_markup: kb });
  });

  bot.command('deldrink', adminOnly, async ctx => {
    const id = parseInt(ctx.message.text.split(' ')[1]);
    if (!id) return ctx.reply('Использование: /deldrink [id]');
    await db.drink.delete({ where: { id } });
    await ctx.reply(`🗑️ Напиток #${id} удалён`);
  });

  bot.command('toggledrink', adminOnly, async ctx => {
    const id = parseInt(ctx.message.text.split(' ')[1]);
    if (!id) return ctx.reply('Использование: /toggledrink [id]');
    const drink = await db.drink.findUnique({ where: { id } });
    if (!drink) return ctx.reply('Напиток не найден');
    const updated = await db.drink.update({ where: { id }, data: { isActive: !drink.isActive } });
    await ctx.reply(`${updated.isActive ? '✅ Включён' : '⛔ Выключен'}: ${updated.name}`);
  });

  bot.command('newsize', adminOnly, async ctx => {
    const parts = ctx.message.text.split(' ').slice(1);
    if (parts.length < 2) return ctx.reply('Использование: /newsize [drinkId] [S/M/L] [мл]\nПример: /newsize 1 S 150');
    const [drinkId, label, vol] = parts;
    const size = await db.drinkSize.create({
      data: { drinkId: parseInt(drinkId), label: label.toUpperCase(), volumeMl: vol ? parseInt(vol) : null },
    });
    await ctx.reply(
      `✅ Размер добавлен: [sizeId: ${size.id}] ${size.label}${size.volumeMl ? ` (${size.volumeMl} мл)` : ''}\n` +
      `Добавьте ингредиенты: /newingredient ${size.id} Эспрессо 30 мл`
    );
  });

  bot.command('listsizes', adminOnly, async ctx => {
    const id = parseInt(ctx.message.text.split(' ')[1]);
    if (!id) return ctx.reply('Использование: /listsizes [drinkId]');
    const sizes = await db.drinkSize.findMany({
      where: { drinkId: id },
      include: { ingredients: { orderBy: { order: 'asc' } } },
    });
    if (!sizes.length) return ctx.reply('Размеров нет');
    const text = sizes.map(s => {
      const ingrs = s.ingredients.length
        ? s.ingredients.map(i => `  • ${i.name}: ${i.amount} ${i.unit}`).join('\n')
        : '  (нет ингредиентов)';
      return `[sizeId:${s.id}] ${s.label}${s.volumeMl ? ` (${s.volumeMl}мл)` : ''}\n${ingrs}`;
    }).join('\n\n');
    await ctx.reply(text);
  });

  bot.command('newingredient', adminOnly, async ctx => {
    // /newingredient [sizeId] [название через пробел] [кол-во] [ед]
    const args = ctx.message.text.split(' ').slice(1);
    if (args.length < 4) return ctx.reply(
      'Использование: /newingredient [sizeId] [название] [кол-во] [ед]\n' +
      'Пример: /newingredient 1 Молоко цельное 200 мл'
    );
    const sizeId = parseInt(args.shift());
    const unit = args.pop();
    const amount = args.pop();
    const name = args.join(' ');
    const last = await db.ingredient.findFirst({ where: { drinkSizeId: sizeId }, orderBy: { order: 'desc' } });
    const ingr = await db.ingredient.create({
      data: { drinkSizeId: sizeId, name, amount, unit, order: (last?.order ?? 0) + 1 },
    });
    await ctx.reply(`✅ ${ingr.name}: ${ingr.amount} ${ingr.unit}`);
  });

  bot.command('newstep', adminOnly, async ctx => {
    const parts = ctx.message.text.split(' ');
    const drinkId = parseInt(parts[1]);
    const description = parts.slice(2).join(' ');
    if (!drinkId || !description) return ctx.reply('Использование: /newstep [drinkId] [текст шага]');
    const last = await db.step.findFirst({ where: { drinkId }, orderBy: { order: 'desc' } });
    const step = await db.step.create({ data: { drinkId, description, order: (last?.order ?? 0) + 1 } });
    await ctx.reply(`✅ Шаг #${step.order}: ${step.description}`);
  });

  bot.command('newtechparam', adminOnly, async ctx => {
    // /newtechparam [drinkId] [название] [значение] [ед]
    const args = ctx.message.text.split(' ').slice(1);
    if (args.length < 3) return ctx.reply(
      'Использование: /newtechparam [drinkId] [название] [значение] [ед]\n' +
      'Пример: /newtechparam 1 Температура 65 °C'
    );
    const drinkId = parseInt(args.shift());
    const unit = args.length >= 3 ? args.pop() : '';
    const value = args.pop();
    const name = args.join(' ');
    const param = await db.techParam.create({ data: { drinkId, name, value, unit } });
    await ctx.reply(`✅ ${param.name}: ${param.value} ${param.unit}`);
  });

  bot.command('clearsteps', adminOnly, async ctx => {
    const id = parseInt(ctx.message.text.split(' ')[1]);
    if (!id) return ctx.reply('Использование: /clearsteps [drinkId]');
    await db.step.deleteMany({ where: { drinkId: id } });
    await ctx.reply(`✅ Шаги напитка #${id} очищены`);
  });

  bot.command('clearparams', adminOnly, async ctx => {
    const id = parseInt(ctx.message.text.split(' ')[1]);
    if (!id) return ctx.reply('Использование: /clearparams [drinkId]');
    await db.techParam.deleteMany({ where: { drinkId: id } });
    await ctx.reply(`✅ Параметры напитка #${id} очищены`);
  });

  bot.command('clearingredients', adminOnly, async ctx => {
    const id = parseInt(ctx.message.text.split(' ')[1]);
    if (!id) return ctx.reply('Использование: /clearingredients [sizeId]');
    await db.ingredient.deleteMany({ where: { drinkSizeId: id } });
    await ctx.reply(`✅ Ингредиенты размера #${id} очищены`);
  });

  // ─── Обработка flow callbacks ────────────────────────────────────────────────

  bot.on('callback_query:data', async ctx => {
    const data = ctx.callbackQuery.data;
    if (!data.startsWith('flow:')) return ctx.answerCallbackQuery();

    if (!isAdmin(ctx)) return ctx.answerCallbackQuery('❌ Нет доступа');
    await ctx.answerCallbackQuery();

    if (data === 'flow:cancel') {
      flows.delete(ctx.chat.id);
      return ctx.editMessageText('❌ Отменено');
    }

    const flow = flows.get(ctx.chat.id);
    if (!flow) return ctx.editMessageText('Сессия истекла, начните заново: /newdrink');

    // Выбор категории
    if (data.startsWith('flow:cat:') && flow.step === 'category') {
      flow.data.categoryId = parseInt(data.split(':')[2]);
      flow.step = 'name';
      return ctx.editMessageText('Введите название напитка:');
    }

    // Пропустить описание → сразу создать напиток
    if (data === 'flow:skipdesc' && flow.step === 'description') {
      flow.data.description = null;
      const drink = await db.drink.create({
        data: { name: flow.data.name, categoryId: flow.data.categoryId, description: null },
      });
      flow.data.drinkId = drink.id;
      flow.step = 'photo';
      const kb = new InlineKeyboard().text('⏩ Без фото', 'flow:skipphoto');
      return ctx.editMessageText(
        `✅ Напиток "${drink.name}" создан (id: ${drink.id})\n\nОтправьте фото напитка или пропустите:`,
        { reply_markup: kb }
      );
    }

    // Пропустить фото
    if (data === 'flow:skipphoto' && flow.step === 'photo') {
      const id = flow.data.drinkId;
      flows.delete(ctx.chat.id);
      return ctx.editMessageText(`✅ Готово! Напиток #${id} создан.\n\n${nextStep(id)}`);
    }
  });

  // ─── Обработка текстовых сообщений в flow ────────────────────────────────────

  bot.on('message:text', async ctx => {
    if (!isAdmin(ctx)) return;
    const flow = flows.get(ctx.chat.id);
    if (!flow || flow.type !== 'newdrink') return;

    if (flow.step === 'name') {
      flow.data.name = ctx.message.text.trim();
      flow.step = 'description';
      const kb = new InlineKeyboard().text('⏩ Пропустить', 'flow:skipdesc').text('❌ Отмена', 'flow:cancel');
      return ctx.reply('Введите описание напитка:', { reply_markup: kb });
    }

    if (flow.step === 'description') {
      flow.data.description = ctx.message.text.trim();
      const drink = await db.drink.create({
        data: { name: flow.data.name, categoryId: flow.data.categoryId, description: flow.data.description },
      });
      flow.data.drinkId = drink.id;
      flow.step = 'photo';
      const kb = new InlineKeyboard().text('⏩ Без фото', 'flow:skipphoto');
      return ctx.reply(
        `✅ Напиток "${drink.name}" создан (id: ${drink.id})\n\nОтправьте фото напитка или пропустите:`,
        { reply_markup: kb }
      );
    }
  });

  // ─── Фото в flow ─────────────────────────────────────────────────────────────

  bot.on('message:photo', async ctx => {
    if (!isAdmin(ctx)) return;
    const flow = flows.get(ctx.chat.id);
    if (flow?.type !== 'newdrink' || flow.step !== 'photo') return;

    const photo = ctx.message.photo.at(-1);
    await db.drink.update({ where: { id: flow.data.drinkId }, data: { photoFileId: photo.file_id } });
    const id = flow.data.drinkId;
    flows.delete(ctx.chat.id);
    await ctx.reply(`📸 Фото сохранено! Напиток #${id} готов.\n\n${nextStep(id)}`);
  });

  return bot;
}
