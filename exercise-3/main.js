const API_URL = "https://pokeapi.co/api/v2/pokemon?limit=12";

const pokemonGrid = document.querySelector("#pokemon-grid");
const loadingState = document.querySelector("#loading-state");
const errorState = document.querySelector("#error-state");
const errorMessage = document.querySelector("#error-message");
const refreshButton = document.querySelector("#refresh-button");
const retryButton = document.querySelector("#retry-button");
const heroCount = document.querySelector("#hero-count");

const escapeHTML = (value) => {
  const element = document.createElement("span");
  element.textContent = value;
  return element.innerHTML;
};

const formatName = (name) => name.replaceAll("-", " ");

const formatMeasure = (value, unit) => `${(value / 10).toFixed(1)} ${unit}`;

const getStat = (pokemon, statName) => {
  return pokemon.stats.find(({ stat }) => stat.name === statName)?.base_stat ?? "—";
};

const showLoading = () => {
  loadingState.hidden = false;
  errorState.hidden = true;
  pokemonGrid.hidden = true;
  refreshButton.disabled = true;
  refreshButton.innerHTML = '<span aria-hidden="true">↻</span> Cargando...';
};

const showError = (error) => {
  console.error("Error al cargar Pokémon:", error);
  loadingState.hidden = true;
  pokemonGrid.hidden = true;
  errorState.hidden = false;
  errorMessage.textContent = error.message || "Ocurrió un problema al conectar con la API.";
  refreshButton.disabled = false;
  refreshButton.innerHTML = '<span aria-hidden="true">↻</span> Actualizar';
};

const showResults = () => {
  loadingState.hidden = true;
  errorState.hidden = true;
  pokemonGrid.hidden = false;
  refreshButton.disabled = false;
  refreshButton.innerHTML = '<span aria-hidden="true">↻</span> Actualizar';
};

const createPokemonCard = (pokemon, index) => {
  const card = document.createElement("article");
  card.className = "pokemon-card";
  card.style.animationDelay = `${index * 45}ms`;

  const visual = document.createElement("div");
  visual.className = "pokemon-visual";

  const image = document.createElement("img");
  image.src =
    pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default;
  image.alt = `Ilustración de ${formatName(pokemon.name)}`;
  image.loading = "lazy";
  image.addEventListener("error", () => {
    image.remove();
    visual.textContent = "?";
    visual.classList.add("image-fallback");
  });
  visual.append(image);

  const info = document.createElement("div");
  info.className = "pokemon-info";

  const number = document.createElement("span");
  number.className = "pokemon-number";
  number.textContent = `N.º ${String(pokemon.id).padStart(3, "0")}`;

  const name = document.createElement("h3");
  name.className = "pokemon-name";
  name.textContent = formatName(pokemon.name);

  const typeList = document.createElement("div");
  typeList.className = "type-list";
  pokemon.types.forEach(({ type }) => {
    const badge = document.createElement("span");
    badge.className = "type-badge";
    badge.textContent = type.name;
    typeList.append(badge);
  });

  const meta = document.createElement("div");
  meta.className = "pokemon-meta";
  meta.innerHTML = `
    <span><strong>${escapeHTML(formatMeasure(pokemon.height, "m"))}</strong> altura</span>
    <span><strong>${escapeHTML(formatMeasure(pokemon.weight, "kg"))}</strong> peso</span>
    <span><strong>${escapeHTML(String(getStat(pokemon, "speed")))}</strong> velocidad</span>
  `;

  info.append(number, name, typeList, meta);
  card.append(visual, info);

  return card;
};

const renderPokemon = (pokemons) => {
  pokemonGrid.replaceChildren(...pokemons.map(createPokemonCard));
  heroCount.textContent = pokemons.length;
};

const fetchPokemonDetails = async (pokemonUrl) => {
  const response = await fetch(pokemonUrl);
  if (!response.ok) {
    throw new Error(`La API respondió con el estado ${response.status}.`);
  }
  return response.json();
};

const loadPokemon = async () => {
  showLoading();

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`No se pudo consultar la Pokémon API (estado ${response.status}).`);
    }

    const data = await response.json();
    const pokemons = await Promise.all(
      data.results.map(({ url }) => fetchPokemonDetails(url)),
    );

    renderPokemon(pokemons);
    showResults();
  } catch (error) {
    showError(error);
  }
};

refreshButton.addEventListener("click", loadPokemon);
retryButton.addEventListener("click", loadPokemon);

loadPokemon();
