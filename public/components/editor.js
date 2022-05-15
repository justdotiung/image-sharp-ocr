import { actiontype, store } from "../store.js";

class Editor {
  constructor(id, canvasEditor) {
    this.el = document.querySelector(id);
    this.input = this.el.querySelector(".line__input");
    this.crop = this.el.querySelector(".crop__button");
    this.resize = this.el.querySelector(".resize__button");
    this.add = this.el.querySelector(".line__button--add");
    this.remove = this.el.querySelector(".line__button--remove");
    this.move = this.el.querySelector(".move__button");
    this.crop.addEventListener("click", () => {
      store.dispatch({ type: actiontype.INITSTATE });
      store.dispatch({ type: actiontype.MODE, payload: "crop" });
      store.dispatch({ type: actiontype.CREATBOX, payload: false });
      store.dispatch({ type: actiontype.SCALE, payload: canvasEditor.scale });
      canvasEditor.clear();
      canvasEditor.onFillImage();
    });
    this.resize.addEventListener("click", () => {
      const { createBox } = store.getState();
      if (!createBox) {
        alert("이미지를 먼저 잘라주세요.");
        return;
      }
      store.dispatch({ type: actiontype.MODE, payload: "resize" });
    });
    this.add.addEventListener("click", () => {
      const { createBox } = store.getState();
      if (!createBox) {
        alert("이미지를 먼저 잘라주세요.");
        return;
      }
      const { offset, imageRect } = store.getState();
      const { x, y, width, height } = imageRect;
      const newlines = [];
      const c = parseInt(this.input.value);
      const numberOfDivisions = parseInt(this.input.value) + 1;
      const distance = width / numberOfDivisions;
      for (let i = 1; i < numberOfDivisions; i++) {
        newlines.push([
          x + distance,
          y - offset.top,
          y + height - offset.top,
          x + distance * i,
          numberOfDivisions,
        ]);
      }
      store.dispatch({
        type: actiontype.ADDLINE,
        payload: newlines,
      });
      store.dispatch({ type: actiontype.MODE, payload: "addLine" });
      const { lines } = store.getState();
      canvasEditor.drawLine(lines);
    });
    this.remove.addEventListener("click", () => {
      const { createBox } = store.getState();
      if (!createBox) {
        alert("이미지를 먼저 잘라주세요.");
        return;
      }
      store.dispatch({ type: actiontype.MODE, payload: "removeLine" });
      store.dispatch({ type: actiontype.REMOVELINE });
      const { lines } = store.getState();
      canvasEditor.drawLine(lines);
    });

    this.move.addEventListener("click", () => {
      const { createBox } = store.getState();
      if (!createBox) {
        alert("이미지를 먼저 잘라주세요.");
        return;
      }
      store.dispatch({ type: actiontype.MODE, payload: "move" });
    });

    this.input.addEventListener("change", (e) => {
      const { value } = e.target;
      if (value < 1) {
        e.target.value = 1;
        return;
      }
    });

    this.show(false);
  }

  show(b = true) {
    this.el.style.display = b ? "block" : "none";
  }
}

export default Editor;
