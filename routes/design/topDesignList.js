const connection = require("../../configs/connection");

exports.topDesignList = (req, res, next) => {
  const page = req.params.page;
  let sort = "update";
  const keyword = req.params.keyword;

  let sql = `
  SELECT T.uid, T.title, T.thumbnail, T.create_time, T.child_update_time, T.user_id, T.explanation, T.like, T.design, T.group, T.nick_name, T.order FROM (
    SELECT G.uid,G.title,G.thumbnail,G.create_time,G.child_update_time ,G.user_id,G.explanation,C.like,C.design,C.group,U.nick_name,CG.order
      FROM opendesign.group G
        LEFT JOIN opendesign.group_counter C ON C.group_id = G.uid
        LEFT JOIN opendesign.user U ON U.uid = G.user_id
        LEFT JOIN opendesign.collection_group CG ON CG.group_id = G.uid
      WHERE G.uid IN (SELECT CG.group_id FROM opendesign.collection_group CG)
  UNION 
    SELECT G.uid,G.title,G.thumbnail,G.create_time,G.child_update_time,G.user_id,G.explanation,C.like,C.design,C.group,U.nick_name,CG.order
         FROM opendesign.group G
        LEFT JOIN opendesign.group_counter C ON C.group_id = G.uid
        LEFT JOIN opendesign.user U ON U.uid = G.user_id
        LEFT JOIN opendesign.collection_group CG ON CG.group_id = G.uid
      WHERE G.uid NOT IN (SELECT CG.group_id FROM opendesign.collection_group CG)        
  ) as T `;
  // search
  if (keyword && keyword !== "null" && keyword !== "undefined")
    sql = sql + `WHERE T.title LIKE ` + keyword + `OR T.nick_name LIKE ` + keyword + ` `;
  // 1st sort(NEEDED)
  sql = sql + `ORDER BY T.order IS NULL ASC, T.order ASC`;
  // 2st sort(OPTIONAL)
  // default : update
  //console.log("sorting", req.params.sorting);
  if (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined")
    sort = req.params.sorting;
  sort === "update" ? sort = "child_update_time" : null;
  sort === "create" ? sort = "create_time" : null;
  //console.log("option:",sort);
  sql = sql + `, T.` + sort + ` DESC `
  // for infinite scroll
  sql = sql + `LIMIT ` + (page * 0) + `, 4;`;
  // console.log(sql);
  req.sql = sql;
  next();
};

exports.getTopDesignTotalCount = (req, res, next) => {
  const getCount = () => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT count(*) FROM opendesign.collection_design", (err, result) => {
        if (!err && result.length) {
          //console.log(result);
          resolve(result[0]);
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

exports.insertTopDesign = (req, res, next) => {
  const id = req.params.id;
  const order = req.body.order;
  const insertTopDesign = () => {
    return new Promise((resolve, reject) => {
      connection.query(`INSERT INTO market.top_item VALUES(null,${id},${order},null)`, (err, result) => {
        if (!err) {
          resolve(result);
        } else {
          console.log(err);
          reject(result);
        }
      });
    });
  };

  const success = () => {
    res.status(200).json({
      success: true
    });
  };

  const fail = () => {
    res.status(500).json({
      success: false
    });
  };

  insertTopDesign()
    .then(success)
    .catch(fail);
};

exports.updateTopDesign = (req, res, next) => {
  const id = req.params.id;
  const order = req.body.order;
  const updateTopDesign = () => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE market.top_item as T SET T.order=${order} WHERE item_id = ${id}`, (err, result) => {
        if (!err) {
          resolve(result);
        } else {
          console.log(err);
          reject(result);
        }
      });
    });
  };

  const success = () => {
    res.status(200).json({
      success: true
    });
  };

  const fail = () => {
    res.status(500).json({
      success: false
    });
  };

  updateTopDesign()
    .then(success)
    .catch(fail);
};

exports.deleteTopDesign = (req, res, next) => {
  const id = req.params.id;
  const deleteTopDesign = () => {
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM market.top_item WHERE item_id = ${id}`, (err, result) => {
        if (!err) {
          resolve(result);
        } else {
          console.log(err);
          reject(result);
        }
      });
    });
  };

  const success = () => {
    res.status(200).json({
      success: true
    });
  };

  const fail = () => {
    res.status(500).json({
      success: false
    });
  };

  deleteTopDesign()
    .then(success)
    .catch(fail);
};


