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

async function search(event) {
  const isPokemon = document.querySelector("#pokemon").checked;

  event.preventDefault();
  searchResults.innerHTML = "Searching for cards...";

  const query = searchInput.value;
  console.log(query);
  let images = [];

  if (isPokemon) {
    const resp = await fetch(`${pokemonAPI}"${query}"`);
    const data = await resp.json();

    const cards = data.data;
    images = cards?.map((card) => card.images.large);
  } else {
    const resp = await fetch(`${mtgAPI}${query}`);
    const data = await resp.json();
    images = data?.data
      ?.map((card) => card.image_uris?.normal)
      .filter((c) => c);
  }

  if (images === undefined || images.length === 0) {
    searchResults.innerHTML = `No ${
      isPokemon ? "Pokemon" : "Magic the Gathering"
    } cards found.`;
    return;
  }
  const ul = document.createElement("ul");
  ul.classList.add("card-listing");
  searchResults.innerHTML = "";
  images.forEach((image) => {
    const li = document.createElement("li");
    const img = document.createElement("img");

    img.src = image;

    img.addEventListener("click", (event) => {
      const proxyImage = document.createElement("img");
      proxyImage.src = image;
      proxyImage.addEventListener("dblclick", (event) => {
        event.target.remove();
      });
      proxyZone.appendChild(proxyImage);
    });
    li.appendChild(img);
    ul.appendChild(li);
  });

  searchResults.appendChild(ul);
  return false;
}
searchBtn.addEventListener("click", search);

document.querySelector("button#overlay").addEventListener("click", (event) => {
  document.querySelector("aside").classList.toggle("visible");
});
