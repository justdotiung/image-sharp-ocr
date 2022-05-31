const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const sharp = require("sharp");
const { SLICE_IMAGE_PATHS, FILENAME } = require("../helper.js");
const images = express.Router();

const IMAGE_UPLOAD_PATH = path.resolve(__dirname, "../images");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isDirectory = fs.existsSync(IMAGE_UPLOAD_PATH);
    if (!isDirectory) fs.mkdirSync(IMAGE_UPLOAD_PATH);
    cb(null, "images/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

images.post("/upload", upload.single("file"), (req, res) => {
  let i = 0;
  while (fs.existsSync(IMAGE_UPLOAD_PATH + `/slice${i}.png`)) {
    fs.unlinkSync(IMAGE_UPLOAD_PATH + `/slice${i}.png`);
    i++;
  }

  FILENAME.name = "" + req.file.originalname.split(".")[0];
  console.log(FILENAME);
  console.log(IMAGE_UPLOAD_PATH);
  SLICE_IMAGE_PATHS.splice(0, SLICE_IMAGE_PATHS.length);
  console.log(req.body);
  const { imageRect, scale, offset, lines } = JSON.parse(req.body.rest);
  const x = parseInt((imageRect.x - offset.left) * scale);
  const y = parseInt((imageRect.y - offset.top) * scale);
  const width = parseInt(imageRect.width * scale);
  const height = parseInt(imageRect.height * scale);
  const filename = Date.now() + req.file.originalname;

  lines.sort((a, b) => a[3] - b[3]);

  const image = sharp(IMAGE_UPLOAD_PATH + "/" + req.file.filename);
  image.metadata().then(async (metadata) => {
    let img = image;
    if (metadata.width < metadata.height) {
      img = image.rotate();
    }
    return image
      .extract({
        left: x,
        top: y,
        width,
        height,
      })
      .toFile(IMAGE_UPLOAD_PATH + "/" + filename)
      .then(async (info) => {
        const innerscale = width / imageRect.width;
        let start = 0;
        let sum = 0;
        let px = 0;

        for (let i = 0; i <= lines.length; i++) {
          if (i < lines.length) {
            const [w, t, b, cx] = lines[i];
            px = parseInt((cx - imageRect.x) * innerscale) - start;
          } else {
            start = sum;
            px = info.width - sum;
          }
          await sharp(IMAGE_UPLOAD_PATH + "/" + filename)
            .clone()
            .extract({
              left: start,
              top: 0,
              width: px,
              height: info.height,
            })
            .resize({
              width: px + 30,
              height: info.height + 40,
              fit: "fill",
            })
            .toFile(IMAGE_UPLOAD_PATH + `/slice${i}.png`)
            .then((_) => {
              SLICE_IMAGE_PATHS.push({
                path: IMAGE_UPLOAD_PATH + `/slice${i}.png`,
                index: i,
              });
              if (i === lines.length) {
                fs.unlinkSync(IMAGE_UPLOAD_PATH + "/" + filename);
                fs.unlinkSync(IMAGE_UPLOAD_PATH + "/" + req.file.filename);
              }
            })
            .catch((e) => console.log(e));
          start = px + start;
          sum += px;
        }
      })
      .then(() => {
        return res.json({
          message: "success",
          length: SLICE_IMAGE_PATHS.length,
        });
      })
      .catch((err) => {
        console.log("여기서 잘못된다.");
        console.log(err);
        return res.json({ message: JSON.stringify(err) });
      });
  });
});

images.get("/:id", (req, res) => {
  const { id } = req.params;
  const data = fs.readFileSync(SLICE_IMAGE_PATHS[id].path);
  res.writeHead(200, {
    "Content-Type": "image/jpg",
    "Cache-Control": "no-store",
  });
  res.write(data);
  res.end();
});

module.exports = images;
