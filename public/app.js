import CanvasEditor from "./components/canvasEditor.js";
import ImageForm from "./components/imageForm.js";
import Button from "./components/button.js";
import { actiontype, store } from "./store.js";
import ConvertModal from "./components/modal.js";
import Editor from "./components/editor.js";
import CropCanvas from "./components/cropCanvas.js";

(() => {
  fetch("/ocr")
    .then((r) => r.json())
    .then((data) => {
      store.dispatch({
        type: actiontype.APICALLCOUNT,
        payload: data.mountAPIreqCount,
      });
      const span = document.querySelector(".ocr--text");
      span.textContent = `이번달 무료 google api 남은 호출횟수 ${data.mountAPIreqCount}회`;
      span.style.display = "block";
      span.style.marginBottom = "10px";
      span.style.fontSize = "2rem";
    });
})();

const imageFormView = new ImageForm("#image-form-view");
const canvasEditor = new CanvasEditor("#canvas", 0.5);
const convertModal = new ConvertModal();
const editor = new Editor("#edit__container", canvasEditor);
const cropCanvas = new CropCanvas("#crop__canvas", 1);

const button = new Button(".button__text--extract");
button.setEvent(async () => {
  try {
    convertModal.show(true);
    const r = await fetch("/extract");
    const data = await r.json();
    if (data.mountAPIreqCount) {
      store.dispatch({
        type: actiontype.APICALLCOUNT,
        payload: data.mountAPIreqCount,
      });
    }
    alert(data.message);
    convertModal.show(false);
    const span = document.querySelector(".ocr--text");
    span.textContent = `이번달 무료 google api 남은 호출횟수 ${data.mountAPIreqCount}회`;
  } catch (e) {
    console.log(e);
  }
});

const xlsxButton = new Button(".buuton__cor--convert");
xlsxButton.setEvent(async () => {
  try {
    convertModal.show(true);
    const res = await fetch("/xlsx");
    const data = await res.json();
    alert(data.message);
    convertModal.show(false);
  } catch (e) {}
});

imageFormView.on("@thumbnail", ({ detail }) => {
  var img = new Image();
  img.src = detail.value;
  img.onload = function () {
    editor.show();
    canvasEditor.saveImage(img);
    cropCanvas.saveImage(img);
    cropCanvas.draw();
  };
});
