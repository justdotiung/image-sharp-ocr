import { store } from "../store.js";
console.log("ImageFormView");

class ImageFormView {
  constructor(id) {
    this.el = document.querySelector(id);
    this.input = this.el.querySelector(".image__input");
    this.button = this.el.querySelector(".image__button");
    this.hidden = this.el.querySelector("#hidden");
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
    // this.hidden.value = JSON.stringify(store.getState());
    // const formdata = new FormData();
    // formdata.append("image", this.input.files[0]);
    // fetch("/upload", {
    //   method: "POST",
    //   data: formdata,
    //   headers: {
    //     "Content-Type": "application/json",
    //     // 'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    // })
    //   .then((r) => r.json())
    //   .then((r) => console.log(r));
  }
}

export default ImageFormView;
