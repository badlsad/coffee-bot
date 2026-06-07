// ── State ──────────────────────────────────────────────────────────────────────
const state = {
  token: localStorage.getItem('adminToken') || '',
  categories: [],
  currentDrink: null,
};

// ── API helper ─────────────────────────────────────────────────────────────────
async function api(method, path, body) {
  const res = await fetch(`/api/admin${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${state.token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) { logout(); return null; }
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Ошибка'); }
  return res.json();
}
const GET    = path        => api('GET',    path);
const POST   = (path, b)  => api('POST',   path, b);
const PUT    = (path, b)  => api('PUT',    path, b);
const DELETE = path        => api('DELETE', path);

// ── Auth ───────────────────────────────────────────────────────────────────────
document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  state.token = document.getElementById('secretInput').value.trim();
  const res = await GET('/categories').catch(() => null);
  if (!res) {
    document.getElementById('loginError').classList.remove('hidden');
    state.token = '';
    return;
  }
  localStorage.setItem('adminToken', state.token);
  showPanel();
});

function logout() {
  state.token = '';
  localStorage.removeItem('adminToken');
  document.getElementById('adminPanel').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
}
document.getElementById('logoutBtn').addEventListener('click', logout);

function showPanel() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('adminPanel').classList.remove('hidden');
  showView('dashboard');
}

if (state.token) {
  GET('/categories').then(data => {
    if (data) showPanel();
  }).catch(() => {});
}

// ── Navigation ─────────────────────────────────────────────────────────────────
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`view-${name}`)?.classList.add('active');
  document.querySelector(`.nav-btn[data-view="${name}"]`)?.classList.add('active');

  if (name === 'dashboard')  loadDashboard();
  if (name === 'categories') loadCategories();
  if (name === 'drinks')     loadDrinks();
}

document.querySelectorAll('.nav-btn').forEach(btn =>
  btn.addEventListener('click', () => showView(btn.dataset.view))
);
document.querySelectorAll('[data-view]').forEach(btn =>
  btn.addEventListener('click', () => showView(btn.dataset.view))
);

// ── Dashboard ──────────────────────────────────────────────────────────────────
async function loadDashboard() {
  const [cats, drinks] = await Promise.all([GET('/categories'), GET('/drinks')]);
  document.getElementById('stat-cats').textContent   = cats.length;
  document.getElementById('stat-drinks').textContent = drinks.length;
  document.getElementById('stat-active').textContent = drinks.filter(d => d.isActive).length;
}

// ── Categories ─────────────────────────────────────────────────────────────────
async function loadCategories() {
  const cats = await GET('/categories');
  state.categories = cats;
  const list = document.getElementById('catsList');
  list.innerHTML = cats.map(c => `
    <div class="list-item">
      <span style="font-size:22px">${c.emoji}</span>
      <div class="list-item-info">
        <div class="list-item-title">${esc(c.name)}</div>
        <div class="list-item-sub">${c._count.drinks} напитков · порядок ${c.order}</div>
      </div>
      <div class="list-item-actions">
        <button class="btn-sm" onclick="editCategory(${c.id})">Изменить</button>
        <button class="btn-danger" style="padding:5px 10px;font-size:13px" onclick="deleteCategory(${c.id}, '${esc(c.name)}')">✕</button>
      </div>
    </div>
  `).join('');
}

document.getElementById('addCatBtn').addEventListener('click', () => openModal('Новая категория', `
  <label>Эмодзи<input name="emoji" value="☕" required></label>
  <label>Название<input name="name" required></label>
  <div class="modal-footer">
    <button type="button" class="btn-sm" onclick="closeModal()">Отмена</button>
    <button type="submit" class="btn-primary">Создать</button>
  </div>
`, async data => {
  await POST('/categories', data);
  closeModal(); loadCategories();
}));

window.editCategory = async (id) => {
  const cat = state.categories.find(c => c.id === id);
  openModal('Изменить категорию', `
    <label>Эмодзи<input name="emoji" value="${esc(cat.emoji)}" required></label>
    <label>Название<input name="name" value="${esc(cat.name)}" required></label>
    <label>Порядок<input name="order" type="number" value="${cat.order}"></label>
    <div class="modal-footer">
      <button type="button" class="btn-sm" onclick="closeModal()">Отмена</button>
      <button type="submit" class="btn-primary">Сохранить</button>
    </div>
  `, async data => {
    await PUT(`/categories/${id}`, data);
    closeModal(); loadCategories();
  });
};

window.deleteCategory = async (id, name) => {
  if (!confirm(`Удалить категорию «${name}»?\nВсе напитки категории тоже будут удалены.`)) return;
  await DELETE(`/categories/${id}`);
  loadCategories();
};

// ── Drinks list ────────────────────────────────────────────────────────────────
let allDrinks = [];

async function loadDrinks() {
  const [drinks, cats] = await Promise.all([GET('/drinks'), GET('/categories')]);
  allDrinks = drinks;
  state.categories = cats;

  const filter = document.getElementById('drinkCatFilter');
  const selected = filter.value;
  filter.innerHTML = '<option value="">Все категории</option>' +
    cats.map(c => `<option value="${c.id}" ${c.id == selected ? 'selected' : ''}>${c.emoji} ${esc(c.name)}</option>`).join('');

  renderDrinks();
}

function renderDrinks() {
  const catId  = document.getElementById('drinkCatFilter').value;
  const query  = document.getElementById('drinkSearch').value.toLowerCase();
  const filtered = allDrinks.filter(d =>
    (!catId || d.categoryId == catId) &&
    (!query || d.name.toLowerCase().includes(query))
  );
  document.getElementById('drinksList').innerHTML = filtered.map(d => `
    <div class="list-item">
      <div class="list-item-info">
        <div class="list-item-title">
          ${d.category.emoji} ${esc(d.name)}
          <span class="badge ${d.isActive ? 'badge-active' : 'badge-inactive'}" style="margin-left:8px">
            ${d.isActive ? 'активен' : 'скрыт'}
          </span>
        </div>
        <div class="list-item-sub">${esc(d.category.name)}</div>
      </div>
      <button class="btn-sm" onclick="openDrinkEditor(${d.id})">Редактировать →</button>
    </div>
  `).join('') || '<div style="color:var(--text2);padding:20px">Ничего не найдено</div>';
}

document.getElementById('drinkCatFilter').addEventListener('change', renderDrinks);
document.getElementById('drinkSearch').addEventListener('input', renderDrinks);

document.getElementById('addDrinkBtn').addEventListener('click', () => {
  openModal('Новый напиток', `
    <label>Название<input name="name" required></label>
    <label>Описание<textarea name="description" rows="2"></textarea></label>
    <label>Категория
      <select name="categoryId" required>
        ${state.categories.map(c => `<option value="${c.id}">${c.emoji} ${esc(c.name)}</option>`).join('')}
      </select>
    </label>
    <div class="modal-footer">
      <button type="button" class="btn-sm" onclick="closeModal()">Отмена</button>
      <button type="submit" class="btn-primary">Создать</button>
    </div>
  `, async data => {
    const drink = await POST('/drinks', data);
    closeModal();
    openDrinkEditor(drink.id);
  });
});

// ── Drink editor ───────────────────────────────────────────────────────────────
window.openDrinkEditor = async (id) => {
  const drink = await GET(`/drinks/${id}`);
  state.currentDrink = drink;

  document.getElementById('view-drinks').classList.remove('active');
  document.getElementById('view-drink-editor').classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  renderDrinkEditor(drink);
};

document.getElementById('backToDrinks').addEventListener('click', () => {
  showView('drinks');
});

function renderDrinkEditor(drink) {
  document.getElementById('editorDrinkName').textContent = drink.name;

  const toggleBtn = document.getElementById('toggleActiveBtn');
  toggleBtn.textContent = drink.isActive ? '✅ Активен' : '⛔ Скрыт';
  toggleBtn.className = `btn-toggle ${drink.isActive ? 'active' : 'inactive'}`;

  // Info form
  const form = document.getElementById('drinkInfoForm');
  form.elements.name.value        = drink.name;
  form.elements.description.value = drink.description || '';
  form.elements.categoryId.innerHTML = state.categories.map(c =>
    `<option value="${c.id}" ${c.id === drink.categoryId ? 'selected' : ''}>${c.emoji} ${esc(c.name)}</option>`
  ).join('');

  renderPhoto(drink);
  renderSizes(drink);
  renderSteps(drink);
  renderParams(drink);
}

// Toggle active
document.getElementById('toggleActiveBtn').addEventListener('click', async () => {
  const d = state.currentDrink;
  const updated = await PUT(`/drinks/${d.id}`, { isActive: !d.isActive });
  state.currentDrink = { ...d, isActive: updated.isActive };
  const btn = document.getElementById('toggleActiveBtn');
  btn.textContent = updated.isActive ? '✅ Активен' : '⛔ Скрыт';
  btn.className = `btn-toggle ${updated.isActive ? 'active' : 'inactive'}`;
});

// Delete drink
document.getElementById('deleteDrinkBtn').addEventListener('click', async () => {
  if (!confirm(`Удалить напиток «${state.currentDrink.name}»?`)) return;
  await DELETE(`/drinks/${state.currentDrink.id}`);
  showView('drinks');
});

// Save info form
document.getElementById('drinkInfoForm').addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  await PUT(`/drinks/${state.currentDrink.id}`, Object.fromEntries(fd));
  const updated = await GET(`/drinks/${state.currentDrink.id}`);
  state.currentDrink = updated;
  document.getElementById('editorDrinkName').textContent = updated.name;
});

// ── Sizes ──────────────────────────────────────────────────────────────────────
function renderSizes(drink) {
  document.getElementById('sizesList').innerHTML = drink.sizes.map(size => `
    <div class="sub-item">
      <div class="sub-item-header" onclick="toggleSubItem(this)">
        <span class="sub-item-title">${esc(size.label)}${size.volumeMl ? ` · ${size.volumeMl} мл` : ''}</span>
        <button class="icon-btn edit" onclick="event.stopPropagation(); editSize(${size.id})">✎</button>
        <button class="icon-btn" onclick="event.stopPropagation(); deleteSize(${size.id})">✕</button>
      </div>
      <div class="sub-item-body" style="display:none">
        ${size.ingredients.map(i => `
          <div class="ingr-row">
            <span>${esc(i.name)}: ${esc(i.amount)} ${esc(i.unit)}</span>
            <button class="icon-btn edit" onclick="editIngredient(${i.id}, ${size.id})">✎</button>
            <button class="icon-btn" onclick="deleteIngredient(${i.id})">✕</button>
          </div>
        `).join('')}
        <button class="btn-sm" style="margin-top:6px" onclick="addIngredient(${size.id})">+ Ингредиент</button>
      </div>
    </div>
  `).join('');
}

window.toggleSubItem = (header) => {
  const body = header.nextElementSibling;
  body.style.display = body.style.display === 'none' ? 'flex' : 'none';
  body.style.flexDirection = 'column';
};

document.getElementById('addSizeBtn').addEventListener('click', () => {
  openModal('Добавить размер', `
    <label>Название (S / M / L / ...)<input name="label" required></label>
    <label>Объём, мл (необязательно)<input name="volumeMl" type="number" min="1"></label>
    <div class="modal-footer">
      <button type="button" class="btn-sm" onclick="closeModal()">Отмена</button>
      <button type="submit" class="btn-primary">Добавить</button>
    </div>
  `, async data => {
    await POST(`/drinks/${state.currentDrink.id}/sizes`, data);
    closeModal(); await refreshEditor();
  });
});

window.editSize = (id) => {
  const size = state.currentDrink.sizes.find(s => s.id === id);
  openModal('Изменить размер', `
    <label>Название<input name="label" value="${esc(size.label)}" required></label>
    <label>Объём, мл<input name="volumeMl" type="number" value="${size.volumeMl || ''}"></label>
    <div class="modal-footer">
      <button type="button" class="btn-sm" onclick="closeModal()">Отмена</button>
      <button type="submit" class="btn-primary">Сохранить</button>
    </div>
  `, async data => {
    await PUT(`/sizes/${id}`, data);
    closeModal(); await refreshEditor();
  });
};

window.deleteSize = async (id) => {
  if (!confirm('Удалить размер и все его ингредиенты?')) return;
  await DELETE(`/sizes/${id}`);
  await refreshEditor();
};

// ── Ingredients ────────────────────────────────────────────────────────────────
window.addIngredient = (sizeId) => {
  openModal('Добавить ингредиент', `
    <label>Название<input name="name" required></label>
    <label>Количество<input name="amount" required placeholder="30"></label>
    <label>Единица<input name="unit" required placeholder="мл"></label>
    <div class="modal-footer">
      <button type="button" class="btn-sm" onclick="closeModal()">Отмена</button>
      <button type="submit" class="btn-primary">Добавить</button>
    </div>
  `, async data => {
    await POST(`/sizes/${sizeId}/ingredients`, data);
    closeModal(); await refreshEditor();
  });
};

window.editIngredient = (id, sizeId) => {
  const size = state.currentDrink.sizes.find(s => s.id === sizeId);
  const ingr = size.ingredients.find(i => i.id === id);
  openModal('Изменить ингредиент', `
    <label>Название<input name="name" value="${esc(ingr.name)}" required></label>
    <label>Количество<input name="amount" value="${esc(ingr.amount)}" required></label>
    <label>Единица<input name="unit" value="${esc(ingr.unit)}" required></label>
    <div class="modal-footer">
      <button type="button" class="btn-sm" onclick="closeModal()">Отмена</button>
      <button type="submit" class="btn-primary">Сохранить</button>
    </div>
  `, async data => {
    await PUT(`/ingredients/${id}`, data);
    closeModal(); await refreshEditor();
  });
};

window.deleteIngredient = async (id) => {
  await DELETE(`/ingredients/${id}`);
  await refreshEditor();
};

// ── Steps ──────────────────────────────────────────────────────────────────────
function renderSteps(drink) {
  document.getElementById('stepsList').innerHTML = drink.steps.map(s => `
    <div class="step-row">
      <div class="step-num">${s.order}</div>
      <span>${esc(s.description)}</span>
      <button class="icon-btn edit" onclick="editStep(${s.id})">✎</button>
      <button class="icon-btn" onclick="deleteStep(${s.id})">✕</button>
    </div>
  `).join('');
}

document.getElementById('addStepBtn').addEventListener('click', () => {
  openModal('Добавить шаг', `
    <label>Описание<textarea name="description" rows="3" required></textarea></label>
    <div class="modal-footer">
      <button type="button" class="btn-sm" onclick="closeModal()">Отмена</button>
      <button type="submit" class="btn-primary">Добавить</button>
    </div>
  `, async data => {
    await POST(`/drinks/${state.currentDrink.id}/steps`, data);
    closeModal(); await refreshEditor();
  });
});

window.editStep = (id) => {
  const step = state.currentDrink.steps.find(s => s.id === id);
  openModal('Изменить шаг', `
    <label>Описание<textarea name="description" rows="3" required>${esc(step.description)}</textarea></label>
    <div class="modal-footer">
      <button type="button" class="btn-sm" onclick="closeModal()">Отмена</button>
      <button type="submit" class="btn-primary">Сохранить</button>
    </div>
  `, async data => {
    await PUT(`/steps/${id}`, data);
    closeModal(); await refreshEditor();
  });
};

window.deleteStep = async (id) => {
  await DELETE(`/steps/${id}`);
  await refreshEditor();
};

// ── Tech Params ────────────────────────────────────────────────────────────────
function renderParams(drink) {
  document.getElementById('paramsList').innerHTML = drink.techParams.map(p => `
    <div class="param-row">
      <span><strong>${esc(p.name)}:</strong> ${esc(p.value)} ${esc(p.unit)}</span>
      <button class="icon-btn edit" onclick="editParam(${p.id})">✎</button>
      <button class="icon-btn" onclick="deleteParam(${p.id})">✕</button>
    </div>
  `).join('');
}

document.getElementById('addParamBtn').addEventListener('click', () => {
  openModal('Добавить параметр', `
    <label>Название<input name="name" required placeholder="Температура"></label>
    <label>Значение<input name="value" required placeholder="65"></label>
    <label>Единица<input name="unit" placeholder="°C"></label>
    <div class="modal-footer">
      <button type="button" class="btn-sm" onclick="closeModal()">Отмена</button>
      <button type="submit" class="btn-primary">Добавить</button>
    </div>
  `, async data => {
    await POST(`/drinks/${state.currentDrink.id}/params`, data);
    closeModal(); await refreshEditor();
  });
});

window.editParam = (id) => {
  const param = state.currentDrink.techParams.find(p => p.id === id);
  openModal('Изменить параметр', `
    <label>Название<input name="name" value="${esc(param.name)}" required></label>
    <label>Значение<input name="value" value="${esc(param.value)}" required></label>
    <label>Единица<input name="unit" value="${esc(param.unit)}"></label>
    <div class="modal-footer">
      <button type="button" class="btn-sm" onclick="closeModal()">Отмена</button>
      <button type="submit" class="btn-primary">Сохранить</button>
    </div>
  `, async data => {
    await PUT(`/params/${id}`, data);
    closeModal(); await refreshEditor();
  });
};

window.deleteParam = async (id) => {
  await DELETE(`/params/${id}`);
  await refreshEditor();
};

// ── Helpers ────────────────────────────────────────────────────────────────────
async function refreshEditor() {
  const drink = await GET(`/drinks/${state.currentDrink.id}`);
  state.currentDrink = drink;
  renderPhoto(drink);
  renderSizes(drink);
  renderSteps(drink);
  renderParams(drink);
}

// ── Photo ───────────────────────────────────────────────────────────────────
function renderPhoto(drink) {
  const preview   = document.getElementById('photoPreview');
  const deleteBtn = document.getElementById('deletePhotoBtn');
  if (drink.photoUrl) {
    preview.innerHTML = `<img src="${drink.photoUrl}" alt="Фото напитка">`;
    deleteBtn.style.display = '';
  } else {
    preview.innerHTML = '<div class="photo-placeholder">Фото не загружено</div>';
    deleteBtn.style.display = 'none';
  }
}

document.getElementById('uploadPhotoBtn').addEventListener('click', () => {
  document.getElementById('photoFileInput').click();
});

document.getElementById('photoFileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const uploadBtn = document.getElementById('uploadPhotoBtn');
  const hint      = document.getElementById('cloudinaryHint');
  uploadBtn.disabled    = true;
  uploadBtn.textContent = '⏳ Загружаю...';
  hint.textContent      = '';

  try {
    const fd = new FormData();
    fd.append('photo', file);

    const res = await fetch(`/api/admin/drinks/${state.currentDrink.id}/photo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${state.token}` },
      body: fd,
    });

    if (res.status === 503) {
      hint.textContent = '⚠ Добавьте CLOUDINARY_URL в Railway Variables';
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Ошибка загрузки');
    }

    const { photoUrl } = await res.json();
    state.currentDrink = { ...state.currentDrink, photoUrl };
    renderPhoto(state.currentDrink);
    hint.textContent = '✓ Загружено';
    setTimeout(() => { hint.textContent = ''; }, 3000);
  } catch (err) {
    hint.textContent = `Ошибка: ${err.message}`;
  } finally {
    uploadBtn.disabled    = false;
    uploadBtn.textContent = '📷 Загрузить фото';
    e.target.value        = '';
  }
});

document.getElementById('deletePhotoBtn').addEventListener('click', async () => {
  if (!confirm('Удалить фото напитка?')) return;
  await DELETE(`/drinks/${state.currentDrink.id}/photo`);
  state.currentDrink = { ...state.currentDrink, photoUrl: null, photoFileId: null };
  renderPhoto(state.currentDrink);
  const hint = document.getElementById('cloudinaryHint');
  hint.textContent = '✓ Фото удалено';
  setTimeout(() => { hint.textContent = ''; }, 2000);
});

// Modal
let modalCallback = null;

function openModal(title, bodyHtml, onSubmit) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalForm').innerHTML = bodyHtml;
  modalCallback = onSubmit;
  document.getElementById('modal').classList.remove('hidden');
  document.querySelector('#modalForm input, #modalForm textarea')?.focus();
}

window.closeModal = () => {
  document.getElementById('modal').classList.add('hidden');
  modalCallback = null;
};

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modal').addEventListener('click', e => {
  if (e.target === document.getElementById('modal')) closeModal();
});

document.getElementById('modalForm').addEventListener('submit', async e => {
  e.preventDefault();
  if (!modalCallback) return;
  const fd = new FormData(e.target);
  const data = Object.fromEntries(fd);
  try {
    await modalCallback(data);
  } catch (err) {
    alert(err.message);
  }
});

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
