var express = require('express');
var router = express.Router();
// var get_ip = require('ipware')().get_ip;

/* GET home page. */
router.get('/', function(req, res, next) {
  // var ip_info = get_ip(req);
  // console.log(ip_info);
  res.render('index', { title: 'HongGod' });
});

module.exports = router;
