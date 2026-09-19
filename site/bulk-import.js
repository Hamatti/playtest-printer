const bulkImportForm = document.querySelector("#moxfield-bulk");
const bulkProxyZone = document.querySelector("#proxy-zone");

bulkImportForm.addEventListener("submit", async (ev) => {
  ev.preventDefault();

  const bulkList = document
    .querySelector("textarea[name='moxfield']")
    .value.split("\n");

  const cards = bulkList
    .map((entry) => {
      if (entry === "") {
        return;
      }
      const match = /^(\d+) (.*) \((.*)\).*$/.exec(entry);
      const [_, qty, name, set] = match;

      return {
        qty,
        name,
        set,
      };
    })
    .filter((c) => !!c);

  cards.forEach(async (card) => {
    const resp = await fetch(`${mtgAPI}${card.name}+set:${card.set}`);
    const data = await resp.json();
    const results = data?.data
      ?.map((card) => {
        return {
          image: card.image_uris?.normal,
          card_faces: card.card_faces,
          alternate_prints_uri: card.prints_search_uri,
          layout: card.layout,
        };
      })
      .filter((c) => c);

    if (results === undefined || results.length === 0) {
      return;
    }

    const times = parseInt(card.qty, 10);
    for (let i = 0; i < times; i++) {
      addCardToProxyZone(results[0]);
    }
  });

  return false;
});

function addCardToProxyZone(result) {
  const proxyImage = document.createElement("img");
  proxyImage.src = result.image;
  proxyImage.addEventListener("dblclick", handleRemoveCard);
  bulkProxyZone.appendChild(proxyImage);
}
