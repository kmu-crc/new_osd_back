const connection = require("../../configs/connection");
// const insertThumbnail = require("../../middlewares/insertThumbnail");
const { createThumbnails } = require("../../middlewares/createThumbnails");
const { createImages } = require("../../middlewares/createImages");
const { createListHeader, createListDB } = require("./itemList");
const { createCardDB, createContents } = require("./itemCard");
const fs = require("fs");

const getTemplateStep = (type) => {
	const T = {
	"fashion":[{ order: 0, title: "Ideation" }, { order: 1, title: "Purpose" }, { order: 2, title: "Design" }, { order: 3, title: "Mock-up" }, { order: 4, title: "Establish" },],
	"software":[{ order: 0, title: "기획" }, { order: 1, title: "요구사항 분석" }, { order: 2, title: "소프트웨어 설계" }, { order: 3, title: "시스템 구현" }, { order: 4, title: "시스템 테스트 및 평가" },],
	"engineering":[{ order: 0, title: "기획" }, { order: 1, title: "시스템 분석" }, { order: 2, title: "시스템 설계" }, { order: 3, title: "시스템 구현" }, { order: 4, title: "시스템 테스트 및 평가" },],
	};
	return T[type];
};
const LECTURE_ITEM = 8;

exports.deleteItem = async (req, res, next) => {
  const itemId = req.params.id;
  const deleteItemDB = () => {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE market.item SET visible=0 WHERE uid = ${itemId}`;
      connection.query(sql, (err, rows) => {
        if (!err && rows) {
          resolve(true);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
  };

  const respond = () => {
    res.status(200).json({ success: true, message: "성공적으로 삭제되었습니다." });
  };
  const error = err => {
    res.status(500).json({ success: false, message: err });
  };

  deleteItemDB()
    .then(respond)
    .catch(error);
};

exports.updateItem = async (req, res, next) => {

  const itemId = req.params.id;
  console.log(req.body);

  const basic = {
    title: req.body.title,
    tag: (typeof req.body.tag === "string") ? req.body.tag : req.body.tag.join(",") || "",
    category_level1: req.body.category1,
    category_level2: req.body.category2,
    category_level3: req.body.category3,
    private: req.body.additional.public === "아니오" ? 1 : 0,
	is_problem: req.body.is_problem,
  };
  const additional = {
    price: req.body.additional.price,
    description: req.body.additional.description,
    public: req.body.additional.public,
    "contact-type": req.body.additional["contact-type"],
    "selling-type": req.body.additional["selling-type"]
    // type is fixed !
  }
  const members = req.body.additional.members || null;

  const updateItemDB = data => {
    console.log("UpdateItemDB", data);
    return new Promise((resolve, reject) => {
      const sql = `UPDATE market.item SET ? WHERE uid=${itemId}`
      connection.query(sql, data, (err, rows) => {
        if (!err && rows) {
          resolve(true);
        } else {
          reject(err);
        }
      });
    });
  };
  const updateItemDetailDB = data => {
    console.log("UpdateItemDetailDB", data);
    return new Promise((resolve, reject) => {
      const sql = `UPDATE market.item_detail SET ? WHERE item_id=${itemId}`
      connection.query(sql, data, (err, rows) => {
        if (!err && rows) {
          resolve(true);
        } else {
          reject(err);
        }
      });
    });
  };
  const updateMemberDB = newMems => {
    const getCurrentMembers = () => {
      return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM market.member WHERE item_id = ${itemId} AND leader NOT LIKE 1`
        connection.query(sql, (err, row) => {
          if (!err) {
            // console.log("CURRENT:", row);
            resolve(row);
          } else {
            reject(err);
          }
        })
      });
    };
    const getoutMember = id => {
      return new Promise((resolve, reject) => {
        const sql = `DELETE FROM market.member WHERE user_id=${id} AND item_id=${itemId}`
        connection.query(sql, (err, row) => {
          if (!err) {
            resolve(true);
          } else {
            reject(err);
          }
        })
      });
    };
    const inviteMember = id => {
      return new Promise((resolve, reject) => {
        const obj = { item_id: itemId, user_id: id, is_join: 0, invited: 1, leader: 0 };
        const sql = `INSERT INTO market.member SET ?`;
        connection.query(sql, obj, (err, row) => {
          if (!err) {
            resolve(true);
          } else {
            reject(err);
          }
        })
      })
    }
    return new Promise((resolve, reject) => {
      if (newMems == null) resolve(true);
      getCurrentMembers()
        .then(async oldMems => {
          // getout
          oldMems.map(async old => {
            if (newMems.find(mem => mem.uid === old.user_id) == null) {
              // console.log("out:", old, old.user_id);
              await getoutMember(old.user_id);
            }
          })
          // invite
          newMems.map(async mem => {
            if (oldMems.find(old => old.user_id === mem.uid) == null) {
              // console.log("in:", mem, mem.uid);
              await inviteMember(mem.uid);
            }
          })
        })
        .then(resolve(true))
        .catch(err => reject(err));
    });
  };
  const respond = () => {
    res.status(200).json({ success: true, message: "성공적으로 등록되었습니다." });
  };
  const error = err => {
    res.status(500).json({ success: false, message: err });
  };


  updateItemDB(basic)
    .then(updateItemDetailDB(additional))
    .then(updateMemberDB(members))
    .then(respond)
    .catch(error);
};

/* { 
  title: 'xcvb', tag: [], category1: -1, category2: -1, category3: -1, is_problem: 0, 
  itemType: 8, type: 'project', private: 0,
   additional:
    { description: null, price: 4000000, max_students: 1, recruit_unlimited: false, recruit_always: false,
      start_date: '2021-04-12', end_date: '2021-04-15', day_date: 4 },
   content: [],
   step:
    [ { order: 0, title: 'Ideation' }, { order: 1, title: 'Purpose' }, { order: 2, title: 'Design' }, { order: 3, title: 'Mock-up' }, { order: 4, title: 'Establish' } ],
   step2:
    [ { order: 0, title: '기획' }, { order: 1, title: '요구사항 분석' }, { order: 2, title: '소프트웨어 설계' }, { order: 3, title: '시스템 구현' }, { order: 4, title: '시스템 테스트 및 평가' } ],
   } */
exports.createItem = async (req, res, next) => {
  const userId = req.decoded.uid;

  const basic = {
    user_id: userId,
    upload_type: req.body.type,
    title: req.body.title,
    tag: req.body.tag ? req.body.tag.join(',') : "",
    category_level1: req.body.category1,
    category_level2: req.body.category2,
    category_level3: req.body.category3,
    is_problem: req.body.is_problem === 1 || req.body.is_problem === "1" ? 1 : 0,
    private: req.body.additional.public === "아니오" ? 1 : 0,
  };
  const additional = {
    ...req.body.additional,
    type: req.body.itemType
  };
  const file = {
    ...req.file,
    type: "item"
  };
  const members = req.body.additional.members ? [...req.body.additional.members] : null;
  const { content } = req.body;
  const { step } = req.body;
  const { step2 } = req.body;

  // ITEM DB
  const insertItemDetailDB = data => {
    console.log("insertItemDetailDB", data);
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO market.item_detail (item_id, \`type\`, \`description\`, \`price\`, \`public\`, \`contact-type\`, \`selling-type\`, \`list-id\`, \`max_students\`, \`recruit_unlimited\`, \`start_date\`, \`end_date\`) VALUES( ${data.itemId}, ${data.type}, "${data.description}", ${parseInt(data.price, 10)}, ${data.public ? data.public === '예' ? '\'yes\'' : '\'no\'' : null}, ${data.contactType ? data.contactType === '온라인' ? '\'on\'' : '\'off\'' : null}, ${data.sellingType ? data.sellingType === '양도' ? '\'assginment\'' : data.sellingType === '독점 사용권' ? '\'monopoly\'' : '\'normal\'' : null}, ${data.listId || null} , ${data.max_students || 0}, ${data.recruit_unlimited}, ${data.start_date}, ${data.end_date})`;
      connection.query(sql, (err, rows) => {
        if (!err) {
          resolve(data.itemId);
        } else {
          console.error("err", err);
          reject(err);
        }
      })
    })
  };
  const insertItemDB = data => {
    console.log("insertItemDB", data);
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO market.item SET ?", data, (err, rows) => {
        if (!err) {
          // console.log(rows.insertId);
          resolve(rows.insertId);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
  };

  // CONTENTS
  const WriteFile = (file, filename) => {
    let originname = filename.split(".");
    let name = new Date().valueOf() + "." + originname[originname.length - 1];
    return new Promise((resolve, reject) => {
      fs.writeFile(`uploads/${name}`, file, { encoding: "base64" }, err => {
        if (err) {
          reject(err);
        } else {
          resolve(`uploads/${name}`);
        }
      });
    });
  };
  const insertImageList = (id, imglist) => {
    return new Promise((resolve, reject) => {
      Promise.all(
        imglist.map(img => {
          new Promise(async (resolve, reject) => {
            if (img) {
              let fileStream = img.value.split("base64,")[1];
              let data = await WriteFile(fileStream, img.name);
              await createImages({ type: "item-image", image: data, filename: data.split("/")[1], uid: id })
                .then(resolve())
                .catch(err => reject(err));
            }
            resolve();
          })
        })
      )
        .then(resolve(id))
        .catch(err => reject(err))
    })
  }
  const insertSteps = (id, steps, type) => {
    return new Promise((resolve, reject) => {
      if (steps.length === 0) resolve(id);

      Promise.all(
        steps.map(step => {
          new Promise(async (resolve, reject) => {
            if (step) {
              const obj = {
                type: type, user_id: userId, content_id: id, title: step.title, order: step.uid
              }
              await createListDB(obj)
                .then(listId => {
                  step.cards.map(async (card, index) => {
                    await createCardDB({
                      user_id: userId, list_id: listId, order: index,
                      title: card.title, description: card.content,
                    })
                      .then(cardId => createContents(userId, cardId, card.contents))
                  });
                })
                .then(resolve())
                .catch(err => reject(err));
            }
            resolve();
          });
        })
      )
        .then(resolve(id))
        .catch(err => reject(err));
    });
  }
  const insertSteps2 = (header, id, steps) => {
    return new Promise((resolve, reject) => {
      if (steps.length === 0) resolve(id);

      Promise.all(
        steps.map(step => {
          new Promise(async (resolve, reject) => {
            if (step) {
              const obj = { list_header_id: header, user_id: userId, content_id: id, title: step.title, order: step.uid };

	      await createListDB(obj).then(listId => {
                  step.cards.map(async (card, index) => {
                    await createCardDB({
                      user_id: userId, list_id: listId, order: index,
                      title: card.title, description: card.content,
                    })
                      .then(cardId => createContents(userId, cardId, card.contents))
                  });
                })
                .then(resolve())
                .catch(err => reject(err));
            }
            resolve();
          });
        })
      )
        .then(resolve(id))
        .catch(err => reject(err));
    });
  }

  const insertContent2 = (header, id, content) => {
    console.log("insertContent2", header, id, content);
    return new Promise(async (resolve, reject) => {
      if (content.length === 0) resolve(id);
      await createListDB({ list_header_id: header, user_id: userId, content_id: id, order: 0 })
        .then(listId => createCardDB({ user_id: userId, list_id: listId, order: 0 }))
        .then(cardId => createContents(userId, cardId, content))
        .then(resolve(id))
        .catch(err => reject(err));
    });
  }
  const insertContent = (id, content) => {
    console.log("insertContent", id, content);
    return new Promise(async (resolve, reject) => {
      if (content.length === 0) resolve(id);
      await createListDB({ type: "item", user_id: userId, content_id: id, order: 0 })
        .then(listId => createCardDB({ user_id: userId, list_id: listId, order: 0 }))
        .then(cardId => createContents(userId, cardId, content))
        .then(resolve(id))
        .catch(err => reject(err));
    });
  }
  // MEMBERS
  const insertLeader = (id) => {
    console.log("insertLeader", id);
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO market.member SET ?`;
      const obj = { item_id: id, user_id: userId, is_join: 1, invited: 0, leader: 1 }
      connection.query(sql, obj, (err, row) => {
        if (!err && row) {
          resolve(id);
        } else {
          reject(false);
        }
      });
    });
  };
  const insertMemberDB = (itemId, id) => {
    return new Promise((resolve, reject) => {
      if (id === userId) resolve(true);
      const sql = `INSERT INTO market.member SET ?`;
      const obj = { item_id: itemId, user_id: id, is_join: 0, invited: 1, leader: 0 }
      connection.query(sql, obj, (err, row) => {
        if (!err) {
          resolve(true);
        }
        else {
          reject(false);
        }
      });
    })
  };
  const insertMemberList = (itemId, mems) => {
    console.log("insertMemberList", itemId, mems);
    return new Promise((resolve, reject) => {
      if (!mems || mems.length === 0) resolve(itemId);
      Promise.all(
        mems.map(async mem =>
          await insertMemberDB(itemId, mem.uid))
      ).then(resolve(itemId)).catch(err => reject(err));
    });
  };
  // delete req.body.additional.members;

  const respond = id => {
    console.log("respond", id);
    res.status(200).json({ success: true, id: id, message: "성공적으로 등록되었습니다." });
  };
  const error = err => {
    console.log("error", err);
    res.status(500).json({ success: false, id: null, message: err });
  };
  console.log("basic:", basic);
  // THUMBNAIL
  createThumbnails(file)
    // item
    .then(thumbnail => insertItemDB({ ...basic, thumbnail_id: thumbnail }))
    // item_detail
    .then(id => insertItemDetailDB({ ...additional, itemId: id }))
    // item_detail-image-list
    // .then(id =>
    // (additional.type === 7)
    // ? insertImageList(id, additional.imageList)
    // : id)

    // steps or content
    // first step add
    // second step add 
    .then(id => {

	//	
	if(req.body.itemType === LECTURE_ITEM){
		const { headers } = req.body;
		headers && headers.length > 0 && 
		headers.map((head, index) => {
			const steps = getTemplateStep(head.template);
			createListHeader({ 
				type: head.is_practice ? "practice" : "item", 
				name: head.name,
				content_id: id, 
				editor_type: basic.upload_type
			}).then(head => insertSteps2(head, id, steps))
		});
	}
	//
	else {
		if(basic.upload_type === "blog") {
		console.log("content added");
		createListHeader({ type:"item", content_id: id, editor_type: basic.upload_type })
		.then(header => insertContent2(header, id, content))
		}

		if(step && step.length > 0) { 
		console.log("step added");
		createListHeader({ type:"item", name: req.body.listname1, content_id: id, editor_type: "project" })
		.then(header => insertSteps2(header, id, step))
		}

		if(step2 && step2.length > 0) { 
		console.log("step2 added");
		createListHeader({ type:"practice", name: req.body.listname2, content_id: id, editor_type: "project" })
		.then(header => insertSteps2(header, id, step2))
		}
	}

	return id;
	})
    // leader
    .then(id => insertLeader(id))
    // members
    .then(id => insertMemberList(id, members))
    // finish
    .then(respond)
    .catch(error);
};

// // 2. 생성된 디자인에 썸네일 업데이트
// const updateDesignFn = (req) => {
//   //console.log("2번", req.designId);
//   return new Promise((resolve, reject) => {
//     connection.query(`UPDATE design SET ? WHERE uid=${req.designId} AND userId=${req.userId}`, req.data, (err, rows) => {
//       if (!err) {
//         if (rows.affectedRows) {
//           resolve(rows);
//         } else {
//           console.log("2번", err);
//           throw err;
//         }
//       } else {
//         throw err;
//       }
//     });
//   });
// };
// exports.updateDesign = (req, res, next) => {
//   //console.log("updateDesign");
// };