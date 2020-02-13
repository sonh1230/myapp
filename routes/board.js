var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'thsfpdhslr2',
    database: 'testboard'
});
db.connect();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.redirect('/board/1');
});


router.get('/create', function(req, res, next) {
  var title = 'HondGod - 자유게시판'; 
  res.render('boardcreate', { title });
});

router.post('/create', function(req, res, next) {
  var post = req.body;
  var title = post.title;
  var description = post.description; 
  db.query(`INSERT INTO article (title, description) VALUES(?, ?)`, [title, description], function(error, insertedrow){
    if(error){
        throw error;
    }
    res.redirect(`/board/read/${insertedrow.insertId}`);
  })
});

router.get('/update/:boardId', function(req, res){
  db.query(`SELECT * FROM article WHERE id=?`, [req.params.boardId], function(error, article){
    if(error){
        throw error;
    }
    var title = 'HondGod - 자유게시판';  
    res.render('boardupdate', { title, article });
  })
});

router.post('/update_process', function(req, res){
  var post = req.body;
  db.query(`UPDATE article SET title=?, description=? WHERE id=?`, [post.title, post.description, post.id], function(error, insertedrow){
    if(error){
        throw error;
    }
    res.redirect(`/board/read/${post.id}`);
  })       
});

router.post('/delete_process', function(req, res){
  var post = req.body;
  db.query(`DELETE FROM article WHERE id=?`, [post.id], function(error, result){
    if(error){
        throw error;
    }
    res.redirect(`/board`);
  })
});

router.post('/read/:boardId/recommend', function(req, res){
  var post = req.body;
  db.query(`INSERT INTO ip (ip) VALUES(?)`, [post.ip], function(error1, insertedrow){
    if(error1){
      res.send(
        `<p>이미 추천하셨습니다.</p><a href="/board/read/${req.params.boardId}">돌아가기</a>`
      );
    } else {
      db.query(`UPDATE article SET recommend=recommend+1 WHERE id=?`, [req.params.boardId], function(error2, result){
        res.redirect(`/board/read/${req.params.boardId}`);
      })
    }    
  })       
});

router.get('/read/:boardId', function(req, res, next) {
  db.query(`UPDATE article SET readnum=readnum+1 WHERE id=?`, [req.params.boardId], function(error1, insertedrow){
    db.query(`SELECT * FROM article WHERE id=?`, [req.params.boardId], function(error2, article){
      if(error2){
          throw error2;
      }
      var title = 'HondGod - 자유게시판';
      var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      res.render('boarddetail', { title, article, ip});
    })
  })
});

router.get('/:page', function(req, res, next) {
  db.query(`SELECT id, title, description, date_format(time,'%m-%d')time, readnum, recommend FROM article ORDER BY id DESC`, function(error, articles){
    if(error){
        throw error;
    }
    var title = 'HondGod - 자유게시판';
    var page_now = req.params.page;                                                                           //현재 페이지
    var article_total = articles.length;                                                                      //총 게시물 수
    var article_Onepage = 10;                                                                                 //한 페이지에 나타낼 게시물 수
    var page_button_Onepage = 10;                                                                             //한 페이지에 나타낼 페이지 버튼 수
    var page_total = Math.ceil(article_total / article_Onepage);                                              //총 페이지 수
    var page_group_toal = Math.ceil(page_total / page_button_Onepage);                                        //총 페이지 버튼그룹 수
    var page_group_now = Math.ceil(page_now / page_button_Onepage);                                           //현재 페이지에 해당하는 페이지 버튼그룹
    var page_button_first = (page_group_now-1) * (page_button_Onepage) + 1;                                   //현재 페이지에 해당하는 첫번째 페이지버튼
    var page_button_last = (page_group_now * page_button_Onepage);                                            //현재 페이지에 해당하는 마지막 페이지버튼
    var article_first = (page_now * article_Onepage) - article_Onepage;                                       //현재 페이지에 나타낼 첫번째 DB 배열 위치
    res.render('board', { title, article_first, article_Onepage, article_total, articles, page_group_now, page_button_first, page_button_Onepage, page_button_last, page_total, page_group_toal});
  })
});

module.exports = router;


