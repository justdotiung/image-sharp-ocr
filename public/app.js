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
      span.textContent = `이번달 api 남은 호출횟수 ${data.mountAPIreqCount}회`;
    });
})();

export const imageRender = (() => {
  let isRender = false;
  let ids = 0;
  const div = document.querySelector("#image-view");

  return {
    async render() {
      if (!store.getState()) return;
      const { isUpload } = store.getState();
      if (isRender) return;
      if (isUpload) {
        let text = "";
        for (let i = 0; i < ids; i++) {
          text += `<img class="sharp-image" src="/image/${i}" alt="image" />`;
        }

        div.innerHTML = text;
        isRender = true;
      }
    },
    reset() {
      isRender = false;
      div.innerHTML = "";
    },
    setIds(n) {
      ids = n;
    },
  };
})();

store.subscribe(imageRender.render);

const imageFormView = new ImageForm("#image-form-view");
const canvasEditor = new CanvasEditor("#canvas", 0.3);
const convertModal = new ConvertModal();
const editor = new Editor("#edit__button", canvasEditor);
const cropCanvas = new CropCanvas("#crop__canvas", { width: 700, height: 500 });

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
    span.textContent = `이번달 api 남은 호출횟수 ${data.mountAPIreqCount}회`;
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
    imageRender.reset();
    console.log(img.width, img.height);
    editor.show();
    canvasEditor.saveImage(img);
    cropCanvas.saveImage(img);
    cropCanvas.draw();
  };
});
