import { actiontype, store } from "../store.js";
console.log("ImageFormView");

class ImageFormView {
  constructor(id) {
    this.el = document.querySelector(id);
    this.input = this.el.querySelector(".image__input");
    this.button = this.el.querySelector(".image__button");
    this.hidden = this.el.querySelector("#rest");
    this.onThumbnail = this.onThumbnail.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.input.addEventListener("change", this.onThumbnail);
    this.el.addEventListener("submit", this.onSubmit);
  }

  onThumbnail(e) {
    const reader = new FileReader();
    const ele = this.el;
    reader.onload = function (event) {
      const value = event.target.result;
      const evt = new CustomEvent("@thumbnail", {
        detail: { value },
      });
      ele.dispatchEvent(evt);
    };
    reader.readAsDataURL(e.target.files[0]);
  }

  on(eventName, cb) {
    this.el.addEventListener(eventName, cb);
  }

  onSubmit(e) {
    e.preventDefault();
    const { imageRect } = store.getState();
    if (imageRect.width === 0) {
      alert("영역을 먼저 지정해주세요.");
      return;
    }
    const data = new FormData();
    data.append("rest", JSON.stringify(store.getState()));
    data.append("file", this.input.files[0]);
    console.log(data.get("file"));
    // var req = new XMLHttpRequest();
    // req.open("POST", "/upload");
    // req.send(data);

    fetch("/upload", {
      method: "POST",
      body: data,
    })
      .then((r) => r.json())
      .then((r) => {
        console.log(r);
        // store.dispatch({ type: actiontype.INITSTATE });
      });
  }
}

export default ImageFormView;
