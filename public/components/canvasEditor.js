import { actiontype, store } from "../store.js";
console.log("canvas");

class CanvasEditor {
  constructor(id, scale) {
    this.canvas = document.querySelector(id);
    this.baseScale = scale;
    this.ctx = this.canvas.getContext("2d");
    this.info = {};

    this.onMousemove = this.onMousemove.bind(this);
    this.onBoxMove = this.onBoxMove.bind(this);
    this.onLineMove = this.onLineMove.bind(this);

    this.onupBoxMove = this.onupBoxMove.bind(this);
    this.onupBoxRect = this.onupBoxRect.bind(this);
    this.onupLineMove = this.onupLineMove.bind(this);

    this.canvas.addEventListener("mousedown", (event) => {
      const { mode } = store.getState();
      this.setMode(mode, event);
    });
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  setMode(mode, event) {
    switch (mode) {
      case "none":
        return;
      case "crop":
        return this.crop(event);
      case "addLine":
        return this.add();
      case "removeLine":
        return this.remove(event);
      case "move":
        return this.move();
    }
  }

  saveImage(img) {
    this.img = img;
    this.canvas.width = img.width * this.baseScale;
    this.canvas.height = img.height * this.baseScale;
    const scaleX = img.width / this.canvas.width;
    const scaleY = img.height / this.canvas.height;
    const scale = Math.max(scaleX, scaleY);
    this.scale = scale;
    store.dispatch({ type: actiontype.SCALE, payload: scale });
    this.onFillImage(this.img);
  }

  onFillImage(img = this.img) {
    this.ctx.drawImage(
      img,
      0,
      0,
      img.width * this.baseScale,
      img.height * this.baseScale
    );
  }

  crop(event) {
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
    this.canvas.addEventListener("mouseup", this.onupBoxRect);
  }
  add() {
    this.canvas.addEventListener("mousemove", this.onLineMove);
    this.canvas.addEventListener("mouseup", this.onupLineMove);
  }

  move() {
    this.canvas.addEventListener("mousemove", this.onBoxMove);
    this.canvas.addEventListener("mouseup", this.onupBoxMove);
  }
  onBoxMove(e) {
    const { offset, imageRect, lines } = store.getState();
    const { x, y, width, height } = imageRect;
    this.info.x = e.clientX - width / 2;
    this.info.y = e.clientY - height / 2;

    if (this.info.x < offset.left) this.info.x = offset.left;
    if (this.info.x + width - offset.left > this.canvas.width)
      this.info.x = this.canvas.width + offset.left - width;
    if (this.info.y < offset.top) this.info.y = off.top;
    if (this.info.y - offset.top + height > this.canvas.height) {
      this.info.y = this.canvas.height + offset.top - height;
    }

    for (let i = 0; i < lines.length; i++) {
      lines[i][0] = x + width / 2;
      lines[i][1] = y - offset.top;
      lines[i][2] = y + height - offset.top;
    }
    store.dispatch({ type: actiontype.LINEPOSITION, payload: lines });
    store.dispatch({ type: actiontype.BORDER, payload: this.info });
    // this.onDrawRact(this.info);
    this.drawLine(lines);
  }

  onLineMove(e) {
    const { lines } = store.getState();
    const curr = lines[lines.length - 1];
    curr.splice(3, 1, e.clientX);
    const newLine = [...curr];
    lines.splice(lines.length - 1, 1, newLine);
    this.drawLine([...lines]);
    store.dispatch({ type: actiontype.LINEPOSITION, payload: lines });
  }

  onMousemove(e) {
    let width = e.clientX - this.info.x;
    let height = e.clientY - this.info.y;
    if (Math.abs(width) < 10 || Math.abs(height) < 10) {
      width = 10;
      height = 10;
    }
    this.info.width = width;
    this.info.height = height;
    this.onDrawRact(this.info);
  }

  drawLine(lines) {
    const { imageRect } = store.getState();
    this.onDrawRact(imageRect);
    this.ctx.beginPath();
    this.ctx.strokeStyle = "red";
    for (let i = 0; i < lines.length; i++) {
      const [w, t, b, cx] = lines[i];
      let newX = w + cx - imageRect.x - imageRect.width / 2;
      // if (newX < imageRect.x) newX = imageRect.x;
      // if (newX > imageRect.x + imageRect.width)
      //   newX = imageRect.x + imageRect.width;
      this.ctx.moveTo(newX, t);
      this.ctx.lineTo(newX, b);
    }
    this.ctx.stroke();
    this.ctx.closePath();
  }

  onDrawRact({ x, y, width, height }) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = "blue";
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.onFillImage(this.img);
    this.ctx.strokeRect(
      x - this.canvas.offsetLeft,
      y - this.canvas.offsetTop,
      width,
      height
    );
    this.ctx.stroke();
    this.ctx.save();
    this.ctx.closePath();
  }

  onupBoxRect() {
    store.dispatch({ type: actiontype.BORDER, payload: this.info });
    store.dispatch({ type: actiontype.CREATBOX, payload: true });
    store.dispatch({ type: actiontype.MODE, payload: "none" });
    this.canvas.removeEventListener("mousemove", this.onMousemove);
    this.canvas.removeEventListener("mouseup", this.onupBoxRect);
  }

  onupLineMove() {
    this.canvas.removeEventListener("mousemove", this.onLineMove);
    this.canvas.removeEventListener("mouseup", this.onupLineMove);
    this.canvas.removeEventListener("mouseout", this.onLineMove);
  }

  onupBoxMove() {
    this.canvas.removeEventListener("mousemove", this.onBoxMove);
    this.canvas.removeEventListener("mouseup", this.onupBoxMove);
    this.canvas.removeEventListener("mouseout", this.onBoxMove);
  }
}

export default CanvasEditor;
