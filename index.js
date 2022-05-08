const express = require("express");
const vision = require("@google-cloud/vision");
const fs = require("fs");
const multer = require("multer");
const sharp = require("sharp");
const XLSX = require("xlsx");
const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// db폴더 생성
const isDirectory = fs.existsSync(__dirname + "/db");
if (!isDirectory) fs.mkdirSync(__dirname + "/db");
const isdbData = fs.existsSync(__dirname + "/db/data.json");
if (!isdbData) {
  try {
    fs.writeFileSync(
      __dirname + "/db/data.json",
      JSON.stringify(
        { mountAPIreqCount: 1000, month: new Date().getMonth() },
        null,
        " "
      )
    );
  } catch (e) {
    console.log(e);
  }
}

const SLICE_IMAGE_PATHS = [];

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isDirectory = fs.existsSync(__dirname + "/images");
    if (!isDirectory) fs.mkdirSync(__dirname + "/images");
    cb(null, "images/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
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

  const filename = Date.now() + req.file.originalname;
  sharp(__dirname + "/images/" + req.file.filename)
    // .rotate()
    .extract({
      left: x,
      top: y,
      width,
      height,
    })
    .toFile(__dirname + "/images/" + filename)
    .then(async (info) => {
      const dw = Math.floor(info.width / divistionCount);
      for (let i = 1; i <= divistionCount; i++) {
        await sharp(__dirname + "/images/" + filename)
          .clone()
          .extract({
            left: dw * (i - 1),
            top: 0,
            width: dw,
            height: info.height,
          })
          .toFile(__dirname + `/images/slice${i}.png`)
          .then((_) => {
            SLICE_IMAGE_PATHS.push({
              path: __dirname + `/images/slice${i}.png`,
              index: i,
            });
            if (i === divistionCount) {
              fs.unlinkSync(__dirname + "/images/" + filename);
              fs.unlinkSync(__dirname + "/images/" + req.file.filename);
            }
          })
          .catch(
            (err) => console.log(err)
            //  res.json({ message: "이미지의 가로세로 확인이 필요합니다." })
          );
      }
    })
    .then(() => {
      return res.json({ message: "성공" });
    })
    .catch((err) => res.json({ message: err }));
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/extract", async (req, res) => {
  if (!SLICE_IMAGE_PATHS.length)
    return res.json({ message: "먼저 이미지를 잘라주세요." });
  const isDirectory = fs.existsSync(__dirname + "/datas/ocr");
  if (!isDirectory) {
    fs.mkdirSync(__dirname + "/datas/ocr", { recursive: true });
  }
  const promises = [];
  const writePromises = [];
  const client = new vision.ImageAnnotatorClient();

  for (const { path } of SLICE_IMAGE_PATHS) {
    promises.push(client.textDetection(path));
  }

  const values = await Promise.all(promises);

  for (let i = 0; i < values.length; i++) {
    const [result] = values[i];
    console.log(result);
    const t = { arr: [] };
    const { text } = result.fullTextAnnotation;
    writePromises.push(
      fs.promises.writeFile(
        __dirname + `/datas/ocr/text_${i}.json`,
        JSON.stringify({ text })
      )
    );
  }

  await Promise.all(writePromises).then(() => {
    for (const { path } of SLICE_IMAGE_PATHS) {
      fs.promises.unlink(path);
    }
  });

  const data = JSON.parse(
    fs.readFileSync(__dirname + "/db/data.json", {
      encoding: "utf8",
      flag: "r",
    })
  );
  const newData = {
    ...data,
    mountAPIreqCount: data.mountAPIreqCount - SLICE_IMAGE_PATHS.length,
  };
  fs.writeFileSync(
    __dirname + "/db/data.json",
    JSON.stringify(newData, null, "  ")
  );
  SLICE_IMAGE_PATHS.splice(0, SLICE_IMAGE_PATHS.length);
  res.status(200).json({
    message: "추출되었습니다.",
    mountAPIreqCount: newData.mountAPIreqCount,
  });
});

app.get("/ocr", (req, res) => {
  const data = JSON.parse(
    fs.readFileSync(__dirname + "/db/data.json", {
      encoding: "utf8",
      flag: "r",
    })
  );
  res.json(data);
});

app.get("/xlsx", async (req, res) => {
  if (!fs.existsSync(__dirname + "/datas/output"))
    fs.mkdirSync(__dirname + "/datas/output", { recursive: true });

  const workbook = XLSX.utils.book_new();
  const datas = [];
  let i = 0;
  while (fs.existsSync(__dirname + `/datas/ocr/text_${i}.json`)) {
    console.log(i);
    const data = fs.readFileSync(__dirname + `/datas/ocr/text_${i}.json`, {
      encoding: "utf8",
      flag: "r",
    });
    i++;
    datas.push(JSON.parse(data).text.split("\n"));
  }

  const lengths = datas.map((d) => d.length);
  const maxRow = Math.max(...lengths);

  const sheet = [];
  for (let i = 0; i < maxRow; i++) sheet.push([]);

  for (let i = 0; i < datas.length; i++) {
    console.log(datas[i].length);
    console.log(datas[i]);
    for (let j = 0; j < datas[i].length; j++) {
      sheet[j][i] = datas[i][j];
    }
  }

  console.log(sheet);

  const worksheet1 = XLSX.utils.aoa_to_sheet(sheet);

  XLSX.utils.book_append_sheet(workbook, worksheet1, "date");
  XLSX.writeFile(workbook, __dirname + "/datas/output/create.xlsx");

  res.json({ message: "성공" });
});

app.listen("8000", () => console.log("listen port 8000"));
