// Estado global de la aplicación
let characters = [];
let favorites = JSON.parse(localStorage.getItem('rm_favs')) || [];
let showOnlyFavorites = false;
let searchTerm = '';
let selectedStatus = '';

// Elementos del DOM
const grid = document.getElementById('characters-grid');
const loading = document.getElementById('loading');
const errorMsg = document.getElementById('error');
const noResults = document.getElementById('no-results');
const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');
const btnShowFavs = document.getElementById('btn-show-favs');
const favCountSpan = document.getElementById('fav-count');
const themeToggle = document.getElementById('theme-toggle');
const modal = document.getElementById('detail-modal');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');
const modalBackdrop = document.getElementById('modal-backdrop');

// --- 1. INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  updateFavBadge();
  fetchCharacters();
});

// --- 2. CONSUMO DE API (FETCH) ---
async function fetchCharacters() {
  try {
    loading.classList.remove('hidden');
    const response = await fetch('https://rickandmortyapi.com/api/character');
    if (!response.ok) throw new Error('Error en el servidor');
    
    const data = await response.json();
    characters = data.results;
    render();
  } catch (err) {
    console.error(err);
    errorMsg.classList.remove('hidden');
  } finally {
    loading.classList.add('hidden');
  }
}

// --- 3. FILTRADO Y RENDERIZADO REACTIVO ---
function render() {
  let filtered = characters.filter(c => {
    const matchesName = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === '' || c.status.toLowerCase() === selectedStatus.toLowerCase();
    const matchesFav = !showOnlyFavorites || favorites.includes(c.id);
    return matchesName && matchesStatus && matchesFav;
  });

  grid.innerHTML = '';

  if (filtered.length === 0) {
    noResults.classList.remove('hidden');
  } else {
    noResults.classList.add('hidden');
    filtered.forEach(c => {
      const isFav = favorites.includes(c.id);
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <img src="${c.image}" alt="${c.name}" loading="lazy" onclick="openDetails(${c.id})">
        <div class="card-body">
          <h2 class="card-title" onclick="openDetails(${c.id})">${c.name}</h2>
          <p class="card-info"><strong>Estado:</strong> ${c.status}</p>
          <p class="card-info"><strong>Especie:</strong> ${c.species}</p>
          <div class="card-actions">
            <button class="btn-detail" onclick="openDetails(${c.id})">Detalles</button>
            <button 
              class="btn-fav" 
              onclick="toggleFavorite(${c.id})" 
              aria-label="Marcar como favorito"
              aria-pressed="${isFav}">
              ${isFav ? '❤️' : '🤍'}
            </button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }
}

// --- 4. GESTIÓN DE FAVORITOS (localStorage) ---
window.toggleFavorite = function(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(favId => favId !== id);
  } else {
    favorites.push(id);
  }
  localStorage.setItem('rm_favs', JSON.stringify(favorites));
  updateFavBadge();
  render();
};

function updateFavBadge() {
  favCountSpan.textContent = favorites.length;
}

// --- 5. BÚSQUEDA CON PATRÓN DEBOUNCE Y FILTROS ---
let debounceTimer;
searchInput.addEventListener('input', (e) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    searchTerm = e.target.value;
    render();
  }, 250);
});

statusFilter.addEventListener('change', (e) => {
  selectedStatus = e.target.value;
  render();
});

btnShowFavs.addEventListener('click', () => {
  showOnlyFavorites = !showOnlyFavorites;
  btnShowFavs.classList.toggle('active', showOnlyFavorites);
  btnShowFavs.textContent = showOnlyFavorites ? 'Ver Todos' : 'Ver Solo Favoritos';
  render();
});

// --- 6. MODAL DE DETALLE Y ACCESIBILIDAD (A11y) ---
window.openDetails = function(id) {
  const item = characters.find(c => c.id === id);
  if (!item) return;

  modalBody.innerHTML = `
    <div style="text-align: center; margin-bottom: 1rem;">
      <img src="${item.image}" alt="${item.name}" style="border-radius: 50%; width: 120px; height: 120px; object-fit: cover;">
      <h2 style="margin-top: 0.5rem;">${item.name}</h2>
    </div>
    <p><strong>Estado:</strong> ${item.status}</p>
    <p><strong>Género:</strong> ${item.gender}</p>
    <p><strong>Origen:</strong> ${item.origin.name}</p>
    <p><strong>Última ubicación:</strong> ${item.location.name}</p>
    <p><strong>Episodios:</strong> ${item.episode.length} apariciones</p>
  `;

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
};

function closeModal() {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);

// Cerrar con tecla Escape (A11y)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

// --- 7. SISTEMA DE TEMA OSCURO / CLARO ---
function initTheme() {
  const savedTheme = localStorage.getItem('rm_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('rm_theme', next);
  themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
});
