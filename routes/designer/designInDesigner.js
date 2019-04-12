// 디자이너의 디자인 리스트 가져오기
exports.myDesignInDesigner = (req, res, next) => {
  const id = req.params.id;
  const page = req.params.page;
  let sql = "SELECT D.uid, D.user_id, D.title, D.thumbnail, D.parent_design, D.category_level1, D.category_level2, D.create_time, C.like_count, C.member_count, C.card_count, C.view_count FROM design D LEFT JOIN design_counter C ON C.design_id = D.uid WHERE D.user_id = " + id + " LIMIT " + (page * 10) + ", 10";
  req.sql = sql;
  next();
};

// 디자이너의 참여 디자인 리스트 가져오기
exports.designInDesigner = (req, res, next) => {
  const id = req.params.id;
  const page = req.params.page;
  let sql = "SELECT D.uid, D.user_id, D.title, D.thumbnail, D.parent_design, D.category_level1, D.category_level2, D.create_time, C.like_count, C.member_count, C.card_count, C.view_count FROM design_member M JOIN design D ON D.uid = M.design_id LEFT JOIN design_counter C ON C.design_id = D.uid WHERE M.is_join = 1 AND M.user_id = " + id + " LIMIT " + (page * 10) + ", 10";
  req.sql = sql;
  next();
};

// 디자이너가 좋아요 한 디자인 리스트 가져오기
exports.likeInDesigner = (req, res, next) => {
  const id = req.params.id;
  const page = req.params.page;
  let sql = "SELECT D.uid, D.user_id, D.title, D.thumbnail, D.category_level1, D.category_level2, D.create_time, C.like_count, C.member_count, C.card_count, C.view_count FROM design_like L JOIN design D ON D.uid = L.design_id LEFT JOIN design_counter C ON C.design_id = D.uid WHERE L.user_id = " + id + " LIMIT " + (page * 10) + ", 10";
  req.sql = sql;
  next();
};
