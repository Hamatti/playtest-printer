const altArtDialog = document.querySelector("dialog#alt-art-dialog");
const altArtDialogList = document.querySelector("dialog#alt-art-dialog ul");
const closeAltArtDialogButton = document.querySelector(
  "dialog#alt-art-dialog button#alt-art-dialog-close",
);

/**
 * Close alt art dialog
 * @param {Event} event
 */
function closeAltArtDialog(event) {
  altArtDialog.close();
}

closeAltArtDialogButton.addEventListener("click", closeAltArtDialog);

function handleSelectAltArt(target, img) {
  target.replaceWith(img);
  closeAltArtDialog();
}
/**
 * Fetch alt arts to dialog
 * @param {Event} event
 */
async function handleAltArtDialog(event) {
  event.preventDefault();
  const target = event.currentTarget.querySelector("img");
  const altUri = target.dataset.alts;

  const resp = await fetch(altUri);
  const data = await resp.json();

  altArtDialogList.innerHTML = "";

  data.data?.forEach((card) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    const img = document.createElement("img");

    img.src = card.image_uris?.normal || card.card_faces[0].image_uris.normal;
    img.dataset.name = card.name;
    img.alt = card.name;
    img.dataset.alts = altUri;

    button.addEventListener("click", (ev) => handleSelectAltArt(target, img));
    button.addEventListener("dblclick", handleRemoveCard);
    button.addEventListener("contextmenu", handleAltArtDialog);

    button.appendChild(img);
    li.appendChild(button);
    altArtDialogList.appendChild(li);
  });

  altArtDialog.showModal();
}
