// Configuración de la API
const API_URL = 'https://rickandmortyapi.com/api/character';

// Elementos del DOM
const themeToggle = document.querySelector('#theme-toggle');
const body = document.body;
const searchInput = document.querySelector('#search-input');
const statusFilter = document.querySelector('#status-filter');
const charactersGrid = document.querySelector('#characters-grid');
const loadingSpinner = document.querySelector('#loading-spinner');
const errorMessage = document.querySelector('#error-message');
const retryBtn = document.querySelector('#retry-btn');
const resultsCount = document.querySelector('#results-count');
const favCountBadge = document.querySelector('#fav-count');

// Estado Global de la App
let allCharacters = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// --- GESTIÓN DEL TEMA ---
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    body.setAttribute('data-theme', 'dark');
  }
};

themeToggle.addEventListener('click', () => {
  if (body.getAttribute('data-theme') === 'dark') {
    body.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  } else {
    body.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
});

// --- GESTIÓN DE FAVORITOS (Base para Fase 3) ---
const updateFavBadge = () => {
  favCountBadge.textContent = favorites.length;
};

const isFavorite = (id) => favorites.includes(id);

const toggleFavorite = (id, event) => {
  event.stopPropagation(); // Evita abrir el modal al hacer clic en favoritos
  const index = favorites.indexOf(id);
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(id);
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
  updateFavBadge();
  renderCharacters(getFilteredCharacters());
};

// --- CONSUMO DE API ---
const fetchCharacters = async () => {
  showLoading(true);
  errorMessage.hidden = true;
  
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error en la conexión');
    
    const data = await response.json();
    allCharacters = data.results;
    renderCharacters(allCharacters);
  } catch (err) {
    console.error(err);
    errorMessage.hidden = false;
  } finally {
    showLoading(false);
  }
};

const showLoading = (isLoading) => {
  loadingSpinner.hidden = !isLoading;
  charactersGrid.hidden = isLoading;
};

// --- RENDERIZADO ---
const renderCharacters = (characters) => {
  charactersGrid.innerHTML = '';
  resultsCount.textContent = `${characters.length} personajes`;
  
  if (characters.length === 0) {
    charactersGrid.innerHTML = '<p class="no-results">No se encontraron personajes en esta dimensión.</p>';
    return;
  }

  characters.forEach(char => {
    const card = document.createElement('div');
    card.className = 'char-card';
    card.innerHTML = `
      <button class="fav-btn ${isFavorite(char.id) ? 'active' : ''}" onclick="toggleFavorite(${char.id}, event)">
        ${isFavorite(char.id) ? '❤️' : '🤍'}
      </button>
      <img src="${char.image}" alt="${char.name}" class="char-img" loading="lazy">
      <div class="char-info">
        <h3 class="char-name">${char.name}</h3>
        <div class="char-status">
          <span class="status-dot status-${char.status.toLowerCase()}"></span>
          ${char.status} - ${char.species}
        </div>
      </div>
    `;
    
    // Evento para Fase 3 (Modal)
    card.addEventListener('click', () => console.log('Click en:', char.name));
    
    charactersGrid.appendChild(card);
  });
};

// --- FILTRADO EN VIVO ---
const getFilteredCharacters = () => {
  const query = searchInput.value.toLowerCase();
  const status = statusFilter.value.toLowerCase();
  
  return allCharacters.filter(char => {
    const matchesSearch = char.name.toLowerCase().includes(query);
    const matchesStatus = status === '' || char.status.toLowerCase() === status;
    return matchesSearch && matchesStatus;
  });
};

const handleFilter = () => {
  const filtered = getFilteredCharacters();
  renderCharacters(filtered);
};

// Event Listeners
searchInput.addEventListener('input', handleFilter);
statusFilter.addEventListener('change', handleFilter);
retryBtn.addEventListener('click', fetchCharacters);

// Inicialización
initTheme();
updateFavBadge();
fetchCharacters();

// Exponer funciones globales para el onclick del HTML generado
window.toggleFavorite = toggleFavorite;
