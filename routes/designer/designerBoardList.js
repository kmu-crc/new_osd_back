const connection = require("../../configs/connection");

exports.designerBoardList = (req, res, next) => {
  const page = req.params.page;
  const category1 = req.params.cate1 && req.params.cate1 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate1 : null;
  const category2 = req.params.cate2 && req.params.cate2 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate2 : null;
  const keyword = req.params.keyword && req.params.keyword !== "null" && req.params.keyword !== "undefined" ? req.params.keyword : null;
  const sort = (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") || "update";
  // const hide_private = (req.params.private !== "null" && req.params.private !== undefined && req.params.private !== "undefined") ? req.params.private === "s" ? true : false : true;
  console.log("page", page, "cate1", category1, "cate2", category2, "key", keyword, "sort", sort);
  const category = category2 ? `AND B.category_level2=${category2}` : category1 ? `AND B.category_level1=${category1}` : ``;
  const search = keyword ? `AND U.nick_name LIKE "%${keyword}%"` : ``;
  const order = sort === "update" ? `ORDER BY B.update_time DESC` : sort === "create" ? `ORDER BY B.create_time DESC ` : sort === "like" ? `ORDER BY L.likes DESC` : ``;
  const basic =
    `SELECT 
  B.uid, B.writer, B.title, B.create_time, B.update_time, B.category_level1, B.category_level2, B.private,
  U.thumbnail, D.status, L.likes, V.views
  FROM opendesign.request B
  LEFT JOIN opendesign.user U ON U.uid = B.writer
  LEFT JOIN opendesign.deal D ON D.board_id = B.uid
  LEFT JOIN (SELECT COUNT(*) AS 'likes', board_id FROM opendesign.request_like L GROUP BY L.board_id) L ON L.board_id = B.uid
  LEFT JOIN (SELECT views, board_id FROM opendesign.request_view) V ON V.board_id = B.uid
  WHERE B.type LIKE "designer"`;
  const sql = `${basic} ${category} ${search} ${order} LIMIT ${page * 10}, 10;`;

  // console.log(sql);
  req.sql = sql;
  next();
};

exports.getDesignerBoardTotalCount = (req, res, next) => {
  const category1 = req.params.cate1 && req.params.cate1 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate1 : null;
  const category2 = req.params.cate2 && req.params.cate2 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate2 : null;
  let sql;

  if (!category1 && !category2) { // 카테고리 파라미터가 없는 경우
    sql = "SELECT COUNT(*) FROM opendesign.request B ";
  } else if (category2) { // 카테고리 2가 설정된 경우 먼저 빼감
    sql = "SELECT COUNT(*) FROM opendesign.request B WHERE category_level2 = " + category2;
  } else if (category1) { // 카테고리 1이 설정된 경우
    sql = "SELECT COUNT(*) FROM opendesign.request B WHERE category_level1 = " + category1;
  }

  const getCount = () => {
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row.length ? row[0]["COUNT(*)"] : null);
        } else {
          reject(err);
        }
      });
    });
  };

  getCount()
    .then(num => res.status(200).json(num))
    .catch(err => res.status(500).json(err));
};
