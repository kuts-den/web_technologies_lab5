const dataPath = '';

document.addEventListener('DOMContentLoaded', () => {
  initNav();
});

function initNav() {
  document.getElementById('homeLink').addEventListener('click', (e) => {
    e.preventDefault();
  });
  document.getElementById('catalogLink').addEventListener('click', (e) => {
    e.preventDefault();
    loadCategories();
  });
}

async function loadCategories() {
  const main = document.getElementById('mainArea');
  main.innerHTML = `<p>Завантаження категорій...</p>`;

  try {
    const res = await fetch(`${dataPath}categories.json`);
    if (!res.ok) throw new Error('Не вдалося завантажити categories.json');
    const categories = await res.json();

    renderCategories(categories);
  } catch (err) {
    main.innerHTML = `<div class="alert alert-danger">Помилка: ${err.message}</div>`;
  }
}

function renderCategories(categories) {
  const main = document.getElementById('mainArea');
  let html = `<h2>Каталог</h2>`;
  html += `<div class="list-group mb-3">`;
  categories.forEach(cat => {
    html += `<a class="list-group-item list-group-item-action category-link" data-file="${cat.shortname}.json">${escapeHtml(cat.name)}</a>`;
  });
  html += `</div>`;

  html += `<div class="mb-3"><a class="btn btn-outline-primary" id="specialsBtn">Specials</a></div>`;

  html += `<div id="categoryNotes" class="mb-3"></div>`;
  html += `<div id="categoryContent"></div>`;

  main.innerHTML = html;

  document.querySelectorAll('.category-link').forEach(el => {
    el.addEventListener('click', (e) => {
      const file = e.currentTarget.getAttribute('data-file');
      loadCategory(file);
    });
  });

  document.getElementById('specialsBtn').addEventListener('click', () => {
    const categoriesList = categories;
    const idx = Math.floor(Math.random() * categoriesList.length);
    const cat = categoriesList[idx];
    loadCategory(`${cat.shortname}.json`);
  });
}

async function loadCategory(filename) {
  const notesDiv = document.getElementById('categoryNotes');
  const contentDiv = document.getElementById('categoryContent');
  contentDiv.innerHTML = `<p>Завантаження категорії...</p>`;
  notesDiv.innerHTML = '';

  try {
    const res = await fetch(`${dataPath}${filename}`);
    if (!res.ok) throw new Error(`Не вдалося завантажити ${filename}`);
    const catData = await res.json();

    const title = catData.name || 'Категорія';
    const notes = catData.notes || '';
    notesDiv.innerHTML = `<h3>${escapeHtml(title)}</h3><p>${escapeHtml(notes)}</p>`;

    if (!Array.isArray(catData.items) || catData.items.length === 0) {
      contentDiv.innerHTML = `<p>Немає товарів у цій категорії.</p>`;
      return;
    }

    let html = `<div class="row d-flex">`;
    catData.items.forEach(item => {
      html += `
        <div class="col-md-6 col-lg-6 mb-4">
          <div class="card h-100">
            <img src="${escapeAttr(item.image || `https://place-hold.it/200x200`)}" class="card-img-top product-img" alt="${escapeAttr(item.name)}">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${escapeHtml(item.name)}</h5>
              <p class="card-text">${escapeHtml(item.description)}</p>
              <div class="mt-auto"><strong>Ціна: </strong>${escapeHtml(item.price)}</div>
            </div>
          </div>
        </div>
      `;
    });
    html += `</div>`;
    contentDiv.innerHTML = html;

  } catch (err) {
    contentDiv.innerHTML = `<div class="alert alert-danger">Помилка: ${err.message}</div>`;
  }
}

function escapeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, '&quot;');
}



