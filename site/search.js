/**
 * Adds a slideover panel for searching cards for Magic the Gathering
 */

const searchBtn = document.querySelector("#search-btn");
const searchResults = document.querySelector("#search-results");
const searchInput = document.querySelector("#card-search");
const proxyZone = document.querySelector("#proxy-zone");

const mtgAPI = "https://api.scryfall.com/cards/search?q=";

const doubleCardLayouts = ["adventure", "split", "prototype", "prepare"];

/**
 * Adds card from search to proxy zone.
 *
 * If the card is a double-sided Magic the Gathering card,
 * adds both sides automatically.
 *
 * @param {Event} event
 */
function handleAddCard(event) {
  const target = event.currentTarget.querySelector("img");
  const frontImage = document.createElement("img");
  const frontButton = document.createElement("button");
  frontImage.src = target.src;
  frontImage.alt = target.dataset.name;
  frontImage.dataset.alts = target.dataset.alts;
  frontButton.addEventListener("dblclick", handleRemoveCard);
  frontButton.addEventListener("contextmenu", handleAltArtDialog);
  frontButton.appendChild(frontImage);
  proxyZone.appendChild(frontButton);

  // For double-sided cards, automatically add backside
  if (target.dataset.flip) {
    const backImage = document.createElement("img");
    const backButton = document.createElement("button");
    backButton.addEventListener("contextmenu", handleAltArtDialog);
    backImage.src = target.dataset.flip;
    backImage.dataset.alts = target.dataset.alts;

    let [frontName, backName] = target.dataset.name.split("//");
    frontImage.alt = frontName.trim();
    backImage.alt = backName.trim();
    backButton.addEventListener("dblclick", handleRemoveCard);
    backButton.appendChild(backImage);
    proxyZone.appendChild(backButton);
  }

  // Return focus to search input
  searchInput.focus();
  searchInput.select();
}

/**
 * EventListener callback to remove cards from proxy zone.
 * @param {Event} event
 */
function handleRemoveCard(event) {
  event.currentTarget.remove();
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
    const button = document.createElement("button");

    if (
      card.card_faces?.length > 0 &&
      !doubleCardLayouts.includes(card.layout)
    ) {
      img.src = card.card_faces[0].image_uris?.normal;
      img.dataset.flip = card.card_faces[1].image_uris?.normal;
    } else {
      img.src = card.image_uris?.normal;
    }

    img.dataset.name = card.name;
    img.dataset.alts = target.dataset.alts;

    button.addEventListener("click", handleAddCard);

    button.appendChild(img);
    li.appendChild(button);
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
    const button = document.createElement("button");

    if (
      card.card_faces?.length > 0 &&
      !doubleCardLayouts.includes(card.layout)
    ) {
      img.src = card.card_faces[0].image_uris?.normal;
      img.dataset.flip = card.card_faces[1].image_uris?.normal;
    } else {
      img.src = card.image;
    }

    img.dataset.name = card.name;
    img.alt = card.name;

    if (card.alternate_prints_uri) {
      img.dataset.alts = card.alternate_prints_uri;
      button.addEventListener("contextmenu", handleShowAlternativeArts);
    }

    button.addEventListener("click", handleAddCard);
    button.appendChild(img);
    li.appendChild(button);
    ul.appendChild(li);
  });

  return ul;
}

/**
 * Search cards from Scryfall
 * and render results
 *
 * @param {Event} event
 */
async function search(event) {
  event.preventDefault();
  searchResults.innerHTML = "Searching for cards...";

  const query = searchInput.value;

  const resp = await fetch(`${mtgAPI}${query}`);
  const data = await resp.json();
  const cards = data?.data
    ?.map((card) => {
      return {
        image: card.image_uris?.normal,
        card_faces: card.card_faces,
        alternate_prints_uri: card.prints_search_uri,
        layout: card.layout,
        name: card.name,
      };
    })
    .filter((c) => c);

  if (cards === undefined || cards.length === 0) {
    searchResults.innerHTML = `No Magic the Gathering cards found.`;
    return;
  }

  searchResults.innerHTML = "";
  searchResults.appendChild(renderSearchResults(cards));
  return false;
}
searchBtn.addEventListener("click", search);

document
  .querySelector("button#search-toggle")
  .addEventListener("click", (event) => {
    document.querySelector("aside#search-aside").classList.toggle("visible");
    document.querySelector("aside#import-aside").classList.remove("visible");
  });
