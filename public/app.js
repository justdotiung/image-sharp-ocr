import CanvasView from "./components/canvas-view.js";
import ImageFormView from "./components/Image-form-view.js";
import DicisionContainerView from "./components/division-container.js";
import Button from "./components/button.js";
import { actiontype, store } from "./store.js";

const board = { width: 1000, height: 700 };
const imageFormView = new ImageFormView("#image-form-view");
const canvasView = new CanvasView("#canvas", board);
const dicisionContainerView = new DicisionContainerView("#division-view");

fetch("/ocr")
  .then((r) => r.json())
  .then((data) => {
    store.dispatch({
      type: actiontype.APICALLCOUNT,
      payload: data.mountAPIreqCount,
    });
    const span = document.querySelector(".ocr--text");
    span.textContent = `이번달 무료 google api 호출횟수 ${data.mountAPIreqCount}회`;
    span.style.display = "block";
    span.style.marginBottom = "10px";
    span.style.fontSize = "2rem";
  });

const button = new Button(".button__text--extract");
button.setEvent(async () => {
  try {
    const r = await fetch("/extract");
    const data = await r.json();
    store.dispatch({
      type: actiontype.APICALLCOUNT,
      payload: data.mountAPIreqCount,
    });
    alert(data.message);
    const span = document.querySelector(".ocr--text");
    span.textContent = `이번달 무료 google api 호출횟수 ${data.mountAPIreqCount}회`;
  } catch (e) {
    console.log(e);
  }
});

const xlsxButton = new Button(".buuton__cor--convert");
xlsxButton.setEvent(async () => {
  try {
    const res = await fetch("/xlsx");
    const data = await res.json();
    console.log(data.message);
  } catch (e) {}
});

imageFormView.on("@thumbnail", ({ detail }) => {
  var img = new Image();
  img.src = detail.value;
  img.onload = function () {
    canvasView.saveImage(img);
    dicisionContainerView.show(true);
  };
});
