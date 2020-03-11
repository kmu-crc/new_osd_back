const connection = require("../configs/connection");
const Thumbnail = require("thumbnail");
const { S3Thumbnail } = require("../middlewares/S3Thumbnail");
// const fs = require("fs");

exports.createImages = (data) => {
  return new Promise((resolve, reject) => {
    let filename = null;
    if (data === null || !data.image) {
      resolve(null);
    }
    if (data.image.filename) {
      filename = data.image.filename; // thumbnail 이미지를 만들어야 하는 filename
    } else {
      filename = data.filename; // thumbnail 이미지를 만들어야 하는 filename
    }
    let thumbnail = new Thumbnail("uploads", "thumbnails"); // uploads 폴더에 있는 대상 파일을 작업 후에는 thumbnails폴더로 이동
    const thumbnailSizeObj = {
      "s_img": 50,
      "m_img": 200,
      "l_img": 600
    }; // Resizing 될 사이즈 크기
    let thumbnailObj = {
      "item_id": data.uid,
      "s_img": null,
      "m_img": null,
      "l_img": null
    };
    const createThumbnailForSize = async (file) => {
      return new Promise((resolve, reject) => {
        let arr = [];
        for (let key in thumbnailSizeObj) {
          arr.push(new Promise((resolve, reject) => {
            thumbnail.ensureThumbnail(file, null, thumbnailSizeObj[key], function (err, filename) {
              if (err) {
                reject(err);
              } else {
                thumbnailObj[key] = `${filename}`;
                resolve(true);
              }
            });
          }));
        }
        Promise.all(arr).then(() => {
          // 업로드된 파일을 thumbnail로 변환이 끝나면 원본파일을 삭제한다.
          // fs.unlink(`uploads/${filename}`, (err) => {
          //   if (err) throw err;
          // });
          resolve(thumbnailObj);
        });
      });
    };

    const insertThumbnail = (obj) => {
      return new Promise((resolve, reject) => {
        connection.query("INSERT INTO market.images SET ?", thumbnailObj, (err, rows) => {
          if (!err) {
            console.log(rows.insertId);
            resolve(rows.insertId);
          } else {
            reject(err);
          }
        });
      });
    };

    const onError = (error) => {
      return reject(error);
    };

    createThumbnailForSize(filename)
      .then(S3Thumbnail)
      .then(insertThumbnail)
      .then(thumbnailId => resolve(thumbnailId))
      .catch(onError);
  });
};
