

var express = require('express');
var fs = require('fs');
var router = express.Router();
var configpath = "/root/.homebridge/config.json";
var process = require('child_process');
/* GET users listing. */
router.post('/', function(req, res, next) {
    var configobj = JSON.parse(fs.readFileSync(configpath));
   // console.log("configobj read from config.json : "+JSON.stringify(configobj,null,4));
   // console.log("req.body is : "+JSON.stringify(req.body,null,4));
    configobj['platforms'] = configobj['platforms']||[];
    for(var i =0; i< configobj['platforms'].length;i++)
    {
        if(configobj['platforms'][i]['platform']=="MiAqaraPlatform")
        {
            // console.log(req.body.gateways);
            // console.log("type of gateways : "+typeof(req.body.gateways));
            var gateway_array = req.body.gateways.split(',');
            var len = gateway_array.length;
            if(gateway_array[len-1].replace(/\r\n/ig,'').replace(/\t/ig,'').replace(/\s/g,"") == '')
            {
                len = len -1;
            }
            var tempstr='';
            for(var j =0; j< len;j++)
            {
                var key = gateway_array[j].split(':')[0].replace(/\r\n/ig,'').replace(/\t/ig,'').replace(/\s/g,"");
                var val = gateway_array[j].split(':')[1].replace(/\r\n/ig,'').replace(/\t/ig,'').replace(/\s/g,"");
                console.log("key = "+ key+"#");
                console.log("val = "+ val+"#");
                if(j == (len-1))
                {
                    tempstr=tempstr + '\"'+key + '\":\"' + val +'\"';
                }
                else
                {
                    tempstr=tempstr + '\"'+key + '\":\"' + val +'\",';
                }
                
            }
            var tempstr = '{' +tempstr+'}';
            console.log("tempstr : "+tempstr);
            configobj['platforms'][i]['gateways']=JSON.parse(tempstr);
            console.log(configobj['platforms'][i]['gateways']);
        }
    }
    console.log(JSON.stringify(req.body));
    
   // console.log("Will Write Contents as below to config.json .....................................");
   // console.log(JSON.stringify(configobj,null,4));
    fs.writeFileSync(configpath,JSON.stringify(configobj,null,4));
    // process.exec('reboot -f',function(err, stdout, stderr){
    //     console.log(stdout);
    //   });
    res.redirect('/');
});

//添加这个代码是为了解决 向 /save  url post 过后经过 save.js 的router.post('/',function(req,res,next){... res.redirect('/'); })处理过后 浏览器地址栏并没有显示为
// http://localhost:3000 的样子,而是显示为了http://localhost:3000/save 的样子,因此 如果服务器重启后浏览器重新刷新则默认是 get http://localhost:3000/save, 而如果没有
//如下的get处理 会导致浏览器找不到对应的资源,因此这里重新将http://localhost:3000/save 重定向到http://localhost:3000
router.get('/', function(req, res, next) {
    res.redirect('/');
});


module.exports = router;