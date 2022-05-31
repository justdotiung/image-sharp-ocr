import { imageRender } from "../app.js";
import { actiontype, store } from "../store.js";

class ImageForm {
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
    store.dispatch({ action: actiontype.INITSTATE });

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
    // var req = new XMLHttpRequest();
    // req.open("POST", "/upload");
    // req.send(data);

    fetch("image/upload", {
      method: "POST",
      body: data,
    })
      .then((r) => r.json())
      .then((r) => {
        alert(r.message);
        console.log(r);

        if (r.message === "success") {
          imageRender.setIds(r.length);
          imageRender.reset();
          store.dispatch({ type: actiontype.UPLOAD, payload: true });
        }
      });
  }
}

export default ImageForm;
