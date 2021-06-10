const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const { S3Upload } = require("../../middlewares/S3Sources");
const connection = require("../../configs/connection");


// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './tmps');
    },
    // filename: function (req, file, cb) {
    //     cb(null, file.originalname);
    // }
});
var upload = multer({ storage: storage })

router.post("/tmp",
    upload.single('source'),
    async (req, res, next) => {
        console.log(req.file);
        const s3path = await S3Upload(req.file.path, `${req.file.originalname}`) || null;
        console.log(s3path);
        res.status(200).json({ success: true, path: s3path, message: "good!" })
    }
);

module.exports = router;

// ENCODING FLOW
// const spawn = require('child_process').spawn
// const convertToMP4 = (filename) => {
//     return new Promise((resolve, reject) => {
//         const new_file_name = encoded_filename.replace(ext, "_.mp4")
//         const args = ['-y', '-i', `${filename}`, '-strict', '-2', '-c:a', 'aac', '-c:v', 'libx264', '-f', 'mp4', `${new_file_name}`]
//         var proc = spawn('ffmpeg', args)
//         console.log('Spawning ffmpeg ' + args.join(' '))
//         proc.on('exit', code => {
//             if (code === 0) {
//                 console.log('successful!')
//                 fs.unlink(filename, err => { if (err) console.log(err) })
//                 resolve(new_file_name)
//             }
//             else {
//                 console.log("why come here?ahm")
//                 reject(false)
//             }
//         })
//     })
// }