const express = require("express");
const vision = require("@google-cloud/vision");
const fs = require("fs");
const multer = require("multer");
const sharp = require("sharp");
const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// db폴더 생성
const isDirectory = fs.existsSync(__dirname + "/db");
if (!isDirectory) fs.mkdirSync(__dirname);
const isdbData = fs.existsSync(__dirname + "/db/data.json");
if (!isdbData) {
  try {
    fs.writeFileSync(
      __dirname + "/db/data.json",
      JSON.stringify({ mountAPIreqCount: 1000 }, null, " ")
    );
  } catch (e) {
    console.log(e);
  }
}

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images/");
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split(".").at(-1);
    cb(null, "file." + ext);
  },
});
const upload = multer({ storage });

// fs.appendFile("test.json", JSON.stringify(a));
// fs.appendFile("test.json", JSON.stringify({ a: 1 }));

// app.get("/", (req, res) => {
//   // res.status

//   // fs.writeFileSync("test.txt", "한글ddfsgksdf");
//   (async () => {
//     // Creates a client
//     const client = new vision.ImageAnnotatorClient();

//     /**
//      * TODO(developer): Uncomment the following line before running the sample.
//      */
//     // const fileName = 'Local image file, e.g. /path/to/image.png';

//     // Performs text detection on the local file
//     const t = { arr: [] };
//     const [result] = await client.textDetection("df.jpg");
//     const detections = result.textAnnotations;
//     console.log("Text:");
//     detections.forEach((text, i) => {
//       t.arr.push(text);
//       console.log("ing");
//       fs.writeFile(`tes1t${i}.json`, JSON.stringify(text, null, "  "));
//     });
//     console.log("f");
//     // fs.appendFile("testt.json", JSON.stringify(t));
//     fs.writeFile("tt.json", JSON.stringify(t));
//     res.status(200).json(t);
//   })();
// });

app.post("/upload", upload.single("file"), (req, res) => {
  console.log(req.file);
  const { divistionCount, imageRect, scale, offset } = JSON.parse(
    req.body.rest
  );
  const x = parseInt((imageRect.x - offset.left) * scale);
  const y = parseInt((imageRect.y - offset.top) * scale);
  const width = parseInt(imageRect.width * scale);
  const height = parseInt(imageRect.height * scale);

  sharp(__dirname + "/images/" + req.file.filename)
    .extract({
      left: x,
      top: y,
      width,
      height,
    })
    .toFile(__dirname + "/images/output.png")
    .then((info) => {
      const dw = Math.floor(info.width / divistionCount);
      for (let i = 1; i <= divistionCount; i++) {
        sharp(__dirname + "/images/output.png")
          .extract({
            left: dw * (i - 1),
            top: 0,
            width: dw,
            height: info.height,
          })
          .toFile(__dirname + `/images/output${i}.png`)
          .catch((err) => res.json({ message: err }));
      }
    })
    .then(() => res.json({ message: "성공" }))
    .catch((err) => res.json({ message: err }));
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/api/count", (req, res) => {
  res.status(200).json({data: })
})

app.listen("8000", () => console.log("listen port 8000"));
