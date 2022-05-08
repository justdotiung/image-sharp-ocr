console.log("editer");
class Editor {
  constructor(id, mode) {
    this.el = document.querySelector(id);
    this.crop = this.el.querySelector(".crop__button");
    this.add = this.el.querySelector(".line__button--add");
    this.remove = this.el.querySelector(".line__button--remove");

    this.crop.addEventListener("click", () => {
      mode.set("crop");
    });
    this.add.addEventListener("click", () => {
      mode.set("add");
    });
    this.remove.addEventListener("click", () => {
      mode.set("remove");
    });

    this.show(false);
  }
  show(b = true) {
    this.el.style.display = b ? "block" : "none";
  }
}

export default Editor;
