const connection = require("../../configs/connection")
exports.getNotification = (req, res, next) => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT uid, title, content, start_time, expiry_time FROM opendesign.notice WHERE expiry_time >= CURRENT_DATE()`, (err, row) => {
      // console.log("getnotifi")
      if (!err) {
        res.status(200).json(row)
      } else {
        console.log("getNotifi:", err)
        res.status(200).json(err)
      }
    })
  }).catch(err => console.log(err))
}

