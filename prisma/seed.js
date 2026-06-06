import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  console.log('🌱 Заполняю базу данных...');

  const catEspresso = await db.category.create({ data: { emoji: '☕', name: 'Эспрессо', order: 1 } });
  const catMilk     = await db.category.create({ data: { emoji: '🥛', name: 'Молочные', order: 2 } });
  const catCold     = await db.category.create({ data: { emoji: '🧊', name: 'Холодные', order: 3 } });
  const catTea      = await db.category.create({ data: { emoji: '🍵', name: 'Чай', order: 4 } });
  const catSpecial  = await db.category.create({ data: { emoji: '✨', name: 'Спешиалы', order: 5 } });

  // ─── ЭСПРЕССО ────────────────────────────────────────────────────────────────

  const espresso = await db.drink.create({
    data: { name: 'Эспрессо', categoryId: catEspresso.id, description: 'Классический итальянский эспрессо — основа всех кофейных напитков' },
  });
  const eSingle = await db.drinkSize.create({ data: { drinkId: espresso.id, label: 'Single', volumeMl: 30 } });
  const eDouble = await db.drinkSize.create({ data: { drinkId: espresso.id, label: 'Double', volumeMl: 60 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: eSingle.id, name: 'Кофе молотый', amount: '7',  unit: 'г',  order: 1 },
    { drinkSizeId: eSingle.id, name: 'Вода',         amount: '30', unit: 'мл', order: 2 },
    { drinkSizeId: eDouble.id, name: 'Кофе молотый', amount: '14', unit: 'г',  order: 1 },
    { drinkSizeId: eDouble.id, name: 'Вода',         amount: '60', unit: 'мл', order: 2 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: espresso.id, order: 1, description: 'Прогреть портафильтр горячей водой' },
    { drinkId: espresso.id, order: 2, description: 'Смолоть кофе до мелкого помола, насыпать в корзину' },
    { drinkId: espresso.id, order: 3, description: 'Равномерно распределить и утрамбовать темпером' },
    { drinkId: espresso.id, order: 4, description: 'Вставить портафильтр, запустить экстракцию' },
    { drinkId: espresso.id, order: 5, description: 'Остановить при нужном объёме (25–30 сек)' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: espresso.id, name: 'Температура воды', value: '93',    unit: '°C'  },
    { drinkId: espresso.id, name: 'Давление',         value: '9',     unit: 'бар' },
    { drinkId: espresso.id, name: 'Время экстракции', value: '25–30', unit: 'сек' },
    { drinkId: espresso.id, name: 'Помол',            value: 'мелкий', unit: ''   },
  ]});

  // Ристретто
  const ristretto = await db.drink.create({
    data: { name: 'Ристретто', categoryId: catEspresso.id, description: 'Концентрированный эспрессо с более сладким вкусом и меньшей горечью' },
  });
  const ristS = await db.drinkSize.create({ data: { drinkId: ristretto.id, label: 'Single', volumeMl: 15 } });
  const ristD = await db.drinkSize.create({ data: { drinkId: ristretto.id, label: 'Double', volumeMl: 30 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: ristS.id, name: 'Кофе молотый', amount: '7',  unit: 'г',  order: 1 },
    { drinkSizeId: ristS.id, name: 'Вода',         amount: '15', unit: 'мл', order: 2 },
    { drinkSizeId: ristD.id, name: 'Кофе молотый', amount: '14', unit: 'г',  order: 1 },
    { drinkSizeId: ristD.id, name: 'Вода',         amount: '30', unit: 'мл', order: 2 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: ristretto.id, order: 1, description: 'Смолоть кофе чуть мельче стандартного эспрессо' },
    { drinkId: ristretto.id, order: 2, description: 'Дозировка та же, что для эспрессо' },
    { drinkId: ristretto.id, order: 3, description: 'Остановить экстракцию при объёме 15 мл (15–20 сек)' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: ristretto.id, name: 'Температура воды', value: '93',    unit: '°C'  },
    { drinkId: ristretto.id, name: 'Время экстракции', value: '15–20', unit: 'сек' },
    { drinkId: ristretto.id, name: 'Соотношение',      value: '1:2',   unit: ''    },
  ]});

  // Лунго
  const lungo = await db.drink.create({
    data: { name: 'Лунго', categoryId: catEspresso.id, description: 'Длинный эспрессо — больше воды, более лёгкий вкус' },
  });
  const lungoS = await db.drinkSize.create({ data: { drinkId: lungo.id, label: 'Single', volumeMl: 60 } });
  const lungoD = await db.drinkSize.create({ data: { drinkId: lungo.id, label: 'Double', volumeMl: 120 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: lungoS.id, name: 'Кофе молотый', amount: '7',  unit: 'г',  order: 1 },
    { drinkSizeId: lungoS.id, name: 'Вода',         amount: '60', unit: 'мл', order: 2 },
    { drinkSizeId: lungoD.id, name: 'Кофе молотый', amount: '14', unit: 'г',  order: 1 },
    { drinkSizeId: lungoD.id, name: 'Вода',         amount: '120', unit: 'мл', order: 2 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: lungo.id, order: 1, description: 'Смолоть кофе чуть крупнее стандартного эспрессо' },
    { drinkId: lungo.id, order: 2, description: 'Запустить экстракцию, не останавливать до 60 мл' },
    { drinkId: lungo.id, order: 3, description: 'Время экстракции — 35–45 секунд' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: lungo.id, name: 'Температура воды', value: '93',    unit: '°C'  },
    { drinkId: lungo.id, name: 'Время экстракции', value: '35–45', unit: 'сек' },
  ]});

  // Кортадо
  const cortado = await db.drink.create({
    data: { name: 'Кортадо', categoryId: catEspresso.id, description: 'Эспрессо, разрезанный небольшим количеством горячего молока' },
  });
  const cortS = await db.drinkSize.create({ data: { drinkId: cortado.id, label: 'Стандарт', volumeMl: 90 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: cortS.id, name: 'Двойной эспрессо', amount: '60', unit: 'мл', order: 1 },
    { drinkSizeId: cortS.id, name: 'Молоко',           amount: '30', unit: 'мл', order: 2 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: cortado.id, order: 1, description: 'Приготовить двойной эспрессо в стакане Gibraltar' },
    { drinkId: cortado.id, order: 2, description: 'Взбить молоко до лёгкой микропены (60°C)' },
    { drinkId: cortado.id, order: 3, description: 'Влить молоко поверх эспрессо в соотношении 1:0.5' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: cortado.id, name: 'Температура молока', value: '60', unit: '°C'  },
    { drinkId: cortado.id, name: 'Соотношение',        value: '2:1', unit: ''   },
  ]});

  // Эспрессо Маккиато
  const macchiato = await db.drink.create({
    data: { name: 'Маккиато', categoryId: catEspresso.id, description: 'Эспрессо с небольшой каплей взбитого молока' },
  });
  const macS = await db.drinkSize.create({ data: { drinkId: macchiato.id, label: 'Single', volumeMl: 40 } });
  const macD = await db.drinkSize.create({ data: { drinkId: macchiato.id, label: 'Double', volumeMl: 70 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: macS.id, name: 'Эспрессо', amount: '30', unit: 'мл', order: 1 },
    { drinkSizeId: macS.id, name: 'Молочная пена', amount: '10', unit: 'мл', order: 2 },
    { drinkSizeId: macD.id, name: 'Двойной эспрессо', amount: '60', unit: 'мл', order: 1 },
    { drinkSizeId: macD.id, name: 'Молочная пена',    amount: '10', unit: 'мл', order: 2 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: macchiato.id, order: 1, description: 'Приготовить эспрессо' },
    { drinkId: macchiato.id, order: 2, description: 'Взбить небольшое количество молока до плотной пены' },
    { drinkId: macchiato.id, order: 3, description: 'Аккуратно выложить ложку пены поверх эспрессо' },
  ]});

  // Американо
  const americano = await db.drink.create({
    data: { name: 'Американо', categoryId: catEspresso.id, description: 'Эспрессо разбавленный горячей водой' },
  });
  const amS = await db.drinkSize.create({ data: { drinkId: americano.id, label: 'S', volumeMl: 150 } });
  const amM = await db.drinkSize.create({ data: { drinkId: americano.id, label: 'M', volumeMl: 250 } });
  const amL = await db.drinkSize.create({ data: { drinkId: americano.id, label: 'L', volumeMl: 350 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: amS.id, name: 'Эспрессо', amount: '30',  unit: 'мл', order: 1 },
    { drinkSizeId: amS.id, name: 'Вода',     amount: '120', unit: 'мл', order: 2 },
    { drinkSizeId: amM.id, name: 'Эспрессо', amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: amM.id, name: 'Вода',     amount: '190', unit: 'мл', order: 2 },
    { drinkSizeId: amL.id, name: 'Эспрессо', amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: amL.id, name: 'Вода',     amount: '290', unit: 'мл', order: 2 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: americano.id, order: 1, description: 'Приготовить эспрессо' },
    { drinkId: americano.id, order: 2, description: 'Добавить горячую воду (85°C) в чашку' },
    { drinkId: americano.id, order: 3, description: 'Влить эспрессо поверх воды' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: americano.id, name: 'Температура воды', value: '85', unit: '°C' },
  ]});

  // ─── МОЛОЧНЫЕ ────────────────────────────────────────────────────────────────

  const cappuccino = await db.drink.create({
    data: { name: 'Капучино', categoryId: catMilk.id, description: 'Эспрессо с нежной молочной пенкой 1–2 см' },
  });
  const capS = await db.drinkSize.create({ data: { drinkId: cappuccino.id, label: 'S', volumeMl: 150 } });
  const capM = await db.drinkSize.create({ data: { drinkId: cappuccino.id, label: 'M', volumeMl: 200 } });
  const capL = await db.drinkSize.create({ data: { drinkId: cappuccino.id, label: 'L', volumeMl: 300 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: capS.id, name: 'Эспрессо',     amount: '30',  unit: 'мл', order: 1 },
    { drinkSizeId: capS.id, name: 'Молоко',        amount: '100', unit: 'мл', order: 2 },
    { drinkSizeId: capS.id, name: 'Молочная пена', amount: '20',  unit: 'мл', order: 3 },
    { drinkSizeId: capM.id, name: 'Эспрессо',     amount: '30',  unit: 'мл', order: 1 },
    { drinkSizeId: capM.id, name: 'Молоко',        amount: '150', unit: 'мл', order: 2 },
    { drinkSizeId: capM.id, name: 'Молочная пена', amount: '20',  unit: 'мл', order: 3 },
    { drinkSizeId: capL.id, name: 'Эспрессо',     amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: capL.id, name: 'Молоко',        amount: '200', unit: 'мл', order: 2 },
    { drinkSizeId: capL.id, name: 'Молочная пена', amount: '40',  unit: 'мл', order: 3 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: cappuccino.id, order: 1, description: 'Приготовить эспрессо в прогретую чашку' },
    { drinkId: cappuccino.id, order: 2, description: 'Взбить молоко: температура 60–65°C, пена плотная 1–2 см' },
    { drinkId: cappuccino.id, order: 3, description: 'Влить молоко круговым движением по стенке' },
    { drinkId: cappuccino.id, order: 4, description: 'Нанести рисунок латте-арт по желанию' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: cappuccino.id, name: 'Температура молока', value: '60–65', unit: '°C' },
    { drinkId: cappuccino.id, name: 'Высота пенки',       value: '1–2',   unit: 'см' },
    { drinkId: cappuccino.id, name: 'Жирность молока',    value: '3.2',   unit: '%'  },
  ]});

  const latte = await db.drink.create({
    data: { name: 'Латте', categoryId: catMilk.id, description: 'Мягкий напиток с большим количеством молока и тонкой пенкой' },
  });
  const latS = await db.drinkSize.create({ data: { drinkId: latte.id, label: 'S', volumeMl: 250 } });
  const latM = await db.drinkSize.create({ data: { drinkId: latte.id, label: 'M', volumeMl: 350 } });
  const latL = await db.drinkSize.create({ data: { drinkId: latte.id, label: 'L', volumeMl: 450 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: latS.id, name: 'Эспрессо',     amount: '30',  unit: 'мл', order: 1 },
    { drinkSizeId: latS.id, name: 'Молоко',        amount: '210', unit: 'мл', order: 2 },
    { drinkSizeId: latS.id, name: 'Молочная пена', amount: '10',  unit: 'мл', order: 3 },
    { drinkSizeId: latM.id, name: 'Эспрессо',     amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: latM.id, name: 'Молоко',        amount: '270', unit: 'мл', order: 2 },
    { drinkSizeId: latM.id, name: 'Молочная пена', amount: '20',  unit: 'мл', order: 3 },
    { drinkSizeId: latL.id, name: 'Эспрессо',     amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: latL.id, name: 'Молоко',        amount: '370', unit: 'мл', order: 2 },
    { drinkSizeId: latL.id, name: 'Молочная пена', amount: '20',  unit: 'мл', order: 3 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: latte.id, order: 1, description: 'Приготовить двойной эспрессо' },
    { drinkId: latte.id, order: 2, description: 'Взбить молоко: температура 65°C, пена тонкая 0.5–1 см' },
    { drinkId: latte.id, order: 3, description: 'Медленно влить молоко в эспрессо, держа питчер низко' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: latte.id, name: 'Температура молока', value: '65',    unit: '°C' },
    { drinkId: latte.id, name: 'Высота пенки',       value: '0.5–1', unit: 'см' },
    { drinkId: latte.id, name: 'Жирность молока',    value: '3.2',   unit: '%'  },
  ]});

  const flatWhite = await db.drink.create({
    data: { name: 'Флэт уайт', categoryId: catMilk.id, description: 'Концентрированный молочный напиток с микропеной' },
  });
  const fwS = await db.drinkSize.create({ data: { drinkId: flatWhite.id, label: 'S', volumeMl: 160 } });
  const fwM = await db.drinkSize.create({ data: { drinkId: flatWhite.id, label: 'M', volumeMl: 220 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: fwS.id, name: 'Эспрессо (ристретто)', amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: fwS.id, name: 'Молоко',               amount: '100', unit: 'мл', order: 2 },
    { drinkSizeId: fwM.id, name: 'Эспрессо (ристретто)', amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: fwM.id, name: 'Молоко',               amount: '160', unit: 'мл', order: 2 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: flatWhite.id, order: 1, description: 'Приготовить двойной ристретто' },
    { drinkId: flatWhite.id, order: 2, description: 'Взбить молоко до шелковистой микропены (60°C)' },
    { drinkId: flatWhite.id, order: 3, description: 'Влить молоко тонкой струёй, сохраняя ламинарный поток' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: flatWhite.id, name: 'Температура молока', value: '60',     unit: '°C' },
    { drinkId: flatWhite.id, name: 'Пена',               value: 'микропена', unit: '' },
    { drinkId: flatWhite.id, name: 'Жирность молока',    value: '3.5',    unit: '%'  },
  ]});

  const raf = await db.drink.create({
    data: { name: 'Раф кофе', categoryId: catMilk.id, description: 'Сливочный кофейный напиток с нежной текстурой' },
  });
  const rafS = await db.drinkSize.create({ data: { drinkId: raf.id, label: 'S', volumeMl: 200 } });
  const rafM = await db.drinkSize.create({ data: { drinkId: raf.id, label: 'M', volumeMl: 300 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: rafS.id, name: 'Эспрессо',       amount: '30',  unit: 'мл', order: 1 },
    { drinkSizeId: rafS.id, name: 'Сливки 33%',     amount: '100', unit: 'мл', order: 2 },
    { drinkSizeId: rafS.id, name: 'Молоко',         amount: '60',  unit: 'мл', order: 3 },
    { drinkSizeId: rafS.id, name: 'Ванильный сахар', amount: '5',  unit: 'г',  order: 4 },
    { drinkSizeId: rafM.id, name: 'Эспрессо',       amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: rafM.id, name: 'Сливки 33%',     amount: '150', unit: 'мл', order: 2 },
    { drinkSizeId: rafM.id, name: 'Молоко',         amount: '80',  unit: 'мл', order: 3 },
    { drinkSizeId: rafM.id, name: 'Ванильный сахар', amount: '5',  unit: 'г',  order: 4 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: raf.id, order: 1, description: 'Смешать сливки и молоко в питчере' },
    { drinkId: raf.id, order: 2, description: 'Добавить ванильный сахар' },
    { drinkId: raf.id, order: 3, description: 'Добавить эспрессо' },
    { drinkId: raf.id, order: 4, description: 'Взбить капучинатором до однородной нежной пены' },
    { drinkId: raf.id, order: 5, description: 'Перелить в прогретую чашку' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: raf.id, name: 'Температура', value: '65–70', unit: '°C' },
    { drinkId: raf.id, name: 'Жирность',   value: '33',    unit: '%'  },
  ]});

  // Мокко
  const mocco = await db.drink.create({
    data: { name: 'Мокко', categoryId: catMilk.id, description: 'Кофейно-шоколадный напиток на основе эспрессо' },
  });
  const mocS = await db.drinkSize.create({ data: { drinkId: mocco.id, label: 'S', volumeMl: 250 } });
  const mocM = await db.drinkSize.create({ data: { drinkId: mocco.id, label: 'M', volumeMl: 350 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: mocS.id, name: 'Эспрессо',          amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: mocS.id, name: 'Шоколадный сироп',  amount: '20',  unit: 'мл', order: 2 },
    { drinkSizeId: mocS.id, name: 'Молоко',            amount: '150', unit: 'мл', order: 3 },
    { drinkSizeId: mocS.id, name: 'Взбитые сливки',    amount: '20',  unit: 'мл', order: 4 },
    { drinkSizeId: mocM.id, name: 'Эспрессо',          amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: mocM.id, name: 'Шоколадный сироп',  amount: '30',  unit: 'мл', order: 2 },
    { drinkSizeId: mocM.id, name: 'Молоко',            amount: '230', unit: 'мл', order: 3 },
    { drinkSizeId: mocM.id, name: 'Взбитые сливки',    amount: '30',  unit: 'мл', order: 4 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: mocco.id, order: 1, description: 'На дно чашки налить шоколадный сироп' },
    { drinkId: mocco.id, order: 2, description: 'Приготовить двойной эспрессо поверх сиропа, перемешать' },
    { drinkId: mocco.id, order: 3, description: 'Взбить молоко до микропены 65°C, влить в чашку' },
    { drinkId: mocco.id, order: 4, description: 'Добавить взбитые сливки, украсить шоколадной крошкой' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: mocco.id, name: 'Температура молока', value: '65',    unit: '°C' },
    { drinkId: mocco.id, name: 'Шоколадный сироп',   value: 'тёмный 65%', unit: '' },
  ]});

  // Пикколо латте
  const piccolo = await db.drink.create({
    data: { name: 'Пикколо латте', categoryId: catMilk.id, description: 'Мини-латте с насыщенным кофейным вкусом в стакане 100 мл' },
  });
  const picS = await db.drinkSize.create({ data: { drinkId: piccolo.id, label: 'Стандарт', volumeMl: 100 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: picS.id, name: 'Ристретто',  amount: '30', unit: 'мл', order: 1 },
    { drinkSizeId: picS.id, name: 'Молоко',     amount: '60', unit: 'мл', order: 2 },
    { drinkSizeId: picS.id, name: 'Молочная пена', amount: '10', unit: 'мл', order: 3 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: piccolo.id, order: 1, description: 'Приготовить одинарный ристретто в стакан 100 мл' },
    { drinkId: piccolo.id, order: 2, description: 'Взбить молоко до лёгкой микропены (60°C)' },
    { drinkId: piccolo.id, order: 3, description: 'Осторожно влить молоко поверх ристретто' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: piccolo.id, name: 'Температура молока', value: '60', unit: '°C' },
    { drinkId: piccolo.id, name: 'Объём стакана',      value: '100', unit: 'мл' },
  ]});

  // ─── ХОЛОДНЫЕ ────────────────────────────────────────────────────────────────

  const iceLatte = await db.drink.create({
    data: { name: 'Айс латте', categoryId: catCold.id, description: 'Холодный латте со льдом' },
  });
  const ilS = await db.drinkSize.create({ data: { drinkId: iceLatte.id, label: 'S', volumeMl: 300 } });
  const ilM = await db.drinkSize.create({ data: { drinkId: iceLatte.id, label: 'M', volumeMl: 400 } });
  const ilL = await db.drinkSize.create({ data: { drinkId: iceLatte.id, label: 'L', volumeMl: 500 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: ilS.id, name: 'Эспрессо', amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: ilS.id, name: 'Молоко',   amount: '180', unit: 'мл', order: 2 },
    { drinkSizeId: ilS.id, name: 'Лёд',      amount: '60',  unit: 'г',  order: 3 },
    { drinkSizeId: ilM.id, name: 'Эспрессо', amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: ilM.id, name: 'Молоко',   amount: '270', unit: 'мл', order: 2 },
    { drinkSizeId: ilM.id, name: 'Лёд',      amount: '70',  unit: 'г',  order: 3 },
    { drinkSizeId: ilL.id, name: 'Эспрессо', amount: '90',  unit: 'мл', order: 1 },
    { drinkSizeId: ilL.id, name: 'Молоко',   amount: '340', unit: 'мл', order: 2 },
    { drinkSizeId: ilL.id, name: 'Лёд',      amount: '70',  unit: 'г',  order: 3 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: iceLatte.id, order: 1, description: 'Заполнить стакан льдом' },
    { drinkId: iceLatte.id, order: 2, description: 'Влить холодное молоко' },
    { drinkId: iceLatte.id, order: 3, description: 'Приготовить эспрессо и влить поверх молока' },
  ]});

  const coldBrew = await db.drink.create({
    data: { name: 'Колд брю', categoryId: catCold.id, description: 'Холодное заваривание 18–24 часа' },
  });
  const cbS = await db.drinkSize.create({ data: { drinkId: coldBrew.id, label: 'S', volumeMl: 250 } });
  const cbM = await db.drinkSize.create({ data: { drinkId: coldBrew.id, label: 'M', volumeMl: 350 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: cbS.id, name: 'Колд брю концентрат', amount: '80',  unit: 'мл', order: 1 },
    { drinkSizeId: cbS.id, name: 'Холодная вода',       amount: '120', unit: 'мл', order: 2 },
    { drinkSizeId: cbS.id, name: 'Лёд',                 amount: '50',  unit: 'г',  order: 3 },
    { drinkSizeId: cbM.id, name: 'Колд брю концентрат', amount: '120', unit: 'мл', order: 1 },
    { drinkSizeId: cbM.id, name: 'Холодная вода',       amount: '160', unit: 'мл', order: 2 },
    { drinkSizeId: cbM.id, name: 'Лёд',                 amount: '70',  unit: 'г',  order: 3 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: coldBrew.id, order: 1, description: 'Заполнить стакан льдом' },
    { drinkId: coldBrew.id, order: 2, description: 'Влить концентрат колд брю' },
    { drinkId: coldBrew.id, order: 3, description: 'Добавить холодную воду, аккуратно перемешать' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: coldBrew.id, name: 'Заваривание',      value: '18–24',   unit: 'ч'  },
    { drinkId: coldBrew.id, name: 'Температура воды', value: '4–10',    unit: '°C' },
    { drinkId: coldBrew.id, name: 'Помол',            value: 'крупный', unit: ''   },
    { drinkId: coldBrew.id, name: 'Соотношение',      value: '1:8',     unit: ''   },
  ]});

  // Айс американо
  const iceAmericano = await db.drink.create({
    data: { name: 'Айс американо', categoryId: catCold.id, description: 'Классический американо на льду' },
  });
  const iaS = await db.drinkSize.create({ data: { drinkId: iceAmericano.id, label: 'S', volumeMl: 250 } });
  const iaM = await db.drinkSize.create({ data: { drinkId: iceAmericano.id, label: 'M', volumeMl: 350 } });
  const iaL = await db.drinkSize.create({ data: { drinkId: iceAmericano.id, label: 'L', volumeMl: 450 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: iaS.id, name: 'Эспрессо',     amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: iaS.id, name: 'Холодная вода', amount: '130', unit: 'мл', order: 2 },
    { drinkSizeId: iaS.id, name: 'Лёд',           amount: '60',  unit: 'г',  order: 3 },
    { drinkSizeId: iaM.id, name: 'Эспрессо',     amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: iaM.id, name: 'Холодная вода', amount: '220', unit: 'мл', order: 2 },
    { drinkSizeId: iaM.id, name: 'Лёд',           amount: '70',  unit: 'г',  order: 3 },
    { drinkSizeId: iaL.id, name: 'Эспрессо',     amount: '90',  unit: 'мл', order: 1 },
    { drinkSizeId: iaL.id, name: 'Холодная вода', amount: '290', unit: 'мл', order: 2 },
    { drinkSizeId: iaL.id, name: 'Лёд',           amount: '70',  unit: 'г',  order: 3 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: iceAmericano.id, order: 1, description: 'Заполнить стакан льдом' },
    { drinkId: iceAmericano.id, order: 2, description: 'Налить холодную воду поверх льда' },
    { drinkId: iceAmericano.id, order: 3, description: 'Приготовить эспрессо и влить поверх воды' },
  ]});

  // Шейкерато
  const shakerato = await db.drink.create({
    data: { name: 'Шейкерато', categoryId: catCold.id, description: 'Взбитый со льдом эспрессо с нежной пеной' },
  });
  const shS = await db.drinkSize.create({ data: { drinkId: shakerato.id, label: 'Стандарт', volumeMl: 120 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: shS.id, name: 'Двойной эспрессо', amount: '60', unit: 'мл', order: 1 },
    { drinkSizeId: shS.id, name: 'Сахарный сироп',   amount: '10', unit: 'мл', order: 2 },
    { drinkSizeId: shS.id, name: 'Лёд',              amount: '80', unit: 'г',  order: 3 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: shakerato.id, order: 1, description: 'Приготовить двойной эспрессо, дать остыть 30 секунд' },
    { drinkId: shakerato.id, order: 2, description: 'Наполнить шейкер льдом, добавить эспрессо и сироп' },
    { drinkId: shakerato.id, order: 3, description: 'Энергично взбивать 10–15 секунд' },
    { drinkId: shakerato.id, order: 4, description: 'Процедить через стрейнер в охлаждённый бокал' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: shakerato.id, name: 'Время взбивания', value: '10–15', unit: 'сек' },
  ]});

  // Эспрессо тоник
  const espressoTonic = await db.drink.create({
    data: { name: 'Эспрессо тоник', categoryId: catCold.id, description: 'Освежающий микс эспрессо и тоника со льдом' },
  });
  const etS = await db.drinkSize.create({ data: { drinkId: espressoTonic.id, label: 'S', volumeMl: 250 } });
  const etM = await db.drinkSize.create({ data: { drinkId: espressoTonic.id, label: 'M', volumeMl: 350 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: etS.id, name: 'Двойной эспрессо', amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: etS.id, name: 'Тоник',            amount: '140', unit: 'мл', order: 2 },
    { drinkSizeId: etS.id, name: 'Лёд',              amount: '50',  unit: 'г',  order: 3 },
    { drinkSizeId: etM.id, name: 'Двойной эспрессо', amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: etM.id, name: 'Тоник',            amount: '240', unit: 'мл', order: 2 },
    { drinkSizeId: etM.id, name: 'Лёд',              amount: '50',  unit: 'г',  order: 3 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: espressoTonic.id, order: 1, description: 'Наполнить высокий стакан льдом' },
    { drinkId: espressoTonic.id, order: 2, description: 'Медленно влить хорошо охлаждённый тоник' },
    { drinkId: espressoTonic.id, order: 3, description: 'Аккуратно влить эспрессо поверх тоника — не перемешивать' },
    { drinkId: espressoTonic.id, order: 4, description: 'Украсить долькой лайма или апельсина по желанию' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: espressoTonic.id, name: 'Тоник',        value: 'несладкий', unit: '' },
    { drinkId: espressoTonic.id, name: 'Перемешивать', value: 'нет',       unit: '' },
  ]});

  // ─── ЧАЙ ─────────────────────────────────────────────────────────────────────

  const blackTea = await db.drink.create({
    data: { name: 'Чёрный чай', categoryId: catTea.id, description: 'Классический заварной чёрный чай' },
  });
  const btS = await db.drinkSize.create({ data: { drinkId: blackTea.id, label: 'S', volumeMl: 200 } });
  const btM = await db.drinkSize.create({ data: { drinkId: blackTea.id, label: 'M', volumeMl: 350 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: btS.id, name: 'Чай листовой', amount: '3', unit: 'г',   order: 1 },
    { drinkSizeId: btS.id, name: 'Вода',         amount: '200', unit: 'мл', order: 2 },
    { drinkSizeId: btM.id, name: 'Чай листовой', amount: '5', unit: 'г',   order: 1 },
    { drinkSizeId: btM.id, name: 'Вода',         amount: '350', unit: 'мл', order: 2 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: blackTea.id, order: 1, description: 'Ополоснуть чайник кипятком' },
    { drinkId: blackTea.id, order: 2, description: 'Засыпать чай, залить водой 95°C' },
    { drinkId: blackTea.id, order: 3, description: 'Заварить 3–4 минуты, перелить в чашку' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: blackTea.id, name: 'Температура воды', value: '95',  unit: '°C'  },
    { drinkId: blackTea.id, name: 'Время заварки',    value: '3–4', unit: 'мин' },
  ]});

  // Зелёный чай
  const greenTea = await db.drink.create({
    data: { name: 'Зелёный чай', categoryId: catTea.id, description: 'Деликатный зелёный чай с травянистым ароматом' },
  });
  const gtS = await db.drinkSize.create({ data: { drinkId: greenTea.id, label: 'S', volumeMl: 200 } });
  const gtM = await db.drinkSize.create({ data: { drinkId: greenTea.id, label: 'M', volumeMl: 350 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: gtS.id, name: 'Зелёный чай листовой', amount: '3', unit: 'г',   order: 1 },
    { drinkSizeId: gtS.id, name: 'Вода',                 amount: '200', unit: 'мл', order: 2 },
    { drinkSizeId: gtM.id, name: 'Зелёный чай листовой', amount: '5', unit: 'г',   order: 1 },
    { drinkSizeId: gtM.id, name: 'Вода',                 amount: '350', unit: 'мл', order: 2 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: greenTea.id, order: 1, description: 'Охладить кипяток до 75–80°C (не заваривать кипятком!)' },
    { drinkId: greenTea.id, order: 2, description: 'Прогреть чайник горячей водой, слить' },
    { drinkId: greenTea.id, order: 3, description: 'Засыпать чай, залить водой 75–80°C' },
    { drinkId: greenTea.id, order: 4, description: 'Заварить 2–3 минуты, перелить' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: greenTea.id, name: 'Температура воды', value: '75–80', unit: '°C'  },
    { drinkId: greenTea.id, name: 'Время заварки',    value: '2–3',   unit: 'мин' },
  ]});

  // Матча
  const matcha = await db.drink.create({
    data: { name: 'Матча', categoryId: catTea.id, description: 'Японский порошковый зелёный чай, взбитый венчиком' },
  });
  const matS = await db.drinkSize.create({ data: { drinkId: matcha.id, label: 'Стандарт', volumeMl: 150 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: matS.id, name: 'Матча порошок', amount: '2',  unit: 'г',  order: 1 },
    { drinkSizeId: matS.id, name: 'Вода',          amount: '60', unit: 'мл', order: 2 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: matcha.id, order: 1, description: 'Просеять порошок матча через сито в чашку' },
    { drinkId: matcha.id, order: 2, description: 'Добавить небольшое количество воды (70°C), растереть пастой' },
    { drinkId: matcha.id, order: 3, description: 'Добавить оставшуюся воду, взбить венчиком до однородной пены' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: matcha.id, name: 'Температура воды', value: '70',    unit: '°C' },
    { drinkId: matcha.id, name: 'Сорт',             value: 'ceremonial grade', unit: '' },
  ]});

  // Масала чай
  const masalaTea = await db.drink.create({
    data: { name: 'Масала чай', categoryId: catTea.id, description: 'Индийский пряный чай с молоком и специями' },
  });
  const masS = await db.drinkSize.create({ data: { drinkId: masalaTea.id, label: 'S', volumeMl: 200 } });
  const masM = await db.drinkSize.create({ data: { drinkId: masalaTea.id, label: 'M', volumeMl: 300 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: masS.id, name: 'Чёрный чай крепкий', amount: '80',  unit: 'мл', order: 1 },
    { drinkSizeId: masS.id, name: 'Молоко',             amount: '80',  unit: 'мл', order: 2 },
    { drinkSizeId: masS.id, name: 'Смесь специй масала', amount: '2', unit: 'г',  order: 3 },
    { drinkSizeId: masS.id, name: 'Мёд или сахар',      amount: '5',  unit: 'г',  order: 4 },
    { drinkSizeId: masM.id, name: 'Чёрный чай крепкий', amount: '120', unit: 'мл', order: 1 },
    { drinkSizeId: masM.id, name: 'Молоко',             amount: '120', unit: 'мл', order: 2 },
    { drinkSizeId: masM.id, name: 'Смесь специй масала', amount: '3', unit: 'г',  order: 3 },
    { drinkSizeId: masM.id, name: 'Мёд или сахар',      amount: '5',  unit: 'г',  order: 4 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: masalaTea.id, order: 1, description: 'Заварить крепкий чёрный чай (5 г / 200 мл, 5 мин)' },
    { drinkId: masalaTea.id, order: 2, description: 'Смешать чай и молоко в сотейнике, добавить специи' },
    { drinkId: masalaTea.id, order: 3, description: 'Нагреть почти до кипения, не давая закипеть' },
    { drinkId: masalaTea.id, order: 4, description: 'Процедить в чашку, добавить мёд по вкусу' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: masalaTea.id, name: 'Специи', value: 'кардамон, имбирь, корица, гвоздика', unit: '' },
  ]});

  // ─── СПЕШИАЛЫ ────────────────────────────────────────────────────────────────

  // Матча латте
  const matchaLatte = await db.drink.create({
    data: { name: 'Матча латте', categoryId: catSpecial.id, description: 'Нежный латте на основе японского порошкового чая матча' },
  });
  const mlS = await db.drinkSize.create({ data: { drinkId: matchaLatte.id, label: 'S', volumeMl: 250 } });
  const mlM = await db.drinkSize.create({ data: { drinkId: matchaLatte.id, label: 'M', volumeMl: 350 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: mlS.id, name: 'Матча порошок',  amount: '3',   unit: 'г',  order: 1 },
    { drinkSizeId: mlS.id, name: 'Горячая вода',   amount: '40',  unit: 'мл', order: 2 },
    { drinkSizeId: mlS.id, name: 'Молоко',         amount: '180', unit: 'мл', order: 3 },
    { drinkSizeId: mlS.id, name: 'Сироп агавы',    amount: '10',  unit: 'мл', order: 4 },
    { drinkSizeId: mlM.id, name: 'Матча порошок',  amount: '4',   unit: 'г',  order: 1 },
    { drinkSizeId: mlM.id, name: 'Горячая вода',   amount: '50',  unit: 'мл', order: 2 },
    { drinkSizeId: mlM.id, name: 'Молоко',         amount: '260', unit: 'мл', order: 3 },
    { drinkSizeId: mlM.id, name: 'Сироп агавы',    amount: '10',  unit: 'мл', order: 4 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: matchaLatte.id, order: 1, description: 'Просеять матча в чашку, добавить воду 70°C' },
    { drinkId: matchaLatte.id, order: 2, description: 'Взбить венчиком до однородной пасты без комков' },
    { drinkId: matchaLatte.id, order: 3, description: 'Взбить молоко до микропены (65°C)' },
    { drinkId: matchaLatte.id, order: 4, description: 'Влить молоко в матча-пасту, добавить сироп агавы' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: matchaLatte.id, name: 'Температура воды',  value: '70',              unit: '°C' },
    { drinkId: matchaLatte.id, name: 'Температура молока', value: '65',             unit: '°C' },
    { drinkId: matchaLatte.id, name: 'Сорт матча',        value: 'ceremonial grade', unit: ''  },
  ]});

  // Лавандовый латте
  const lavenderLatte = await db.drink.create({
    data: { name: 'Лавандовый латте', categoryId: catSpecial.id, description: 'Нежный латте с ароматом прованской лаванды' },
  });
  const llS = await db.drinkSize.create({ data: { drinkId: lavenderLatte.id, label: 'S', volumeMl: 250 } });
  const llM = await db.drinkSize.create({ data: { drinkId: lavenderLatte.id, label: 'M', volumeMl: 350 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: llS.id, name: 'Двойной эспрессо',    amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: llS.id, name: 'Лавандовый сироп',    amount: '15',  unit: 'мл', order: 2 },
    { drinkSizeId: llS.id, name: 'Молоко',              amount: '175', unit: 'мл', order: 3 },
    { drinkSizeId: llM.id, name: 'Двойной эспрессо',    amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: llM.id, name: 'Лавандовый сироп',    amount: '20',  unit: 'мл', order: 2 },
    { drinkSizeId: llM.id, name: 'Молоко',              amount: '270', unit: 'мл', order: 3 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: lavenderLatte.id, order: 1, description: 'Налить лавандовый сироп на дно чашки' },
    { drinkId: lavenderLatte.id, order: 2, description: 'Приготовить двойной эспрессо поверх сиропа' },
    { drinkId: lavenderLatte.id, order: 3, description: 'Взбить молоко до нежной микропены (65°C)' },
    { drinkId: lavenderLatte.id, order: 4, description: 'Влить молоко, украсить щепоткой сухой лаванды' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: lavenderLatte.id, name: 'Температура молока', value: '65', unit: '°C' },
    { drinkId: lavenderLatte.id, name: 'Декор',              value: 'сухая лаванда', unit: '' },
  ]});

  // Ореховый раф
  const hazelnutRaf = await db.drink.create({
    data: { name: 'Ореховый раф', categoryId: catSpecial.id, description: 'Сливочный раф с фундучным сиропом и карамельными нотами' },
  });
  const hrS = await db.drinkSize.create({ data: { drinkId: hazelnutRaf.id, label: 'S', volumeMl: 200 } });
  const hrM = await db.drinkSize.create({ data: { drinkId: hazelnutRaf.id, label: 'M', volumeMl: 300 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: hrS.id, name: 'Эспрессо',          amount: '30',  unit: 'мл', order: 1 },
    { drinkSizeId: hrS.id, name: 'Сливки 33%',        amount: '80',  unit: 'мл', order: 2 },
    { drinkSizeId: hrS.id, name: 'Молоко',            amount: '60',  unit: 'мл', order: 3 },
    { drinkSizeId: hrS.id, name: 'Фундучный сироп',   amount: '20',  unit: 'мл', order: 4 },
    { drinkSizeId: hrM.id, name: 'Эспрессо',          amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: hrM.id, name: 'Сливки 33%',        amount: '120', unit: 'мл', order: 2 },
    { drinkSizeId: hrM.id, name: 'Молоко',            amount: '90',  unit: 'мл', order: 3 },
    { drinkSizeId: hrM.id, name: 'Фундучный сироп',   amount: '25',  unit: 'мл', order: 4 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: hazelnutRaf.id, order: 1, description: 'Смешать сливки, молоко и фундучный сироп в питчере' },
    { drinkId: hazelnutRaf.id, order: 2, description: 'Добавить эспрессо' },
    { drinkId: hazelnutRaf.id, order: 3, description: 'Взбить капучинатором до нежной однородной пены (70°C)' },
    { drinkId: hazelnutRaf.id, order: 4, description: 'Перелить в прогретую чашку, украсить молотым фундуком' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: hazelnutRaf.id, name: 'Температура', value: '70',   unit: '°C' },
    { drinkId: hazelnutRaf.id, name: 'Декор',       value: 'молотый фундук', unit: '' },
  ]});

  // Кокосовый латте
  const coconutLatte = await db.drink.create({
    data: { name: 'Кокосовый латте', categoryId: catSpecial.id, description: 'Тропический латте на кокосовом молоке с мягкой сладостью' },
  });
  const clS = await db.drinkSize.create({ data: { drinkId: coconutLatte.id, label: 'S', volumeMl: 250 } });
  const clM = await db.drinkSize.create({ data: { drinkId: coconutLatte.id, label: 'M', volumeMl: 350 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: clS.id, name: 'Двойной эспрессо',  amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: clS.id, name: 'Кокосовое молоко',  amount: '180', unit: 'мл', order: 2 },
    { drinkSizeId: clS.id, name: 'Кокосовый сироп',   amount: '10',  unit: 'мл', order: 3 },
    { drinkSizeId: clM.id, name: 'Двойной эспрессо',  amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: clM.id, name: 'Кокосовое молоко',  amount: '270', unit: 'мл', order: 2 },
    { drinkSizeId: clM.id, name: 'Кокосовый сироп',   amount: '15',  unit: 'мл', order: 3 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: coconutLatte.id, order: 1, description: 'Приготовить двойной эспрессо' },
    { drinkId: coconutLatte.id, order: 2, description: 'Взбить кокосовое молоко до микропены (60°C)' },
    { drinkId: coconutLatte.id, order: 3, description: 'На дно чашки налить кокосовый сироп' },
    { drinkId: coconutLatte.id, order: 4, description: 'Влить эспрессо, затем кокосовое молоко' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: coconutLatte.id, name: 'Температура молока', value: '60',        unit: '°C' },
    { drinkId: coconutLatte.id, name: 'Молоко',             value: 'кокосовое', unit: ''   },
  ]});

  // Клубничный латте
  const strawberryLatte = await db.drink.create({
    data: { name: 'Клубничный латте', categoryId: catSpecial.id, description: 'Фруктовый латте с клубничным пюре и нежной молочной пеной' },
  });
  const slS = await db.drinkSize.create({ data: { drinkId: strawberryLatte.id, label: 'S', volumeMl: 300 } });
  const slM = await db.drinkSize.create({ data: { drinkId: strawberryLatte.id, label: 'M', volumeMl: 400 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: slS.id, name: 'Двойной эспрессо',   amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: slS.id, name: 'Клубничное пюре',    amount: '30',  unit: 'мл', order: 2 },
    { drinkSizeId: slS.id, name: 'Молоко',             amount: '170', unit: 'мл', order: 3 },
    { drinkSizeId: slS.id, name: 'Лёд',               amount: '40',  unit: 'г',  order: 4 },
    { drinkSizeId: slM.id, name: 'Двойной эспрессо',   amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: slM.id, name: 'Клубничное пюре',    amount: '40',  unit: 'мл', order: 2 },
    { drinkSizeId: slM.id, name: 'Молоко',             amount: '250', unit: 'мл', order: 3 },
    { drinkSizeId: slM.id, name: 'Лёд',               amount: '50',  unit: 'г',  order: 4 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: strawberryLatte.id, order: 1, description: 'На дно стакана выложить клубничное пюре' },
    { drinkId: strawberryLatte.id, order: 2, description: 'Добавить лёд' },
    { drinkId: strawberryLatte.id, order: 3, description: 'Влить холодное молоко поверх льда' },
    { drinkId: strawberryLatte.id, order: 4, description: 'Аккуратно влить эспрессо поверх — не перемешивать' },
    { drinkId: strawberryLatte.id, order: 5, description: 'Украсить половинкой свежей клубники' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: strawberryLatte.id, name: 'Подача',       value: 'холодная', unit: '' },
    { drinkId: strawberryLatte.id, name: 'Перемешивать', value: 'нет',      unit: '' },
  ]});

  // Апельсиновый американо
  const orangeAmericano = await db.drink.create({
    data: { name: 'Апельсиновый американо', categoryId: catSpecial.id, description: 'Освежающий американо с соком апельсина и льдом' },
  });
  const oaS = await db.drinkSize.create({ data: { drinkId: orangeAmericano.id, label: 'S', volumeMl: 300 } });
  const oaM = await db.drinkSize.create({ data: { drinkId: orangeAmericano.id, label: 'M', volumeMl: 400 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: oaS.id, name: 'Двойной эспрессо',    amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: oaS.id, name: 'Свежевыжатый апельсиновый сок', amount: '100', unit: 'мл', order: 2 },
    { drinkSizeId: oaS.id, name: 'Холодная вода',       amount: '80',  unit: 'мл', order: 3 },
    { drinkSizeId: oaS.id, name: 'Лёд',                 amount: '60',  unit: 'г',  order: 4 },
    { drinkSizeId: oaM.id, name: 'Двойной эспрессо',    amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: oaM.id, name: 'Свежевыжатый апельсиновый сок', amount: '150', unit: 'мл', order: 2 },
    { drinkSizeId: oaM.id, name: 'Холодная вода',       amount: '130', unit: 'мл', order: 3 },
    { drinkSizeId: oaM.id, name: 'Лёд',                 amount: '60',  unit: 'г',  order: 4 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: orangeAmericano.id, order: 1, description: 'Наполнить стакан льдом' },
    { drinkId: orangeAmericano.id, order: 2, description: 'Смешать апельсиновый сок и холодную воду, влить в стакан' },
    { drinkId: orangeAmericano.id, order: 3, description: 'Приготовить эспрессо и аккуратно влить поверх — не перемешивать' },
    { drinkId: orangeAmericano.id, order: 4, description: 'Украсить долькой апельсина' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: orangeAmericano.id, name: 'Сок',          value: 'свежевыжатый', unit: '' },
    { drinkId: orangeAmericano.id, name: 'Перемешивать', value: 'нет',          unit: '' },
  ]});

  // Тыквенный раф
  const pumpkinRaf = await db.drink.create({
    data: { name: 'Тыквенный раф', categoryId: catSpecial.id, description: 'Уютный осенний раф с тыквенным пюре и пряностями' },
  });
  const prS = await db.drinkSize.create({ data: { drinkId: pumpkinRaf.id, label: 'S', volumeMl: 200 } });
  const prM = await db.drinkSize.create({ data: { drinkId: pumpkinRaf.id, label: 'M', volumeMl: 300 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: prS.id, name: 'Эспрессо',         amount: '30',  unit: 'мл', order: 1 },
    { drinkSizeId: prS.id, name: 'Сливки 33%',       amount: '80',  unit: 'мл', order: 2 },
    { drinkSizeId: prS.id, name: 'Молоко',           amount: '60',  unit: 'мл', order: 3 },
    { drinkSizeId: prS.id, name: 'Тыквенное пюре',   amount: '20',  unit: 'г',  order: 4 },
    { drinkSizeId: prS.id, name: 'Тыквенный сироп',  amount: '15',  unit: 'мл', order: 5 },
    { drinkSizeId: prM.id, name: 'Эспрессо',         amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: prM.id, name: 'Сливки 33%',       amount: '110', unit: 'мл', order: 2 },
    { drinkSizeId: prM.id, name: 'Молоко',           amount: '90',  unit: 'мл', order: 3 },
    { drinkSizeId: prM.id, name: 'Тыквенное пюре',   amount: '30',  unit: 'г',  order: 4 },
    { drinkSizeId: prM.id, name: 'Тыквенный сироп',  amount: '20',  unit: 'мл', order: 5 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: pumpkinRaf.id, order: 1, description: 'Смешать сливки, молоко, тыквенное пюре и сироп в питчере' },
    { drinkId: pumpkinRaf.id, order: 2, description: 'Добавить эспрессо' },
    { drinkId: pumpkinRaf.id, order: 3, description: 'Взбить капучинатором до нежной пены (70°C)' },
    { drinkId: pumpkinRaf.id, order: 4, description: 'Перелить в прогретую чашку, посыпать корицей и мускатным орехом' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: pumpkinRaf.id, name: 'Температура',  value: '70',                      unit: '°C' },
    { drinkId: pumpkinRaf.id, name: 'Специи',       value: 'корица, мускатный орех',  unit: ''   },
    { drinkId: pumpkinRaf.id, name: 'Декор',        value: 'молотая корица',          unit: ''   },
  ]});

  // Малиновый раф
  const raspberryRaf = await db.drink.create({
    data: { name: 'Малиновый раф', categoryId: catSpecial.id, description: 'Ягодный раф с малиновым пюре и лёгкой кислинкой' },
  });
  const rrS = await db.drinkSize.create({ data: { drinkId: raspberryRaf.id, label: 'S', volumeMl: 200 } });
  const rrM = await db.drinkSize.create({ data: { drinkId: raspberryRaf.id, label: 'M', volumeMl: 300 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: rrS.id, name: 'Эспрессо',        amount: '30',  unit: 'мл', order: 1 },
    { drinkSizeId: rrS.id, name: 'Сливки 33%',      amount: '80',  unit: 'мл', order: 2 },
    { drinkSizeId: rrS.id, name: 'Молоко',          amount: '60',  unit: 'мл', order: 3 },
    { drinkSizeId: rrS.id, name: 'Малиновое пюре',  amount: '25',  unit: 'мл', order: 4 },
    { drinkSizeId: rrM.id, name: 'Эспрессо',        amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: rrM.id, name: 'Сливки 33%',      amount: '110', unit: 'мл', order: 2 },
    { drinkSizeId: rrM.id, name: 'Молоко',          amount: '90',  unit: 'мл', order: 3 },
    { drinkSizeId: rrM.id, name: 'Малиновое пюре',  amount: '35',  unit: 'мл', order: 4 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: raspberryRaf.id, order: 1, description: 'Смешать сливки, молоко и малиновое пюре в питчере' },
    { drinkId: raspberryRaf.id, order: 2, description: 'Добавить эспрессо' },
    { drinkId: raspberryRaf.id, order: 3, description: 'Взбить капучинатором до нежной пены (70°C)' },
    { drinkId: raspberryRaf.id, order: 4, description: 'Перелить в прогретую чашку, украсить свежей малиной' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: raspberryRaf.id, name: 'Температура', value: '70',              unit: '°C' },
    { drinkId: raspberryRaf.id, name: 'Декор',       value: 'свежая малина',   unit: ''   },
  ]});

  // Карамельный макиато
  const caramelMacchiato = await db.drink.create({
    data: { name: 'Карамельный макиато', categoryId: catSpecial.id, description: 'Слоистый напиток с карамельным сиропом, молоком и эспрессо' },
  });
  const cmS = await db.drinkSize.create({ data: { drinkId: caramelMacchiato.id, label: 'S', volumeMl: 250 } });
  const cmM = await db.drinkSize.create({ data: { drinkId: caramelMacchiato.id, label: 'M', volumeMl: 350 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: cmS.id, name: 'Двойной эспрессо',  amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: cmS.id, name: 'Молоко',            amount: '150', unit: 'мл', order: 2 },
    { drinkSizeId: cmS.id, name: 'Ванильный сироп',   amount: '15',  unit: 'мл', order: 3 },
    { drinkSizeId: cmS.id, name: 'Карамельный соус',  amount: '15',  unit: 'мл', order: 4 },
    { drinkSizeId: cmM.id, name: 'Двойной эспрессо',  amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: cmM.id, name: 'Молоко',            amount: '240', unit: 'мл', order: 2 },
    { drinkSizeId: cmM.id, name: 'Ванильный сироп',   amount: '20',  unit: 'мл', order: 3 },
    { drinkSizeId: cmM.id, name: 'Карамельный соус',  amount: '20',  unit: 'мл', order: 4 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: caramelMacchiato.id, order: 1, description: 'На дно стакана налить ванильный сироп' },
    { drinkId: caramelMacchiato.id, order: 2, description: 'Взбить молоко до микропены (65°C), влить в стакан' },
    { drinkId: caramelMacchiato.id, order: 3, description: 'Аккуратно влить эспрессо поверх молока — не перемешивать' },
    { drinkId: caramelMacchiato.id, order: 4, description: 'Нанести карамельный соус крест-накрест сверху' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: caramelMacchiato.id, name: 'Температура молока', value: '65',  unit: '°C' },
    { drinkId: caramelMacchiato.id, name: 'Перемешивать',       value: 'нет', unit: ''   },
    { drinkId: caramelMacchiato.id, name: 'Подача',             value: 'слоями', unit: '' },
  ]});

  // Айс матча латте
  const iceMatchaLatte = await db.drink.create({
    data: { name: 'Айс матча латте', categoryId: catSpecial.id, description: 'Холодный матча латте со льдом — яркий зелёный цвет и освежающий вкус' },
  });
  const imlS = await db.drinkSize.create({ data: { drinkId: iceMatchaLatte.id, label: 'S', volumeMl: 300 } });
  const imlM = await db.drinkSize.create({ data: { drinkId: iceMatchaLatte.id, label: 'M', volumeMl: 400 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: imlS.id, name: 'Матча порошок',  amount: '3',   unit: 'г',  order: 1 },
    { drinkSizeId: imlS.id, name: 'Горячая вода',   amount: '40',  unit: 'мл', order: 2 },
    { drinkSizeId: imlS.id, name: 'Молоко холодное', amount: '200', unit: 'мл', order: 3 },
    { drinkSizeId: imlS.id, name: 'Сироп агавы',    amount: '10',  unit: 'мл', order: 4 },
    { drinkSizeId: imlS.id, name: 'Лёд',            amount: '60',  unit: 'г',  order: 5 },
    { drinkSizeId: imlM.id, name: 'Матча порошок',  amount: '4',   unit: 'г',  order: 1 },
    { drinkSizeId: imlM.id, name: 'Горячая вода',   amount: '50',  unit: 'мл', order: 2 },
    { drinkSizeId: imlM.id, name: 'Молоко холодное', amount: '290', unit: 'мл', order: 3 },
    { drinkSizeId: imlM.id, name: 'Сироп агавы',    amount: '10',  unit: 'мл', order: 4 },
    { drinkSizeId: imlM.id, name: 'Лёд',            amount: '60',  unit: 'г',  order: 5 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: iceMatchaLatte.id, order: 1, description: 'Смешать матча с горячей водой 70°C, взбить до пасты' },
    { drinkId: iceMatchaLatte.id, order: 2, description: 'Добавить сироп агавы, перемешать' },
    { drinkId: iceMatchaLatte.id, order: 3, description: 'Наполнить стакан льдом' },
    { drinkId: iceMatchaLatte.id, order: 4, description: 'Влить холодное молоко' },
    { drinkId: iceMatchaLatte.id, order: 5, description: 'Аккуратно влить матча поверх молока — получится красивый градиент' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: iceMatchaLatte.id, name: 'Подача',          value: 'холодная',        unit: '' },
    { drinkId: iceMatchaLatte.id, name: 'Температура воды для матча', value: '70', unit: '°C' },
  ]});

  console.log('✅ База данных заполнена!');
}

main().catch(console.error).finally(() => db.$disconnect());
