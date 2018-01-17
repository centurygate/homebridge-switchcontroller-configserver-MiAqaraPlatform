

var express = require('express');
var fs = require('fs');
var router = express.Router();
var upgraderequest = require('./upgraderequest.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
    var result = {};
    result.status = 'ok';
    upgraderequest.upgrade('V0.9',res);
});

//添加这个代码是为了解决 向 /save  url post 过后经过 save.js 的router.post('/',function(req,res,next){... res.redirect('/'); })处理过后 浏览器地址栏并没有显示为
// http://localhost:3000 的样子,而是显示为了http://localhost:3000/save 的样子,因此 如果服务器重启后浏览器重新刷新则默认是 get http://localhost:3000/save, 而如果没有
//如下的get处理 会导致浏览器找不到对应的资源,因此这里重新将http://localhost:3000/save 重定向到http://localhost:3000
router.get('/', function(req, res, next) {
    res.redirect('/');
});


module.exports = router;