

var express = require('express');
var fs = require('fs');
var os = require("os");
var router = express.Router();
var process = require('child_process');
var configpath = "/root/.homebridge/config.json"
/* GET users listing. */
router.post('/', function(req, res, next) {
    var result = {};
    result.status = 'ok';
    try {
    //这边要在实际删除文件夹成功后再发送成功
    var networkinfo = os.networkInterfaces();
    if(typeof (networkinfo['eth0.1']) != 'undefined')
    {
        for(var i = 0; i < networkinfo['eth0.1'].length;i++)
        {
            if(typeof(networkinfo['eth0.1'][i]['mac']) != 'undefined')
            {
                var username = networkinfo['eth0.1'][i]['mac'].toUpperCase()
                var configobj = JSON.parse(fs.readFileSync(configpath));
                configobj['bridge']['username'] = username;
                configobj['bridge']['name'] = 'LinkMe'+username;
                fs.writeFileSync(configpath,JSON.stringify(configobj,null,4));
                console.log(JSON.stringify(configobj,null,4));
                break;
            }
        }
    }

    process.exec('rm -rf /root/.homebridge/persist /root/.homebridge/accessories ',function(error, stdout, stderr){
            if (error) {
                // console.error(`exec error: ${error}`);
                result.status = 'errapplyconfig';
                res.end(JSON.stringify(result));
                return;
            }
            else
            {
                console.log("ApplyConfig->->->->->->->->->->->->->->->->->->->->->->->->->->->->->->->");
                result.status = 'ok';
                res.end(JSON.stringify(result));
                // console.log(`stdout: ${stdout}`);
                // console.log(`stderr: ${stderr}`);
		        process.exec('reboot -f',function(error, stdout, stderr){
                if (error) {
                // console.error(`exec error: ${error}`);
                }
                else
                {

                // console.log(`stdout: ${stdout}`);
                // console.log(`stderr: ${stderr}`);
                }
                });
            }
            
      });
    }
    catch (err) {
        console.log("Error: " + err);
        result.status = 'errapplyconfig';
        res.end(JSON.stringify(result));
        return;
    }
});

//添加这个代码是为了解决 向 /save  url post 过后经过 save.js 的router.post('/',function(req,res,next){... res.redirect('/'); })处理过后 浏览器地址栏并没有显示为
// http://localhost:3000 的样子,而是显示为了http://localhost:3000/save 的样子,因此 如果服务器重启后浏览器重新刷新则默认是 get http://localhost:3000/save, 而如果没有
//如下的get处理 会导致浏览器找不到对应的资源,因此这里重新将http://localhost:3000/save 重定向到http://localhost:3000
router.get('/', function(req, res, next) {
    res.redirect('/');
});


module.exports = router;