const express = require("express");
const vision = require("@google-cloud/vision");
const fs = require("fs");
const multer = require("multer");
const sharp = require("sharp");
const XLSX = require("xlsx");
const app = express();

app.use(express.static("public"));
app.use(express.static("images"));
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

app.post("/upload", upload.single("file"), (req, res) => {
  let i = 0;
  while (fs.existsSync(__dirname + `/images/slice${i}.png`)) {
    fs.unlinkSync(__dirname + `/images/slice${i}.png`);
    i++;
  }
  SLICE_IMAGE_PATHS.splice(0, SLICE_IMAGE_PATHS.length);

  const { imageRect, scale, offset, lines } = JSON.parse(req.body.rest);
  const x = parseInt((imageRect.x - offset.left) * scale);
  const y = parseInt((imageRect.y - offset.top) * scale);
  const width = parseInt(imageRect.width * scale);
  const height = parseInt(imageRect.height * scale);
  const filename = Date.now() + req.file.originalname;

  lines.sort((a, b) => a[3] - b[3]);

  const image = sharp(__dirname + "/images/" + req.file.filename);
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
      .toFile(__dirname + "/images/" + filename)
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
          await sharp(__dirname + "/images/" + filename)
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
            .toFile(__dirname + `/images/slice${i}.png`)
            .then((_) => {
              SLICE_IMAGE_PATHS.push({
                path: __dirname + `/images/slice${i}.png`,
                index: i,
              });
              if (i === lines.length) {
                fs.unlinkSync(__dirname + "/images/" + filename);
                fs.unlinkSync(__dirname + "/images/" + req.file.filename);
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

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/image/:id", (req, res) => {
  const { id } = req.params;
  const data = fs.readFileSync(SLICE_IMAGE_PATHS[id].path);
  res.writeHead(200, {
    "Content-Type": "image/jpg",
    "Cache-Control": "no-store",
  });
  res.write(data);
  res.end();
});

app.get("/extract", async (req, res) => {
  if (!SLICE_IMAGE_PATHS.length)
    return res.json({ message: "먼저 이미지를 잘라주세요." });
  console.log(SLICE_IMAGE_PATHS);

  try {
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
      const t = { arr: [] };
      if (!result.fullTextAnnotation) continue;
      const { text } = result.fullTextAnnotation;
      writePromises.push(
        fs.promises.writeFile(
          __dirname + `/datas/ocr/text_${i}.json`,
          JSON.stringify({ text })
        )
      );
    }

    await Promise.all(writePromises);

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
      isComplete: true,
    });
  } catch (e) {
    res.json({ message: "실패", isComplete: true });
  }
});

app.get("/ocr", (req, res) => {
  const data = JSON.parse(
    fs.readFileSync(__dirname + "/db/data.json", {
      encoding: "utf8",
      flag: "r",
    })
  );
  if (data.month !== new Date().getMonth()) {
    fs.writeFileSync(
      __dirname + "/db/data.json",
      JSON.stringify(
        { mountAPIreqCount: 1000, month: new Date().getMonth() },
        null,
        " "
      )
    );
  }
  res.json(data);
});

app.get("/xlsx", (req, res) => {
  try {
    if (!fs.existsSync(__dirname + "/datas/output"))
      fs.mkdirSync(__dirname + "/datas/output", { recursive: true });

    const datas = [];

    while (fs.existsSync(__dirname + `/datas/ocr/text_${i}.json`)) {
      const data = fs.readFileSync(__dirname + `/datas/ocr/text_${i}.json`, {
        encoding: "utf8",
        flag: "r",
      });
      datas.push(JSON.parse(data).text.split("\n"));
    }

    const lengths = datas.map((d) => d.length);
    const maxRow = Math.max(...lengths);

    const sheet = [];
    for (let i = 0; i < maxRow; i++) sheet.push([]);

    for (let i = 0; i < datas.length; i++) {
      for (let j = 0; j < datas[i].length; j++) {
        sheet[j][i] = datas[i][j] = datas[i][j].replace(/\d/g, "").trim();
      }
    }

    var workbook = XLSX.readFile(__dirname + "/datas/output/새벽토건.xlsx");
    var worksheet = workbook.Sheets["출력"];
    var range = worksheet["!ref"].split(":")[1].replace(/[A-Z]/g, "");
    var aoa = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
      range: "I1:N" + range,
    });

    var aoa2 = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
      range: "Q1:U" + range,
    });

    var arrays = aoa.concat(aoa2).filter((arr) => arr.length);
    const filterDatas = [];
    const rest = [];
    datas.flat().forEach((data) => {
      const find = arrays.find((a) => a[0] === data);
      if (find) {
        filterDatas.push(find);
      } else {
        filterDatas.push([data]);
      }
    });

    console.log(filterDatas);

    const worksheet2 = XLSX.utils.aoa_to_sheet(filterDatas);

    XLSX.utils.book_append_sheet(workbook, worksheet2, "비교완료");
    XLSX.writeFile(workbook, __dirname + "/datas/output/create.xlsx");

    let i = 0;
    while (fs.existsSync(__dirname + `/datas/ocr/text_${i}.json`)) {
      fs.unlinkSync(__dirname + `/datas/ocr/text_${i}.json`);
      i++;
    }
  } catch (e) {
    console.log(e);
    return res.json({ message: "열려있는 엑셀파일이 닫고 시도하세요." });
  }

  res.json({ message: "성공" });
});

app.listen("8000", () => console.log("listen port 8000"));
