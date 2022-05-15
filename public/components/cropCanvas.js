import { store } from "../store.js";
class CropCanvas {
  constructor(id, { width, height }) {
    this.canvas = document.querySelector(id);

    // this.baseScale = scale;
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = width;
    this.canvas.height = height;
  }
  draw() {
    store.subscribe(() => {
      if (!store.getState()) return;
      const { mode } = store.getState();
      if (mode === "none") return;
      this.drawLine();
    });
  }

  saveImage(img) {
    this.img = img;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // this.canvas.width = img.width * this.baseScale;
    // this.canvas.height = img.height * this.baseScale;
    // this.canvas.width = document.body.clientWidth;
    // this.canvas.height = document.body.clientHeight;
  }

  drawLine() {
    const { offset, imageRect, scale: baseScale, lines } = store.getState();
    const width = imageRect.width * baseScale; // 보여질 x좌표
    const height = imageRect.height * baseScale; // y좌표
    const scaleX = imageRect.width / this.canvas.width; // 박스넓이
    const scaleY = imageRect.height / this.canvas.height; // 박스 높이
    const maxScale = Math.max(scaleX, scaleY);
    const dw = imageRect.width * maxScale;
    const dh = imageRect.height * maxScale;
    const scaleX2 = this.canvas.width / dw;
    const scaleY2 = this.canvas.height / dh;
    const minScale = Math.min(scaleX2, scaleY2);

    // console.log(baseScale, maxScale, minScale);

    this.ctx.beginPath();
    this.ctx.strokeStyle = "red";
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(
      this.img,
      (imageRect.x - offset.left) * baseScale,
      (imageRect.y - offset.top) * baseScale,
      width,
      height,
      0,
      0,
      dw * minScale,
      dh * minScale
    );
    for (let i = 0; i < lines.length; i++) {
      const [w, t, b, cx] = lines[i];
      let mid = (cx - imageRect.x) * minScale * maxScale;
      if (cx === 0) mid = (dw * minScale) / 2;
      if (mid < 0) mid = 0;
      if (mid > dw * minScale) mid = dw * minScale;
      this.ctx.moveTo(mid, 0);
      this.ctx.lineTo(mid, dh * minScale);
    }
    this.ctx.stroke();
    this.ctx.closePath();
  }
}

export default CropCanvas;
