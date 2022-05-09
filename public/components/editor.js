import { actiontype, store } from "../store.js";

console.log("editer");
class Editor {
  constructor(id, canvasEditor) {
    this.el = document.querySelector(id);
    this.crop = this.el.querySelector(".crop__button");
    this.add = this.el.querySelector(".line__button--add");
    this.remove = this.el.querySelector(".line__button--remove");
    this.move = this.el.querySelector(".move__button");
    this.crop.addEventListener("click", () => {
      store.dispatch({ type: actiontype.MODE, payload: "crop" });
      store.dispatch({ type: actiontype.CREATBOX, payload: false });
      canvasEditor.clear();
      canvasEditor.onFillImage();
    });
    this.add.addEventListener("click", () => {
      const { offset, imageRect } = store.getState();
      const { x, y, width, height } = imageRect;
      store.dispatch({
        type: actiontype.ADDLINE,
        payload: [x + width / 2, y - offset.top, y + height - offset.top, 0],
      });
      store.dispatch({ type: actiontype.MODE, payload: "addLine" });
      console.log("g");
      const { lines } = store.getState();
      const curr = lines[lines.length - 1];
      canvasEditor.drawLine(curr);
    });
    this.remove.addEventListener("click", () => {
      store.dispatch({ type: actiontype.MODE, payload: "removeLine" });
    });

    this.move.addEventListener("click", () => {
      store.dispatch({ type: actiontype.MODE, payload: "move" });
    });

    this.show(false);
  }
  show(b = true) {
    this.el.style.display = b ? "block" : "none";
  }
}

export default Editor;
