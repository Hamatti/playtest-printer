/** Handles the drag and drop functionality **/

/* To add multiple copies, filename must start with
 * digit(s) and a dash */
const countPattern = /^(\d+)x-/;

let lastTarget = null;

if (window.FileReader) {
  let drop;
  addEventHandler(window, "load", function () {
    drop = document.getElementById("drop-zone");
    let output = document.getElementById("proxy-zone");

    function cancel(e) {
      if (e.preventDefault) {
        e.preventDefault();
      }
      return false;
    }

    // Tells the browser that we *can* drop on this target
    addEventHandler(drop, "dragover", cancel);
    addEventHandler(drop, "dragenter", cancel);

    addEventHandler(drop, "drop", function (e) {
      e = e || window.event; // get window.event if e argument missing (in IE)
      if (e.preventDefault) {
        e.preventDefault();
      } // stops the browser from redirecting off to the image.

      let shouldParseCounts = document.querySelector("#parse-counts").checked;

      let dt = e.dataTransfer;
      let files = dt.files;
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let reader = new FileReader();

        // If parseCount checkbox is checked, parse filenames
        // if they start with [N]x- and capture [N] as count
        let count = 1;
        if (shouldParseCounts) {
          let filename = file.name || file[1].name;
          const matches = filename.match(countPattern);
          if (matches) {
            count = parseInt(matches[1], 10);
          }
        }

        reader.readAsDataURL(file);
        addEventHandler(
          reader,
          "loadend",
          function (e, file) {
            let bin = this.result;
            for (let i = 0; i < count; i++) {
              let img = document.createElement("img");
              img.file = file;
              img.src = bin;

              img.addEventListener("dblclick", (event) => {
                event.target.remove();
              });
              output.appendChild(img);
            }
          }.bindToEventHandler(file)
        );
      }
      if (e.target === lastTarget || e.target === document) {
        document.querySelector("#drop-zone").style.visibility = "hidden";
        document.querySelector("#drop-zone").style.opacity = 0;
      }
      return false;
    });
    Function.prototype.bindToEventHandler = function bindToEventHandler() {
      var handler = this;
      var boundParameters = Array.prototype.slice.call(arguments);

      //create closure
      return function (e) {
        e = e || window.event; // get window.event if e argument missing (in IE)
        boundParameters.unshift(e);
        handler.apply(this, boundParameters);
      };
    };
  });
} else {
  document.getElementById("status").innerHTML =
    "Your browser does not support the HTML5 FileReader.";
}

function addEventHandler(obj, evt, handler) {
  if (obj.addEventListener) {
    // W3C method
    obj.addEventListener(evt, handler, false);
  } else if (obj.attachEvent) {
    // IE method.
    obj.attachEvent("on" + evt, handler);
  } else {
    // Old school method.
    obj["on" + evt] = handler;
  }
}

let helpButton = document.querySelector("button#help");
let helpText = document.querySelector("div#help-text");
helpButton.addEventListener("click", (event) => {
  helpText.classList.toggle("closed");
});

window.addEventListener("dragenter", function (e) {
  lastTarget = e.target; // cache the last target here
  // unhide our dropzone overlay
  document.querySelector("#drop-zone").style.visibility = "";
  document.querySelector("#drop-zone").style.opacity = 1;
});

window.addEventListener("dragleave", function (e) {
  // this is the magic part. when leaving the window,
  // e.target happens to be exactly what we want: what we cached
  // at the start, the dropzone we dragged into.
  // so..if dragleave target matches our cache, we hide the dropzone.
  // `e.target === document` is a workaround for Firefox 57
  if (e.target === lastTarget || e.target === document) {
    document.querySelector("#drop-zone").style.visibility = "hidden";
    document.querySelector("#drop-zone").style.opacity = 0;
  }
});
