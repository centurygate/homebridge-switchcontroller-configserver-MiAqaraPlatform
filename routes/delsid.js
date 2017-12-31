

var express = require('express');
var fs = require('fs');
var router = express.Router();
var configpath = "D:/config.json";
var process = require('child_process');
/* GET users listing. */
router.post('/', function(req, res, next) {
    var result = {};
    result.status = 'ok';
    var configobj = JSON.parse(fs.readFileSync(configpath));
    var ssidobj = req.body;
    var isexist = false;
    //ssidobj 实际上只有一个key,但这里为了取得对象中的key 必须用 for .. in结构
    for(var ssid in ssidobj)
    {
        console.log("ssid :" + ssid+ ", passwd :  "+ssidobj[ssid]);
       break;
    }
   // console.log("configobj read from config.json : "+JSON.stringify(configobj,null,4));
    console.log("req.body is : "+JSON.stringify(req.body,null,4));
    configobj['platforms'] = configobj['platforms']||[];
    for(var i =0; i< configobj['platforms'].length;i++)
    {
        if(configobj['platforms'][i]['platform']=="MiAqaraPlatform")
        {
           for(var gateway_key in configobj['platforms'][i]['gateways'])
           {
                //判断ssid是否已经存在,已经存在则不作修改
                if (ssidobj[ssid] == gateway_key) 
                {
                    isexist =true;
                    break;
                }
           }
        }
        if (!isexist) 
        {
            console.log("ssid is not exist............");
            result.status = 'errnotexist';
            res.end(JSON.stringify(result));
            break;
        }
        else
        {
            result.status =  'ok';
            console.log("delete ssid      ............");
            delete configobj['platforms'][i]['gateways'][ssidobj[ssid]];
            console.log("configobj : " + JSON.stringify(configobj,null,4));
            fs.writeFileSync(configpath,JSON.stringify(configobj,null,4));
            res.end(JSON.stringify(result));
            break;
        }
    }
});

//添加这个代码是为了解决 向 /save  url post 过后经过 save.js 的router.post('/',function(req,res,next){... res.redirect('/'); })处理过后 浏览器地址栏并没有显示为
// http://localhost:3000 的样子,而是显示为了http://localhost:3000/save 的样子,因此 如果服务器重启后浏览器重新刷新则默认是 get http://localhost:3000/save, 而如果没有
//如下的get处理 会导致浏览器找不到对应的资源,因此这里重新将http://localhost:3000/save 重定向到http://localhost:3000
router.get('/', function(req, res, next) {
    res.redirect('/');
});


module.exports = router;