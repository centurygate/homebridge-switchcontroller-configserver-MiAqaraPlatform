function isValidIP(ip) {
    var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
    return reg.test(ip);
}
function isValidPort(str)  
{  
    var pattern=/^(\d)+$/g;  
    if(pattern.test(str)&&parseInt(str)<=65535&&parseInt(str)>=0){  
        return true;  
     }else{  
        return false;  
     }   
}
function isValidGroup(str)  
{  
    var pattern=/^(\d)+$/g;  
    if(pattern.test(str)&&parseInt(str)<=15&&parseInt(str)>=1){  
        return true;  
     }else{  
        return false;  
     }   
}

function isValidSIDORPassword(str)
{
    var pattern = /^[a-z0-9]+$/i;
    if(pattern.test(str)){  
        console.log("param :"+str+" is Valid");
        return true;

    }else{  
        console.log("param :"+str+"is Invalid");
        return false;  
    }   
}