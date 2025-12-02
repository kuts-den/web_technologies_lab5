const DATA = '';

document.addEventListener('DOMContentLoaded', init);

function init() {
  byId('homeLink').onclick = e => e.preventDefault();
  byId('catalogLink').onclick = e => {
    e.preventDefault();
    loadCategories();
  };
}

async function fetchJSON(path) {
  const res = await fetch(DATA + path);
  if (!res.ok) throw new Error(`Не вдалося завантажити ${path}`);
  return res.json();
}

function byId(id) {
  return document.getElementById(id);
}

async function loadCategories() {
  const main = byId('mainArea');
  main.innerHTML = `<p>Завантаження...</p>`;

  try {
    const categories = await fetchJSON('categories.json');
    renderCategories(categories);
  } catch (e) {
    main.innerHTML = error(e.message);
  }
}

function renderCategories(list) {
  byId('mainArea').innerHTML = `
    <h2>Каталог</h2>
    <div class="list-group">
      ${list.map(c =>
        `<a class="list-group-item category" data-file="${c.shortname}.json">
          ${escape(c.name)}
         </a>`
      ).join('')}
    </div>
    <button id="specialBtn" class="btn btn-outline-primary mt-3">Specials</button>
    <div id="notes"></div>
    <div id="content"></div>
  `;

  document.querySelectorAll('.category').forEach(el =>
    el.onclick = () => loadCategory(el.dataset.file)
  );

  byId('specialBtn').onclick = () => {
    const cat = list[Math.floor(Math.random() * list.length)];
    loadCategory(`${cat.shortname}.json`);
  };
}

async function loadCategory(file) {
  byId('content').innerHTML = `<p>Завантаження...</p>`;
  byId('notes').innerHTML = '';

  try {
    const data = await fetchJSON(file);
    renderCategory(data);
  } catch (e) {
    byId('content').innerHTML = error(e.message);
  }
}

function renderCategory(cat) {
  byId('notes').innerHTML = `
    <h3>${escape(cat.name)}</h3>
    <p>${escape(cat.notes || '')}</p>
  `;

  if (!cat.items?.length) {
    byId('content').innerHTML = `<p>Немає товарів.</p>`;
    return;
  }

  byId('content').innerHTML = `
    <div class="row">
      ${cat.items.map(renderItem).join('')}
    </div>
  `;
}

function renderItem(i) {
  return `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="card h-100">
        <img src="${attr(i.image || 'https://place-hold.it/200x200')}" class="card-img-top">
        <div class="card-body">
          <h5>${escape(i.name)}</h5>
          <p>${escape(i.description)}</p>
          <strong>${escape(i.price)}</strong>
        </div>
      </div>
    </div>
  `;
}

function escape(s) {
  return String(s || '')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;');
}

function attr(s) {
  return escape(s);
}

function error(msg) {
  return `<div class="alert alert-danger">${msg}</div>`;
}
