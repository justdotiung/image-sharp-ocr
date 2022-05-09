import { actiontype, store } from "../store.js";
console.log("canvas");

class CropCanvas {
  constructor(id, scale) {
    this.canvas = document.querySelector(id);

    this.baseScale = scale;
    this.ctx = this.canvas.getContext("2d");
  }
  draw() {
    store.subscribe(() => {
      const { mode, createBox } = store.getState();
      console.log(mode, createBox);
      if (!createBox && mode === "crop") {
        console.log(123);
        this.cropImage();
      }
      if (createBox && mode === "move") {
        console.log(12);
        this.moveImage();
      }
      if (createBox && mode === "addLine") {
        console.log(1);
        this.addLine();
      }

      return;
    });
  }
  // clear() {
  //   this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  // }

  saveImage(img) {
    this.img = img;
    this.canvas.width = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight;
  }

  addLine() {
    const { offset, imageRect, scale: baseScale } = store.getState();
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
    this.ctx.moveTo((dw * minScale) / 2, 0);
    this.ctx.lineTo((dw * minScale) / 2, dh * minScale);
    this.ctx.stroke();
    this.ctx.closePath();
  }

  moveImage() {
    const { offset, imageRect, scale: baseScale } = store.getState();
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
    this.ctx.beginPath();
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
    this.ctx.closePath();
  }

  cropImage() {
    const { offset, imageRect, scale: baseScale } = store.getState();
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
    this.ctx.beginPath();
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
    this.ctx.closePath();
  }
}

export default CropCanvas;
