
var http = require('http');
var fs = require('fs');
var utils = require('./cypher.js');
var crypto = require('crypto');
var net = require('net');
var socketport = 7003;
var sockethost = '127.0.0.1';
var process = require('child_process');
var checkSum = '';
var encodeUtil = new utils.EncodeUtil();

var client= new net.Socket();
// client.setEncoding('binary');
//连接到服务端


function upgrade(curVersion, configres) {
    var result = {};
    result.status = 'ok';
    //var host = '192.168.1.152';
    var host = 'www.econsmart.com.cn';
    var curVersion = curVersion||'V1.0';

    const versionreq = http.request({
        hostname: host,
        port: 3000,
        path: '/mi/pkginfo/',
        method: 'GET',
    }, function (versionres) {
        var datarecv = '';
        versionres.on('data', function (chunk) {
            datarecv += chunk;
        });

        //1.第一步获取服务器上升级包的版本号,对比是不是和现在的不一样,若不一样则升级,也可以判断主版本号和副版本号的大小来判断是否要升级
        versionres.on('end', function () {
            console.log('Recv: ' + datarecv);
            var pkginfoobj = JSON.parse(datarecv);
            //console.log(JSON.parse(datarecv).version);
            //-----------------------------------------
            if (pkginfoobj.status == 'ok') {
                if(pkginfoobj.fileSize == 0)
                {
                    //返回网关配置页面错误信息
                    console.error("___________________Package Size is 0_____________________ ");
                    result.status = 'err';
                    result.reason = '服务器维护中(Package Size is 0)';
                    configres.end(JSON.stringify(result));
                }
                if(pkginfoobj.checkSum == '')
                {
                    //返回网关配置页面错误信息
                    console.error("___________________Package checkSum is null_____________________ ");
                    result.status = 'err';
                    result.reason = '服务器维护中(Package checkSum is null)';
                    configres.end(JSON.stringify(result));
                }
                if(pkginfoobj.version != curVersion)
                {
                    //存储 Md5Sum
                    checkSum = pkginfoobj.checkSum;
                    var fileSize = pkginfoobj.fileSize;
                    //========================================================================================
                    var packagePathName = '/mi/upgrade/openwrt-ramips-mt7628-mt7628-squashfs-sysupgrade.dmg';
                    //========================================================================================
                    //3.第三步获取服务器上升级包
                    const packagereq = http.request({
                        hostname: host,
                        port: 3000,
                        path: packagePathName,
                        method: 'GET',
                    }, function (packageres) {
                        // console.log(`STATUS: ${res.statusCode}`);
                        // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
                        var packagedatarecv = [];
                        var size = 0;
                        //   res.setEncoding('utf8');
                        packageres.on('data', function (chunk) {
                            console.log("Downloading : "+(size*100/fileSize).toFixed(1) + '%');
                            packagedatarecv.push(chunk);
                            size += chunk.length;
                        });
                        packageres.on('end', function () {
                            console.log('________________Finished Downloading Upgrade Package_________________________');
                            //------------------------------------------------------------------------------------------
                            //发送停止homebridge,uhttpd,dropbear进程的指令
                            client.connect(socketport,sockethost,function(){

                            });

                            client.on('data',function(data){
                                console.log("___________________________________________");
                                console.log('Recv data:'+ data);
                                console.log("___________________________________________");
                                if(data == 'continue')
                                {
                                    var packagebuf = Buffer.concat(packagedatarecv, size);
                                    var decodeBuffer = encodeUtil.decode(packagebuf);
                                    fs.writeFile("/tmp/upgrade.bin", decodeBuffer, function (err) {
                                        if (err) {
                                            //若写文件失败则返回网关配置界面错误信息
                                            console.log("WriteFile : " + "/tmp/upgrade.bin" + "Failed!");
                                            result.status = 'err';
                                            result.reason = ''+err+'系统将重启恢复原有服务';
                                            configres.end(JSON.stringify(result));
                                            client.write('reboot -f');
                                            return;
                                        }
                                        else {
                                            //4.若md5正确则 用child_process 执行 sysupgrade,并返回服务器一个信息,页面开始出现进度条
                                            var hash = crypto.createHash('md5');
                                            var rs = fs.createReadStream('/tmp/upgrade.bin');
                                            rs.on('data', hash.update.bind(hash));
                                            rs.on('end', function () {
                                                var filemd5sum = hash.digest('hex');
                                                console.log("filemd5sum : "+ filemd5sum);
                                                if(checkSum == filemd5sum)
                                                {
                                                    //5.执行升级操作
                                                    console.log('Being to Upgrade.............................');
                                                    //返回网关配置页面升级信息
                                                    result.status = 'ok';
                                                    result.reason = '升级包校验成功,升级中!';
                                                    configres.end(JSON.stringify(result));
                                                    //发送停止node进程的指令，并启动升级指令
                                                    client.write("killall node;/sbin/sysupgrade -v /tmp/upgrade.bin");
                                                    //休眠10秒钟后继续执行
                                                    // var waitUntil = new Date(new Date().getTime() + 10 * 1000);
                                                    // while(waitUntil > new Date()){}
                                                    return;
                                                    // process.exec('sysupgrade -v /tmp/upgrade.bin',function(error, stdout, stderr){
                                                    //     console.log("升级失败.....................................");
                                                    // });
                                                }
                                                else
                                                {
                                                    console.log('Md5CheckSum does not match ');

                                                    //删除下载好的升级包并返回配置页面错误

                                                    //返回网关配置页面错误信息
                                                    result.status = 'err';
                                                    result.reason = '升级包数据不完整!系统将重启恢复原有服务';
                                                    configres.end(JSON.stringify(result));
                                                    client.write('reboot -f');
                                                    return;

                                                }
                                            });
                                        }
                                    });
                                }


                            });
                            client.on('error',function(error){

                                console.log('error:'+error);
                                client.destory();

                            });
                            client.on('close',function(){

                                console.log('Connection closed');

                            });
                            client.write('kill -9 $(pidof homebridge);kill -9 $(pidof dropbear);kill -9 $(pidof uhttpd)');
                            //休眠10秒钟后等upserver.js中执行了上面的命令过后再写入文件, 可以是系统资源富裕一些
                            // var waitUntil = new Date(new Date().getTime() + 10 * 1000);
                            // while(waitUntil > new Date()){}
                            //-------------------------------------------------------------------------------------------
                            // var packagebuf = Buffer.concat(packagedatarecv, size);
                            // var decodeBuffer = encodeUtil.decode(packagebuf);
                            // fs.writeFile("/tmp/upgrade.bin", decodeBuffer, function (err) {
                            //     if (err) {
                            //         //若写文件失败则返回网关配置界面错误信息
                            //         console.log("WriteFile : " + "/tmp/upgrade.bin" + "Failed!");
                            //         result.status = 'err';
                            //         result.reason = ''+err+'系统将重启恢复原有服务';
                            //         configres.end(JSON.stringify(result));
                            //         client.write('reboot -f');
                            //         return;
                            //     }
                            //     else {
                            //         //4.若md5正确则 用child_process 执行 sysupgrade,并返回服务器一个信息,页面开始出现进度条
                            //         var hash = crypto.createHash('md5');
                            //         var rs = fs.createReadStream('/tmp/upgrade.bin');
                            //         rs.on('data', hash.update.bind(hash));
                            //         rs.on('end', function () {
                            //             var filemd5sum = hash.digest('hex');
                            //             console.log("filemd5sum : "+ filemd5sum);
                            //             if(checkSum == filemd5sum)
                            //             {
                            //                 //5.执行升级操作
                            //                 console.log('Being to Upgrade.............................');
                            //                 //返回网关配置页面升级信息
                            //                 result.status = 'ok';
                            //                 result.reason = '升级包校验成功,升级中!';
                            //                 configres.end(JSON.stringify(result));
                            //                 //发送停止node进程的指令，并启动升级指令
                            //                 client.write("kill -9 $(pidof node) ; sleep 2;/sbin/sysupgrade -v /tmp/upgrade.bin");
                            //                 //休眠10秒钟后继续执行
                            //                 var waitUntil = new Date(new Date().getTime() + 10 * 1000);
                            //                 while(waitUntil > new Date()){}
                            //                 return;
                            //                 // process.exec('sysupgrade -v /tmp/upgrade.bin',function(error, stdout, stderr){
                            //                 //     console.log("升级失败.....................................");
                            //                 // });
                            //             }
                            //             else
                            //             {
                            //                 console.log('Md5CheckSum does not match ');
                            //
                            //                 //删除下载好的升级包并返回配置页面错误
                            //
                            //                 //返回网关配置页面错误信息
                            //                 result.status = 'err';
                            //                 result.reason = '升级包数据不完整!系统将重启恢复原有服务';
                            //                 configres.end(JSON.stringify(result));
                            //                 client.write('reboot -f');
                            //                 return;
                            //
                            //             }
                            //         });
                            //     }
                            // });
                        });
                    });

                    packagereq.on('error', function (e) {
                        //返回网关配置页面错误信息
                        console.error("________________Error Downloading Upgrade Package_________________________ "+e);
                        result.status = 'err';
                        result.reason = ''+e;
                        configres.end(JSON.stringify(result));
                    });
                    packagereq.end();
                    //========================================================================================
                }
                else
                {
                    //返回网关配置页面错误信息
                    result.status = 'err';
                    result.reason = '已经是最新升级包';
                    configres.end(JSON.stringify(result));
                }

            }
            else {
                //返回网关配置页面错误信息
                result.status = 'err';
                result.reason = pkginfoobj.reason;
                configres.end(JSON.stringify(result));
            }

        });

    });

    versionreq.on('error', function (e) {
        console.error("problem with request: "+e);
        result.status = 'err';
        result.reason = ''+e;
        configres.end(JSON.stringify(result));
    });
    versionreq.end();
}
module.exports = {
    "upgrade":upgrade
};