/**
 * Adds a slideover panel for searching cards for Pokemon and MtG
 */

const searchBtn = document.querySelector("#search-btn");
const searchResults = document.querySelector("#search-results");
const searchInput = document.querySelector("#card-search");
const proxyZone = document.querySelector("#proxy-zone");

const pokemonAPI = "https://api.pokemontcg.io/v2/cards?q=name:";
const mtgAPI = "https://api.scryfall.com/cards/search?q=";

document.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    search(event);
  }
});

/**
 * Adds card from search to proxy zone.
 *
 * If the card is a double-sided Magic the Gathering card,
 * adds both sides automatically.
 *
 * @param {Event} event
 */
function handleAddCard(event) {
  const proxyImage = document.createElement("img");
  proxyImage.src = event.target.src;
  proxyImage.addEventListener("dblclick", handleRemoveCard);
  proxyZone.appendChild(proxyImage);
  if (event.target.dataset.flip) {
    // For double-sided cards, automatically add backside
    const flipImage = document.createElement("img");
    flipImage.src = event.target.dataset.flip;
    flipImage.addEventListener("dblclick", handleRemoveCard);
    proxyZone.appendChild(flipImage);
  }
  searchInput.focus();
  searchInput.select();
}

/**
 * EventListener callback to remove cards from proxy zone.
 * @param {Event} event
 */
function handleRemoveCard(event) {
  event.target.remove();
}

/**
 * Fetch alternative arts for a target card and show them
 * in search results.
 *
 * @param {Event} event
 */
async function handleShowAlternativeArts(event) {
  event.preventDefault();
  const target = event.target;

  if (!target.dataset.alts) {
    return;
  }
  const resp = await fetch(target.dataset.alts);
  const data = await resp.json();
  searchResults.innerHTML = "";
  const ul = document.createElement("ul");
  ul.classList.add("card-listing");
  data.data.forEach((card) => {
    const li = document.createElement("li");
    const img = document.createElement("img");

    const image = card.image_uris?.normal;

    img.src = image;

    img.addEventListener("click", handleAddCard);

    li.appendChild(img);
    ul.appendChild(li);
  });
  searchResults.appendChild(ul);
}

/**
 * Render search results for cards found
 * @param {Array<object>} cards
 * @returns HTMLUListElement
 */
function renderSearchResults(cards) {
  const ul = document.createElement("ul");
  ul.classList.add("card-listing");
  cards.forEach((card) => {
    const li = document.createElement("li");
    const img = document.createElement("img");

    if (card.card_faces?.length > 0) {
      img.src = card.card_faces[0].image_uris?.normal;
      img.dataset.flip = card.card_faces[1].image_uris?.normal;
    } else {
      img.src = card.image;
    }

    if (card.alternate_prints_uri) {
      img.dataset.alts = card.alternate_prints_uri;
      img.addEventListener("contextmenu", handleShowAlternativeArts);
    }

    img.addEventListener("click", handleAddCard);
    li.appendChild(img);
    ul.appendChild(li);
  });

  return ul;
}

/**
 * Search cards from either Pokemon or MTG API
 * and render results
 *
 * @param {Event} event
 */
async function search(event) {
  const isPokemon = document.querySelector("#pokemon").checked;

  event.preventDefault();
  searchResults.innerHTML = "Searching for cards...";

  const query = searchInput.value;
  let images = [];

  if (isPokemon) {
    const resp = await fetch(`${pokemonAPI}"${query}"`);
    const data = await resp.json();

    const cards = data.data;
    images = cards?.map((card) => {
      return {
        image: card.images.large,
        alternate_prints_uri: null,
      };
    });
  } else {
    const resp = await fetch(`${mtgAPI}${query}`);
    const data = await resp.json();
    cards = data?.data
      ?.map((card) => {
        return {
          image: card.image_uris?.normal,
          card_faces: card.card_faces,
          alternate_prints_uri: card.prints_search_uri,
        };
      })
      .filter((c) => c);
  }

  if (cards === undefined || cards.length === 0) {
    searchResults.innerHTML = `No ${
      isPokemon ? "Pokemon" : "Magic the Gathering"
    } cards found.`;
    return;
  }

  searchResults.innerHTML = "";
  searchResults.appendChild(renderSearchResults(cards));
  return false;
}
searchBtn.addEventListener("click", search);

document.querySelector("button#overlay").addEventListener("click", (event) => {
  document.querySelector("aside").classList.toggle("visible");
});
