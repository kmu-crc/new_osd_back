const connection = require("../../configs/connection");

exports.getCategoryLevel1 = (req, res, err) => {
  const getCategort = (userId) => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM market.category_level1", (err, rows) => {
        if (!err) {
          //console.log(rows);
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  };

  const respond = (data) => {
    res.status(200).json({
      success: true,
      category: data
    });
  };
  const error = (err) => {
    res.status(500).json({
      success: false,
      error: err
    });
  };

  getCategort()
    .then(respond)
    .catch(error);
};

exports.getCategoryLevel2 = (req, res, err) => {
  const parentsId = req.params.id;
  const getCategort = (userId) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM category_level2 WHERE parents_id = ${parentsId}`, (err, rows) => {
        if (!err) {
          //console.log(rows);
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  };

  const respond = (data) => {
    res.status(200).json({
      success: true,
      category: data
    });
  };
  const error = (err) => {
    res.status(500).json({
      success: false,
      error: err
    });
  };

  getCategort()
    .then(respond)
    .catch(error);
};

exports.getCategoryAll = (req, res, next) => {
  let category1;
  let category2 = [];

  // const getCategory1 = () => {
  //   return new Promise((resolve, reject) => {
  //     connection.query("SELECT * FROM category_level1", async (err, rows) => {
  //       if (!err && rows.length === 0) {
  //         //console.log("no category");
  //         resolve(null);
  //       } else if (!err && rows.length > 0) {
  //         category1 = rows;
  //         for (let i in rows) {
  //           const cate2 = await getCategory2(rows[i].uid);
  //           category2.push(cate2);
  //         }
  //         const data = {
  //           category1: category1,
  //           category2: category2
  //         };
  //         resolve(data);
  //       } else {
  //         reject(err);
  //       }
  //     });
  //   });
  // };

  // const getCategory2 = (cate1) => {
  //   return new Promise((resolve, reject) => {
  //     connection.query("SELECT * FROM category_level2 WHERE parents_id = ?", cate1, (err, rows) => {
  //       if (!err && rows.length === 0) {
  //         //console.log("no category2");
  //         resolve(null);
  //       } else if (!err && rows.length > 0) {
  //         resolve(rows);
  //       } else {
  //         reject(err);
  //       }
  //     });
  //   });
  // };

  const respond = (data) => {
    res.status(200).json({
      success: true,
      data: data
    });
  };

  const error = (err) => {
    res.status(500).json({
      success: false,
      error: err
    });
  };

  // getCategory1()
  //   .then(respond)
  //   .catch(error);

  const getLevel1 = () => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM market.category_level1", (err, rows) => {
        if (!err && rows.length === 0) {
          resolve(null);
        } else if (!err && rows.length > 0) {
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  };
  const getLevel2 = (level1) => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM market.category_level2", (err, rows) => {
        if (!err && rows.length === 0) {
          resolve(null);
        } else if (!err && rows.length > 0) {
          const data = {
            category1: level1,
            category2: rows
          };
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  getLevel1()
    .then(level1 => getLevel2(level1))
    .then(respond)
    .catch(error);
};
