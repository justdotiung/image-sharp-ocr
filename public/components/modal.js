class ConvertModal {
  constructor() {
    this.el = document.querySelector(".convert__modal");
    this.show(false);
  }

  show(b) {
    console.log(b);
    this.el.style.display = b ? "block" : "none";
  }
}

export default ConvertModal;
