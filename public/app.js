import CanvasView from "./components/canvas-view.js";
import ImageFormView from "./components/Image-form-view.js";
import DicisionContainerView from "./components/division-container.js";
import Button from "./components/button.js";

const board = { width: 1000, height: 700 };
const imageFormView = new ImageFormView("#image-form-view");
const canvasView = new CanvasView("#canvas", board);
const dicisionContainerView = new DicisionContainerView("#division-view");
const button = new Button(".button__text--extract");
button.setEvent(async () => {
  try {
    const r = await fetch("/extract");
    const data = await r.json();
    alert(data.message);
  } catch (e) {
    console.log(e);
  }
});
imageFormView.on("@thumbnail", ({ detail }) => {
  var img = new Image();
  img.src = detail.value;
  img.onload = function () {
    canvasView.saveImage(img);
    dicisionContainerView.show(true);
  };
});
