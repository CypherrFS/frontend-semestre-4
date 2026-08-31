// Gestión del Tema (Modo Oscuro / Claro)
const themeToggle = document.querySelector('#theme-toggle');
const body = document.body;

// Inicializar tema desde localStorage
const savedTheme = localStorage.getItem('theme') || 'light';
body.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const currentTheme = body.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'white'; // Corrección lógica abajo
  
  // Usaremos toggle simple
  if (body.getAttribute('data-theme') === 'dark') {
    body.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  } else {
    body.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
});

// Elementos del DOM para fases posteriores
const searchInput = document.querySelector('#search-input');
const statusFilter = document.querySelector('#status-filter');
const charactersGrid = document.querySelector('#characters-grid');
const loadingSpinner = document.querySelector('#loading-spinner');
const errorMessage = document.querySelector('#error-message');
const resultsCount = document.querySelector('#results-count');
const favCountBadge = document.querySelector('#fav-count');

// Estado Global de la App
let allCharacters = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Actualizar contador de favoritos inicial
const updateFavBadge = () => {
  favCountBadge.textContent = favorites.length;
};

// Log de inicio para depuración
console.log('Fase 1 completada: Estructura y Tema listos.');
updateFavBadge();
