var express = require('express');
var router = express.Router();
var fs = require('fs');
var configpath = "D:/config.json"
/* GET home page. */
router.get('/', function(req, res, next) {
  var configobj = JSON.parse(fs.readFileSync(configpath));
  console.log("config json: "+JSON.stringify(configobj,null,4));
  configobj['accessories'] = configobj['accessories']||[];
  res.render('index', { title: '............',configobj: configobj });
});

module.exports = router;