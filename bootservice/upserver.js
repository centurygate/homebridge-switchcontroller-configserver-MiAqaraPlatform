var net = require('net');
var timeout = 20000;//超时
var listenPort = 7003;//监听端口
var process = require('child_process');
var server = net.createServer(function(socket){
    // 我们获得一个连接 - 该连接自动关联一个socket对象
    console.log('connect: ' +
        socket.remoteAddress + ':' + socket.remotePort);
    //socket.setEncoding('binary');
    // process.exec('killall dropbear uhttpd; sleep 1;killall node ; sleep 2;/sbin/sysupgrade -v /tmp/upgrade.bin',function(error, stdout, stderr){
    //     console.log("升级失败.....................................");
    // });
    //超时事件
//    socket.setTimeout(timeout,function(){
//        console.log('连接超时');
//        socket.end();
//    });

    //接收到数据
    socket.on('data',function(data){

        //console.log('recv:' + data);
        var cmddata = ''+data;

	    if(cmddata == "killall node;/sbin/sysupgrade -v /tmp/upgrade.bin")
	    {
		socket.write("terminate");
	    }
        //'killall dropbear uhttpd; sleep 1;killall node ; sleep 2;/sbin/sysupgrade -v /tmp/upgrade.bin'

        console.log('Recv cmddata: '+cmddata);
        process.exec(cmddata,function(error, stdout, stderr){
        if(error)
        {
            console.log("___________________________________________");
            console.log("Exec : "+cmddata+"  Failed");
            console.log("___________________________________________");
            //socket.write("Exec : "+cmddata+"  Failed");
        }
        else{
            console.log("___________________________________________");
            console.log("Exec : "+cmddata+"  OK");
            console.log("___________________________________________");
            if(cmddata == "kill -9 $(pidof homebridge);kill -9 $(pidof dropbear);kill -9 $(pidof uhttpd)")
            {
                socket.write("continue");
            }
	    
        }
    });

    });

    //数据错误事件
    socket.on('error',function(exception){
        console.log('socket error:' + exception);
        socket.end();
    });
    //客户端关闭事件
    socket.on('close',function(data){
        console.log('close: ' +
            socket.remoteAddress + ' ' + socket.remotePort);

    });


}).listen(listenPort);

//服务器监听事件
server.on('listening',function(){
    console.log("server listening:" + server.address().port);
});

//服务器错误事件
server.on("error",function(exception){
    console.log("server error:" + exception);
}); 
