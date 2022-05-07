class Button {
  constructor(className) {
    this.el = document.querySelector(className);
    this.el.addEventListener("click", () => {
      if (this.onClick) this.onClick();
    });
  }

  setEvent(fn) {
    this.onClick = fn.bind(this);
  }
}

export default Button;
