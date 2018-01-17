var fs = require('fs');
var zlib = require('zlib');
var crypto = require('crypto');

/********************加密解密部分**************************/

var consts = {
    cryptkey: 'S62rgt9rf!nYS5b3',
    iv: "Og'Y6Jm-'i#io9Op"
};

function util (){

}
var prot = util.prototype;

prot.md5 = function (str) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
};

prot.encode = function (content) {
    var cipher = crypto.createCipheriv('aes-128-cbc', consts.cryptkey, consts.iv);
    cipher.setAutoPadding(true);
    var bf = [];
    bf.push(cipher.update(content));
    bf.push(cipher.final());
    return Buffer.concat(bf);
};


prot.decode = function (content) {
    var decipher = crypto.createDecipheriv('aes-128-cbc', consts.cryptkey, consts.iv);
    decipher.setAutoPadding(true);
    try {
        var a = [];
        a.push(decipher.update(content));
        a.push(decipher.final());
        return Buffer.concat(a);
    } catch (e) {
        console.error('decode error:', e.message);
        return null;
    }
};


/**********************压缩解压缩部分************************/
function gZip(strText, cb) {
    zlib.gzip(strText, function (err, bufData) {
        cb(err, bufData);
    });
}

function unZip(buffer, cb) {
    zlib.unzip(buffer, function (err, buf) {
        cb(err, buf);
    });
}



module.exports = {
    "EncodeUtil":util,
    "ZipUtil": {
        "gZip": gZip,
        "unZip": unZip
    }
};

