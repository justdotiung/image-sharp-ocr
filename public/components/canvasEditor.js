import { actiontype, store } from "../store.js";

class CanvasEditor {
  constructor(id) {
    this.canvas = document.querySelector(id);
    // this.baseScale = scale;
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
      case "resize":
        return this.resize();
      default:
        throw Error("선택모드없음");
    }
  }

  saveImage(img) {
    this.img = img;
    const width = this.canvas.parentNode.clientWidth;
    this.baseScale = width / img.width;
    this.canvas.width = img.width * this.baseScale;
    this.canvas.height = img.height * this.baseScale;
    const scaleX = img.width / this.canvas.width;
    const scaleY = img.height / this.canvas.height;
    const scale = Math.max(scaleX, scaleY);
    this.scale = scale;
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

    var offset = { x: 0, y: 0 };
    var node = this.canvas.offsetParent;
    while (node) {
      offset.x += node.offsetLeft;
      offset.y += node.offsetTop;
      node = node.offsetParent;
    }

    this.parentLeft = offset.x;
    this.parentTop = offset.y;

    store.dispatch({
      type: actiontype.OFFSET,
      payload: {
        left: this.canvas.offsetLeft + this.parentLeft,
        top: this.canvas.offsetTop + this.parentTop,
      },
    });

    this.canvas.addEventListener("mousemove", this.onMousemove);
    this.canvas.addEventListener("mouseup", this.onupBoxRect);
  }

  resize() {
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
    if (this.info.y < offset.top) this.info.y = offset.top;
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
    const { lines } = store.getState();
    let width = e.clientX - this.info.x;
    let height = e.clientY - this.info.y;
    if (width < 10 || height < 10) {
      width = 10;
      height = 10;
    }
    this.info.width = width;
    this.info.height = height;
    this.drawLine([...lines]);
  }

  drawLine(lines) {
    const { offset } = store.getState();
    this.onDrawRact(this.info);
    this.ctx.strokeStyle = "blue";
    for (let i = 0; i < lines.length; i++) {
      this.ctx.beginPath();
      if (i === lines.length - 1) {
        this.ctx.strokeStyle = "red";
      }
      const [w, t, b, cx] = lines[i];
      let newX = w + cx - this.info.x - this.info.width / 2 - offset.left;
      if (newX < this.info.x - offset.left) newX = this.info.x - offset.left;
      if (newX > this.info.x + this.info.width - offset.left)
        newX = this.info.x + this.info.width - offset.left;

      this.ctx.moveTo(newX, t);
      this.ctx.lineTo(newX, b);
      this.ctx.stroke();
      this.ctx.closePath();
    }
  }

  onDrawRact({ x, y, width, height }) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = "blue";
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.onFillImage(this.img);
    this.ctx.strokeRect(
      x - this.canvas.offsetLeft - this.parentLeft,
      y - this.canvas.offsetTop - this.parentTop,
      width,
      height
    );
    this.ctx.stroke();
    this.ctx.save();
    this.ctx.closePath();
  }

  onupBoxRect() {
    const { mode } = store.getState();
    store.dispatch({ type: actiontype.BORDER, payload: this.info });
    if (mode === "crop") {
      store.dispatch({ type: actiontype.CREATBOX, payload: true });
      store.dispatch({ type: actiontype.MODE, payload: "none" });
    }
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
