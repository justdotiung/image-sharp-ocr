import { actiontype, store } from "../store.js";
console.log("canvas");

class CanvasView {
  constructor(id, { width, height }, mode) {
    this.canvas = document.querySelector(id);
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext("2d");
    this.info = {};

    this.onMousemove = this.onMousemove.bind(this);
    this.onReset = this.onReset.bind(this);

    this.canvas.addEventListener("mousedown", (event) => {
      console.log(mode.get());
      this.setMode(mode.get());
    });

    store.subscribe(() => {
      const { imageRect, divistionCount } = store.getState();
      if (!imageRect || divistionCount <= 1) return;
      const distance = imageRect.width / divistionCount;

      const offsetX = imageRect.x - this.canvas.offsetLeft;
      const offsetY = imageRect.y - this.canvas.offsetTop;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.beginPath();
      this.onFillImage(this.img);
      this.ctx.strokeRect(offsetX, offsetY, imageRect.width, imageRect.height);

      for (let i = 1; i < divistionCount; i++) {
        this.ctx.moveTo(offsetX + distance * i, offsetY);
        this.ctx.lineTo(offsetX + distance * i, offsetY + imageRect.height);
      }

      this.ctx.closePath();
      this.ctx.stroke();
    });
  }

  setMode(mode) {
    switch (mode) {
      case "none":
        return;
      case "crop":
        return this.crop();
      case "add":
        return this.add();
      case "remove":
        return this.remove();
    }
  }

  saveImage(img) {
    this.img = img;
    const scaleX = img.width / this.canvas.width;
    const scaleY = img.height / this.canvas.height;
    const scale = Math.max(scaleX, scaleY);
    this.scale = scale;
    store.dispatch({ type: actiontype.SCALE, payload: scale });
    this.onFillImage(this.img);
  }

  crop() {
    this.info.x = event.clientX;
    this.info.y = event.clientY;
    store.dispatch({
      type: actiontype.OFFSET,
      payload: {
        left: this.canvas.offsetLeft,
        top: this.canvas.offsetTop,
      },
    });
    this.canvas.addEventListener("mousemove", this.onMousemove);
    this.canvas.addEventListener("mouseup", this.onReset);
    this.canvas.addEventListener("mouseout", this.onReset);
  }

  onMousemove(e) {
    const width = e.clientX - this.info.x;
    const height = e.clientY - this.info.y;

    this.info.width = width > 0 ? width : 0;
    this.info.height = height > 0 ? height : 0;
    this.onDrawRact(this.info);
  }

  onDrawRact({ x, y, width, height }) {
    this.ctx.strokeStyle = "blue";
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.beginPath();
    this.onFillImage(this.img);
    this.ctx.strokeRect(
      x - this.canvas.offsetLeft,
      y - this.canvas.offsetTop,
      width,
      height
    );
    this.ctx.stroke();
  }

  onFillImage(img) {
    this.ctx.drawImage(
      img,
      0,
      0,
      img.width / this.scale,
      img.height / this.scale
    );
  }

  onReset() {
    store.dispatch({ type: actiontype.BORDER, payload: this.info });
    this.canvas.removeEventListener("mousemove", this.onMousemove);
    this.canvas.removeEventListener("mouseup", this.onReset);
    this.canvas.removeEventListener("mouseout", this.onReset);
  }
}

export default CanvasView;
