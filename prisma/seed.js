import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  console.log('🌱 Заполняю базу данных...');

  const catEspresso = await db.category.create({ data: { emoji: '☕', name: 'Эспрессо', order: 1 } });
  const catMilk     = await db.category.create({ data: { emoji: '🥛', name: 'Молочные', order: 2 } });
  const catCold     = await db.category.create({ data: { emoji: '🧊', name: 'Холодные', order: 3 } });
  const catTea      = await db.category.create({ data: { emoji: '🍵', name: 'Чай', order: 4 } });

  // ─── Эспрессо ───────────────────────────────────────────────────────────────
  const espresso = await db.drink.create({
    data: {
      name: 'Эспрессо',
      categoryId: catEspresso.id,
      description: 'Классический итальянский эспрессо — основа всех кофейных напитков',
    },
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
    { drinkId: espresso.id, name: 'Температура воды',  value: '93',    unit: '°C'  },
    { drinkId: espresso.id, name: 'Давление',          value: '9',     unit: 'бар' },
    { drinkId: espresso.id, name: 'Время экстракции',  value: '25–30', unit: 'сек' },
    { drinkId: espresso.id, name: 'Помол',             value: 'мелкий', unit: ''   },
  ]});

  // ─── Американо ──────────────────────────────────────────────────────────────
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

  // ─── Капучино ───────────────────────────────────────────────────────────────
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
    { drinkId: cappuccino.id, name: 'Температура молока', value: '60–65', unit: '°C'  },
    { drinkId: cappuccino.id, name: 'Высота пенки',       value: '1–2',   unit: 'см'  },
    { drinkId: cappuccino.id, name: 'Жирность молока',    value: '3.2',   unit: '%'   },
  ]});

  // ─── Латте ──────────────────────────────────────────────────────────────────
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

  // ─── Флэт уайт ──────────────────────────────────────────────────────────────
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
    { drinkId: flatWhite.id, name: 'Температура молока', value: '60', unit: '°C' },
    { drinkId: flatWhite.id, name: 'Пена',               value: 'микропена', unit: '' },
    { drinkId: flatWhite.id, name: 'Жирность молока',    value: '3.5', unit: '%' },
  ]});

  // ─── Айс латте ──────────────────────────────────────────────────────────────
  const iceLatte = await db.drink.create({
    data: { name: 'Айс латте', categoryId: catCold.id, description: 'Холодный латте со льдом' },
  });
  const ilS = await db.drinkSize.create({ data: { drinkId: iceLatte.id, label: 'S', volumeMl: 300 } });
  const ilM = await db.drinkSize.create({ data: { drinkId: iceLatte.id, label: 'M', volumeMl: 400 } });
  const ilL = await db.drinkSize.create({ data: { drinkId: iceLatte.id, label: 'L', volumeMl: 500 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: ilS.id, name: 'Эспрессо',   amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: ilS.id, name: 'Молоко',     amount: '180', unit: 'мл', order: 2 },
    { drinkSizeId: ilS.id, name: 'Лёд',        amount: '60',  unit: 'г',  order: 3 },
    { drinkSizeId: ilM.id, name: 'Эспрессо',   amount: '60',  unit: 'мл', order: 1 },
    { drinkSizeId: ilM.id, name: 'Молоко',     amount: '270', unit: 'мл', order: 2 },
    { drinkSizeId: ilM.id, name: 'Лёд',        amount: '70',  unit: 'г',  order: 3 },
    { drinkSizeId: ilL.id, name: 'Эспрессо',   amount: '90',  unit: 'мл', order: 1 },
    { drinkSizeId: ilL.id, name: 'Молоко',     amount: '340', unit: 'мл', order: 2 },
    { drinkSizeId: ilL.id, name: 'Лёд',        amount: '70',  unit: 'г',  order: 3 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: iceLatte.id, order: 1, description: 'Заполнить стакан льдом' },
    { drinkId: iceLatte.id, order: 2, description: 'Влить холодное молоко' },
    { drinkId: iceLatte.id, order: 3, description: 'Приготовить эспрессо и влить поверх молока' },
  ]});

  // ─── Колд брю ───────────────────────────────────────────────────────────────
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
    { drinkId: coldBrew.id, name: 'Заваривание',      value: '18–24', unit: 'ч'  },
    { drinkId: coldBrew.id, name: 'Температура воды', value: '4–10',  unit: '°C' },
    { drinkId: coldBrew.id, name: 'Помол',            value: 'крупный', unit: '' },
    { drinkId: coldBrew.id, name: 'Соотношение',      value: '1:8',   unit: ''   },
  ]});

  // ─── Раф ────────────────────────────────────────────────────────────────────
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
    { drinkId: raf.id, name: 'Температура',  value: '65–70', unit: '°C' },
    { drinkId: raf.id, name: 'Жирность',     value: '33',    unit: '%'  },
  ]});

  // ─── Чай чёрный ─────────────────────────────────────────────────────────────
  const blackTea = await db.drink.create({
    data: { name: 'Чёрный чай', categoryId: catTea.id, description: 'Классический заварной чёрный чай' },
  });
  const btS = await db.drinkSize.create({ data: { drinkId: blackTea.id, label: 'S', volumeMl: 200 } });
  const btM = await db.drinkSize.create({ data: { drinkId: blackTea.id, label: 'M', volumeMl: 350 } });
  await db.ingredient.createMany({ data: [
    { drinkSizeId: btS.id, name: 'Чай листовой', amount: '3', unit: 'г',  order: 1 },
    { drinkSizeId: btS.id, name: 'Вода',         amount: '200', unit: 'мл', order: 2 },
    { drinkSizeId: btM.id, name: 'Чай листовой', amount: '5', unit: 'г',  order: 1 },
    { drinkSizeId: btM.id, name: 'Вода',         amount: '350', unit: 'мл', order: 2 },
  ]});
  await db.step.createMany({ data: [
    { drinkId: blackTea.id, order: 1, description: 'Ополоснуть чайник кипятком' },
    { drinkId: blackTea.id, order: 2, description: 'Засыпать чай, залить водой 95°C' },
    { drinkId: blackTea.id, order: 3, description: 'Заварить 3–4 минуты, перелить в чашку' },
  ]});
  await db.techParam.createMany({ data: [
    { drinkId: blackTea.id, name: 'Температура воды', value: '95',  unit: '°C' },
    { drinkId: blackTea.id, name: 'Время заварки',    value: '3–4', unit: 'мин' },
  ]});

  console.log('✅ База данных заполнена!');
}

main().catch(console.error).finally(() => db.$disconnect());
