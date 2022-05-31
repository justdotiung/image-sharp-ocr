const express = require("express");
const path = require("path");
const fs = require("fs");
const vision = require("@google-cloud/vision");
const { SLICE_IMAGE_PATHS } = require("../helper.js");
const googleLens = express.Router();

const DB_PATH = path.resolve(__dirname, "../db");
const OCR_PATH = path.resolve(__dirname, "../datas/ocr");
const client = new vision.ImageAnnotatorClient();

googleLens.get("/extract", async (req, res) => {
  const data = JSON.parse(
    fs.readFileSync(DB_PATH + "/data.json", {
      encoding: "utf8",
      flag: "r",
    })
  );

  if (!SLICE_IMAGE_PATHS.length)
    return res.json({
      message: "먼저 이미지를 잘라주세요.",
      mountAPIreqCount: data.mountAPIreqCount,
      isComplete: true,
    });

  if (fs.existsSync(OCR_PATH + `/text_0.json`)) {
    const datas = [];
    let i = 0;
    while (fs.existsSync(OCR_PATH + `/text_${i}.json`)) {
      const data = fs.readFileSync(OCR_PATH + `/text_${i}.json`, {
        encoding: "utf8",
        flag: "r",
      });
      const newData = JSON.parse(data)
        .text.split("\n")
        .map((t) =>
          t
            .replace(/\d/g, "")
            .replace(/\(.*\)/g, "")
            .replace(/[^가-힣]/g, "")
            .trim()
        );
      datas.push(newData);
      i++;
    }

    return res.status(200).json({
      message: "추출되었습니다.",
      mountAPIreqCount: data.mountAPIreqCount,
      isComplete: true,
      ocrDatas: datas,
    });
  }

  try {
    const isDirectory = fs.existsSync(OCR_PATH);
    if (!isDirectory) {
      fs.mkdirSync(OCR_PATH, { recursive: true });
    }
    const promises = [];
    const writePromises = [];

    for (const { path } of SLICE_IMAGE_PATHS) {
      promises.push(client.textDetection(path));
    }

    const values = await Promise.all(promises);
    console.log(123);

    for (let i = 0; i < values.length; i++) {
      const [result] = values[i];
      const t = { arr: [] };
      if (!result.fullTextAnnotation) continue;
      const { text } = result.fullTextAnnotation;
      // writePromises.push(
      //   fs.promises.writeFile(
      //     OCR_PATH + `/text_${i}.json`,
      //     JSON.stringify({ text })
      //   )
      // );

      fs.writeFileSync(OCR_PATH + `/text_${i}.json`, JSON.stringify({ text }));
    }

    // await Promise.all(writePromises);

    const datas = [];
    let i = 0;
    while (fs.existsSync(OCR_PATH + `/text_${i}.json`)) {
      const data = fs.readFileSync(OCR_PATH + `/text_${i}.json`, {
        encoding: "utf8",
        flag: "r",
      });
      const newData = JSON.parse(data)
        .text.split("\n")
        .map((t) =>
          t
            .replace(/\d/g, "")
            .replace(/\(.*\)/g, "")
            .replace(/[^가-힣]/g, "")
            .trim()
        );
      datas.push(newData);
      i++;
    }

    const data = JSON.parse(
      fs.readFileSync(DB_PATH + "/data.json", {
        encoding: "utf8",
        flag: "r",
      })
    );
    const newData = {
      ...data,
      mountAPIreqCount: data.mountAPIreqCount - SLICE_IMAGE_PATHS.length,
    };
    fs.writeFileSync(
      DB_PATH + "/data.json",
      JSON.stringify(newData, null, "  ")
    );
    SLICE_IMAGE_PATHS.splice(0, SLICE_IMAGE_PATHS.length);

    res.status(200).json({
      message: "추출되었습니다.",
      mountAPIreqCount: newData.mountAPIreqCount,
      isComplete: true,
      ocrDatas: datas,
    });
  } catch (e) {
    res.json({ message: "실패", isComplete: true });
  }
});

module.exports = googleLens;
