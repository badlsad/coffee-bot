const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

// ── Состояние ─────────────────────────────────────────────────────────────────
const state = {
  view: 'categories',
  categories: [],
  category: null,
  drink: null,
  selectedSize: 0,
};

// ── DOM ───────────────────────────────────────────────────────────────────────
const $  = id => document.getElementById(id);
const el = {
  loading:       $('loading'),
  app:           $('app'),
  backBtn:       $('backBtn'),
  headerTitle:   $('headerTitle'),
  searchBtn:     $('searchBtn'),
  searchOverlay: $('searchOverlay'),
  closeSearchBtn:$('closeSearchBtn'),
  searchInput:   $('searchInput'),
  searchResults: $('searchResults'),
  categoriesView:$('categoriesView'),
  drinksView:    $('drinksView'),
  drinkView:     $('drinkView'),
  categoriesGrid:$('categoriesGrid'),
  drinksList:    $('drinksList'),
  drinkContent:  $('drinkContent'),
};

// ── Навигация ─────────────────────────────────────────────────────────────────
function showView(name, title, showBack) {
  el.categoriesView.classList.remove('active');
  el.drinksView.classList.remove('active');
  el.drinkView.classList.remove('active');
  $(`${name}View`).classList.add('active');

  state.view = name;
  el.headerTitle.textContent = title;
  window.scrollTo(0, 0);

  if (showBack) {
    el.backBtn.classList.remove('hidden');
    tg?.BackButton?.show();
  } else {
    el.backBtn.classList.add('hidden');
    tg?.BackButton?.hide();
  }
}

function goBack() {
  if (state.view === 'drink')   return loadDrinks(state.category);
  if (state.view === 'drinks')  return loadCategories();
}

el.backBtn.addEventListener('click', goBack);
tg?.BackButton?.onClick(goBack);

// ── Категории ─────────────────────────────────────────────────────────────────
async function loadCategories() {
  showView('categories', 'Тех. карта', false);

  if (!state.categories.length) {
    const r = await fetch('/api/categories');
    state.categories = await r.json();
  }

  el.categoriesGrid.innerHTML = state.categories.map(c => `
    <div class="cat-card" data-cat-id="${c.id}">
      <span class="cat-emoji">${c.emoji}</span>
      <span class="cat-name">${esc(c.name)}</span>
      <span class="cat-count">${c._count?.drinks ?? 0} напитков</span>
    </div>
  `).join('');

  el.categoriesGrid.onclick = e => {
    const card = e.target.closest('.cat-card');
    if (!card) return;
    const cat = state.categories.find(c => c.id === +card.dataset.catId);
    if (cat) loadDrinks(cat);
  };
}

// ── Напитки ───────────────────────────────────────────────────────────────────
async function loadDrinks(category) {
  state.category = category;
  showView('drinks', category.name, true);

  const r = await fetch(`/api/categories/${category.id}/drinks`);
  const drinks = await r.json();

  if (!drinks.length) {
    el.drinksList.innerHTML = `<div class="search-empty">В этой категории пока нет напитков</div>`;
    return;
  }

  el.drinksList.innerHTML = drinks.map(d => `
    <div class="drink-card" data-drink-id="${d.id}">
      ${thumb(d.photoFileId, category.emoji)}
      <div class="drink-info">
        <div class="drink-name">${esc(d.name)}</div>
        ${d.description ? `<div class="drink-desc">${esc(d.description)}</div>` : ''}
      </div>
      <span class="chevron">›</span>
    </div>
  `).join('');

  el.drinksList.onclick = e => {
    const card = e.target.closest('.drink-card');
    if (card) loadDrink(+card.dataset.drinkId);
  };
}

// ── Напиток детально ──────────────────────────────────────────────────────────
async function loadDrink(id) {
  showView('drink', '...', true);

  const r = await fetch(`/api/drinks/${id}`);
  const drink = await r.json();
  state.drink = drink;
  state.selectedSize = 0;

  el.headerTitle.textContent = drink.name;
  renderDrink(drink);
}

function renderDrink(drink) {
  const hasSizes  = drink.sizes.length > 0;
  const hasSteps  = drink.steps.length > 0;
  const hasParams = drink.techParams.length > 0;

  el.drinkContent.innerHTML = `
    ${drink.photoFileId
      ? `<img class="detail-photo" src="/api/photo/${drink.photoFileId}" alt="${esc(drink.name)}">`
      : `<div class="detail-photo-placeholder">${drink.category.emoji}</div>`}

    <div class="detail-header">
      <div class="detail-name">${esc(drink.name)}</div>
      <div class="detail-category">${drink.category.emoji} ${esc(drink.category.name)}</div>
      ${drink.description ? `<div class="detail-desc">${esc(drink.description)}</div>` : ''}
    </div>

    ${hasSizes ? `
      <div class="size-tabs" id="sizeTabs">
        ${drink.sizes.map((s, i) => `
          <button class="size-tab${i === 0 ? ' active' : ''}" data-idx="${i}">
            ${esc(s.label)}
            ${s.volumeMl ? `<span class="size-vol">${s.volumeMl} мл</span>` : ''}
          </button>
        `).join('')}
      </div>
      <div id="ingrSection">${renderIngredients(drink.sizes[0])}</div>
    ` : ''}

    ${hasSteps ? `
      <div class="section">
        <div class="section-title">Приготовление</div>
        ${drink.steps.map(s => `
          <div class="step-item">
            <div class="step-num">${s.order}</div>
            <div class="step-text">${esc(s.description)}</div>
          </div>
        `).join('')}
      </div>
    ` : ''}

    ${hasParams ? `
      <div class="section">
        <div class="section-title">Технические параметры</div>
        <div class="params-grid">
          ${drink.techParams.map(p => `
            <div class="param-card">
              <div class="param-label">${esc(p.name)}</div>
              <div class="param-value">${esc(p.value)}</div>
              ${p.unit ? `<div class="param-unit">${esc(p.unit)}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <div class="bottom-space"></div>
  `;

  // Size tab clicks
  const tabs = $('sizeTabs');
  if (tabs) {
    tabs.onclick = e => {
      const btn = e.target.closest('.size-tab');
      if (!btn) return;
      const idx = +btn.dataset.idx;
      state.selectedSize = idx;
      tabs.querySelectorAll('.size-tab').forEach((t, i) => t.classList.toggle('active', i === idx));
      $('ingrSection').innerHTML = renderIngredients(drink.sizes[idx]);
    };
  }
}

function renderIngredients(size) {
  if (!size.ingredients.length) {
    return `<div class="section"><div class="search-hint" style="padding:20px 0">Нет ингредиентов</div></div>`;
  }
  return `
    <div class="section">
      <div class="section-title">Ингредиенты</div>
      ${size.ingredients.map(i => `
        <div class="ingr-row">
          <span class="ingr-name">${esc(i.name)}</span>
          <span class="ingr-amount">${esc(i.amount)} ${esc(i.unit)}</span>
        </div>
      `).join('')}
    </div>
  `;
}

// ── Поиск ─────────────────────────────────────────────────────────────────────
el.searchBtn.addEventListener('click', () => {
  el.searchOverlay.classList.remove('hidden');
  setTimeout(() => el.searchInput.focus(), 80);
});

el.closeSearchBtn.addEventListener('click', closeSearch);

function closeSearch() {
  el.searchOverlay.classList.add('hidden');
  el.searchInput.value = '';
  el.searchResults.innerHTML = `<div class="search-hint">Введите название напитка</div>`;
}

let searchTimer;
el.searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  const q = el.searchInput.value.trim();
  if (!q) {
    el.searchResults.innerHTML = `<div class="search-hint">Введите название напитка</div>`;
    return;
  }
  searchTimer = setTimeout(() => doSearch(q), 280);
});

async function doSearch(q) {
  const r = await fetch(`/api/drinks/search?q=${encodeURIComponent(q)}`);
  const drinks = await r.json();

  if (!drinks.length) {
    el.searchResults.innerHTML = `<div class="search-empty">Ничего не найдено</div>`;
    return;
  }

  el.searchResults.innerHTML = drinks.map(d => `
    <div class="drink-card" data-drink-id="${d.id}">
      ${thumb(d.photoFileId, d.category?.emoji || '☕')}
      <div class="drink-info">
        <div class="drink-name">${esc(d.name)}</div>
        <div class="drink-desc">${d.category ? `${d.category.emoji} ${esc(d.category.name)}` : ''}</div>
      </div>
      <span class="chevron">›</span>
    </div>
  `).join('');

  el.searchResults.onclick = e => {
    const card = e.target.closest('.drink-card');
    if (!card) return;
    closeSearch();
    loadDrink(+card.dataset.drinkId);
  };
}

// ── Хелперы ───────────────────────────────────────────────────────────────────
function thumb(fileId, emoji) {
  return fileId
    ? `<img class="drink-thumb" src="/api/photo/${fileId}" alt="" loading="lazy">`
    : `<div class="drink-thumb-placeholder">${emoji}</div>`;
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Deep link (startapp=drink_ID или #drink_ID) ───────────────────────────────
function handleDeepLink() {
  const startParam = tg?.initDataUnsafe?.start_param || '';
  const hash = window.location.hash.slice(1);
  const raw = startParam || hash;
  const match = raw.match(/^drink_(\d+)$/);
  if (match) loadDrink(+match[1]);
}

// ── Init ──────────────────────────────────────────────────────────────────────
(async () => {
  try {
    await loadCategories();
    handleDeepLink();
  } finally {
    el.loading.classList.add('hidden');
    el.app.classList.remove('hidden');
  }
})();
