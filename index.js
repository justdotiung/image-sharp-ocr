const express = require("express");
const fs = require("fs");
const XLSX = require("xlsx");
const app = express();

const images = require("./routers/image.js");
const googleApi = require("./routers/googleApi.js");
const { FILENAME } = require("./helper.js");

app.use(express.static("public"));
app.use(express.static("images"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/image", images);
app.use("/google-api", googleApi);

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

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
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

app.post("/xlsx", (req, res) => {
  try {
    const names = req.body.names;

    if (!fs.existsSync(__dirname + "/datas/output"))
      fs.mkdirSync(__dirname + "/datas/output", { recursive: true });

    // console.log(names);
    var workbook = XLSX.readFile(
      __dirname + "/datas/output/새벽토건 220513.xlsx"
    );
    var worksheet = workbook.Sheets["출력"];
    var range = worksheet["!ref"].split(":")[1].replace(/[A-Z]/g, "");
    var aoa = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
      range: "I1:J" + range,
    });

    var aoa2 = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
      range: "Q1:R" + range,
    });

    var aoa3 = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
      range: "X1:Y" + range,
    });

    var arrays = aoa
      .concat(aoa2)
      .concat(aoa3)
      .filter((arr) => arr.length);
    const filterDatas = [];
    // console.log(arrays);
    names.flat().forEach((data) => {
      const find = arrays.find((a) => a[0] === data);
      if (find) {
        filterDatas.push(find);
      } else {
        filterDatas.push([data]);
      }
    });

    const initsheet = [];
    const init = ["", "", "", "", ""];
    for (let i = 0; i < parseInt(range); i++) {
      initsheet.push(init);
    }

    console.log(FILENAME);

    if (fs.existsSync(__dirname + `/datas/output/새벽토건.xlsx`)) {
      workbook = XLSX.readFile(__dirname + "/datas/output/새벽토건.xlsx");
    }
    const worksheet2 = XLSX.utils.aoa_to_sheet(filterDatas);
    XLSX.utils.book_append_sheet(workbook, worksheet2, FILENAME.name);
    // XLSX.utils.sheet_add_aoa(worksheet, initsheet, { origin: "C5" });
    // XLSX.utils.sheet_add_aoa(worksheet, filterDatas, { origin: "C5" });
    XLSX.writeFile(workbook, __dirname + `/datas/output/새벽토건.xlsx`);

    i = 0;
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
