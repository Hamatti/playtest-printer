const bulkImportForm = document.querySelector("form#bulk-import");
const bulkImportDecklist = document.querySelector(
  'textarea[name="bulk-decklist"]',
);
const bulkImportBtn = document.querySelector("form#bulk-import button");

function parseCards() {
  const bulkDecklist = bulkImportDecklist.value.split("\n").filter((c) => c);
  const errors = [];

  const cards = bulkDecklist
    .map((entry) => {
      const match = /^(\d+)x?\s*(.*) \((.*)\).*/.exec(entry);

      if (!match) {
        errors.push(entry);
        return null;
      }

      const [_, qty, name, set] = match;
      return {
        qty,
        name,
        set,
      };
    })
    .filter((c) => !!c);

  return [cards, errors];
}

async function searchScryfall(cards) {
  const apiErrors = [];
  proxyZone.innerHTML =
    "<p style='padding: 1em;'>Searching the bulk pile, please wait...</p>";

  bulkImportBtn.disabled = true;
  const results = await Promise.all(
    cards.map(async (card) => {
      const query = `!"${card.name}"+set:${card.set}`;
      const resp = await fetch(`${mtgAPI}${query}`);
      const data = await resp.json();
      const response = data?.data
        ?.map((cardResponse) => {
          return {
            image: cardResponse.image_uris?.normal,
            card_faces: cardResponse.card_faces,
            alternate_prints_uri: cardResponse.prints_search_uri,
            layout: cardResponse.layout,
            qty: card.qty,
            name: card.name,
          };
        })
        .filter((c) => c)[0];

      if (response === undefined || response.length === 0) {
        apiErrors.push(card);
        return;
      }

      return response;
    }),
  );

  return [results, apiErrors];
}

function renderBulkImport(cards, importErrors, apiErrors) {
  // Clear from previous imports
  proxyZone.innerHTML = "";

  cards.forEach((card) => {
    for (let i = 0; i < parseInt(card.qty, 10); i++) {
      if (
        card.card_faces?.length > 0 &&
        !doubleCardLayouts.includes(card.layout)
      ) {
        const frontImage = document.createElement("img");
        const frontButton = document.createElement("button");
        const backImage = document.createElement("img");
        const backButton = document.createElement("button");

        frontImage.src = card.card_faces[0].image_uris?.normal;
        frontImage.alt = card.card_faces[0].name;
        backImage.src = card.card_faces[1].image_uris?.normal;
        backImage.alt = card.card_faces[1].name;

        frontButton.appendChild(frontImage);
        proxyZone.appendChild(frontButton);

        backButton.appendChild(backImage);
        proxyZone.appendChild(backButton);

        backButton.addEventListener("dblclick", handleRemoveCard);
        frontButton.addEventListener("dblclick", handleRemoveCard);
      } else {
        const img = document.createElement("img");
        const button = document.createElement("button");
        button.addEventListener("dblclick", handleRemoveCard);
        img.src = card.image;
        img.alt = card.name;

        button.appendChild(img);
        proxyZone.appendChild(button);
      }
    }
  });
}

bulkImportForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const [cardEntries, importErrors] = parseCards();
  console.log(
    `Found ${cardEntries.length} cards with ${importErrors.length} errors`,
  );

  const [cards, apiErrors] = await searchScryfall(cardEntries);
  console.log(`Found ${cards.length} cards with ${apiErrors.length} errors`);

  renderBulkImport(cards, importErrors, apiErrors);
  bulkImportBtn.disabled = false;
  return false;
});
