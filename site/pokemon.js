const initialize = async () => {
  try {
    // Before anything, check if the API is reachable.
    await fetch("http://100.125.32.42:8000/api/ping/");
  } catch (e) {
    return false;
  }
  const pokemonNavBtn = document.querySelector("#pokemon-toggle");
  pokemonNavBtn.style.display = "revert";

  const POKEMON_API_URL = "http://localhost:8000/api/search/?name=";

  const searchPokemonBtn = document.querySelector("#search-pokemon-btn");
  const searchPokemonInput = document.querySelector("#card-search-pokemon");
  const searchPokemonResults = document.querySelector(
    "#search-results-pokemon",
  );

  document
    .querySelector("button#pokemon-toggle")
    .addEventListener("click", (event) => {
      document.querySelector("aside#pokemon-aside").classList.toggle("visible");
      document.querySelector("aside#search-aside").classList.remove("visible");
      document.querySelector("aside#import-aside").classList.remove("visible");
    });

  /**
   * Render search results for cards found
   * @param {Array<object>} cards
   * @returns HTMLUListElement
   */
  function renderPokemonSearchResults(cards) {
    const ul = document.createElement("ul");
    ul.classList.add("card-listing");
    cards.forEach((card) => {
      const li = document.createElement("li");
      const img = document.createElement("img");
      const button = document.createElement("button");

      img.src = `http://localhost:8000/${card.image}`;
      img.dataset.name = card.name;
      img.alt = card.name;

      button.addEventListener("click", handleAddCard);
      button.appendChild(img);
      li.appendChild(button);
      ul.appendChild(li);
    });

    return ul;
  }

  /**
   * Search cards from local Toolkit API
   * and render results
   *
   * @param {Event} event
   */
  async function search(event) {
    event.preventDefault();
    searchPokemonResults.innerHTML = "Searching for cards...";

    const query = searchPokemonInput.value;

    const resp = await fetch(`${POKEMON_API_URL}${query}`);
    const data = await resp.json();
    const cards = data?.data
      ?.map((card) => {
        return {
          image: card.large_image,
          name: card.name,
        };
      })
      .filter((c) => c);

    if (cards === undefined || cards.length === 0) {
      searchPokemonResults.innerHTML = `No Pokemon cards found.`;
      return;
    }

    searchPokemonResults.innerHTML = "";
    searchPokemonResults.appendChild(renderPokemonSearchResults(cards));
    return false;
  }

  searchPokemonBtn.addEventListener("click", search);
};

initialize();
