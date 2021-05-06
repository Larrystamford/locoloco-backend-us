const AWS = require("aws-sdk");
const fs = require("fs");
const util = require("util");
const readdir = util.promisify(fs.readdir);
const readfile = util.promisify(fs.readFile);
const path = require("path");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

async function uploadFileToAws(file) {
  const fileName = `${new Date().getTime()}_${file.name}`;
  const mimetype = file.mimetype;
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileName,
    Body: file.data,
    ContentType: mimetype,
    ACL: "public-read",
  };
  const res = await new Promise((resolve, reject) => {
    s3.upload(params, (err, data) =>
      err == null ? resolve(data) : reject(err)
    );
  });
  return { url: res.Location };
}

async function uploadFirstFrame(data, fileName, mimetype) {
  const fileNameFirstFrame = `${new Date().getTime()}_${fileName}`;
  const paramsFirstFrame = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileNameFirstFrame,
    Body: data,
    ContentType: mimetype,
    ACL: "public-read",
  };
  const resFirstFrame = await new Promise((resolve, reject) => {
    s3.upload(paramsFirstFrame, (err, data) =>
      err == null ? resolve(data) : reject(err)
    );
  });

  return { url: resFirstFrame.Location };
}

async function uploadByFolder(folderPathName, fileExtension) {
  const uploadedFiles = [];
  const filenames = await readdir(folderPathName);
  let curFileExtension;
  let fileData;
  let res;
  let params;
  for (const filename of filenames) {
    curFileExtension = path.extname(filename);
    if (curFileExtension == fileExtension) {
      fileData = await readfile(folderPathName + filename);
      params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: filename,
        Body: fileData,
        ACL: "public-read",
      };
      res = await new Promise((resolve, reject) => {
        s3.upload(params, (err, data) =>
          err == null ? resolve(data) : reject(err)
        );
      });
      uploadedFiles.push(res);
    }
  }

  // for (const file of uploadedFiles) {
  //   console.log(file);
  // }

  return uploadedFiles;
}

module.exports = {
  uploadFileToAws,
  uploadFirstFrame,
  uploadByFolder,
};
