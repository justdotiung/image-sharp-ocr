import { store, actiontype } from "../store.js";
console.log("DicisionContainer");

class DicisionContainerView {
  constructor(id) {
    this.el = document.querySelector(id);
    this.text = this.el.querySelector(".division--text");
    this.setText(1);
    this.el.addEventListener("click", (e) => {
      if (e.target.classList.contains("division--increase")) {
        store.dispatch({ type: actiontype.INCREASE });
        console.log(store.getState());
        this.setText(store.getState().divistionCount);
      }

      if (e.target.classList.contains("division--decrease")) {
        if (store.getState().divistionCount <= 1) return;
        store.dispatch({ type: actiontype.DECREASE });
        this.setText(store.getState().divistionCount);
      }
    });

    this.show(false);
  }

  show(b = true) {
    this.el.style.display = b ? "block" : "none";
  }

  setText(text) {
    console.log(text);
    this.text.textContent = text;
  }
}

export default DicisionContainerView;
