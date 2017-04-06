const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const dateFormat = require('dateformat');
const mysql = require('mysql');
const async = require('async');
const promise = require('promise');
const _ = require('lodash');

const log4js = require("log4js");
const log4js_config = require("./log4js.json");
log4js.configure(log4js_config);
const LogFile = log4js.getLogger('log_file');



const arr = ['https://v.qq.com/x/cover/fqfztc7bl1twj6f.html','http://v.youku.com/v_show/id_XMjY2NTI5MTk4NA==.html','http://www.iqiyi.com/v_19rrb887cc.html'];


function fetchQQ() {
    let url = 'https://v.qq.com/x/cover/fqfztc7bl1twj6f.html';

    let requestStockData = new Promise(function (resolve,reject) {
        request(url, function(err, res) {
            if (err) {
                console.log(err);
                return;
            }
            resolve(res);
        }).end();
    });
    requestStockData.then(function(res){

        let $ = cheerio.load(res.body.toString());

        console.log($('#mod_cover_playnum').text());
    });
}

function fetchUK() {
    let url = 'http://v.youku.com/v_show/id_XMjY2NTI5MTk4NA==.html';

    let pageReq = new Promise(function (resolve,reject) {
        request(url, function(err, res) {
            if (err) {
                console.log(err);
                return;
            }
            resolve(res);
        }).end();
    });
    pageReq.then(function(res){
        let htmlStr = res.body.toString();
        let videoId = htmlStr.match(/videoId\:\"(.*?)\"\,/);
        let videoId2 = htmlStr.match(/videoId2\:\"(.*?)\"\,/);
        let showid = htmlStr.match(/showid\:\"(.*?)\"\,/);

        let durl = `http://v.youku.com/action/getVideoPlayInfo?vid=${videoId[1]}&showid=${showid[1]}&param%5B%5D=share&param%5B%5D=favo&param%5B%5D=download&param%5B%5D=phonewatch&param%5B%5D=updown&callback=tuijsonp2`;
        let dataReq = new Promise(function (resolve,reject) {
            request(durl, function(err, res) {
                if (err) {
                    console.log(err);
                    return;
                }
                resolve(res);
            }).end();
        });
        dataReq.then(function(res){
            let jsonpStr = res.body.toString();
            let jsonStr = jsonpStr.match(/\{.*\}/);
            console.log(JSON.parse(jsonStr[0]).data.stat.vv);
        })
    });
}

function fetchQY() {
    var url = 'http://www.iqiyi.com/v_19rrb887cc.html';

    var pageReq = new Promise(function (resolve,reject) {
        request(url, function(err, res) {
            if (err) {
                console.log(err);
                return;
            }
            resolve(res);
        }).end();
    });
    pageReq.then(function(res){
        let htmlStr = res.body.toString();
        let albumId = htmlStr.match(/albumId\:([^,]*)/);

        let durl = `http://mixer.video.iqiyi.com/jp/mixin/videos/${albumId[1]}?callback=window.Q.__callbacks__.cbrh7pxi&status=1`;

        let dataReq = new Promise(function (resolve,reject) {
            request(durl, function(err, res) {
                if (err) {
                    console.log(err);
                    return;
                }
                resolve(res);
            }).end();
        });
        dataReq.then(function(res){
            let jsonpStr = res.body.toString();
            let matchResult = jsonpStr.match(/\(\{.*\}(?=\))/g);
            let jsonStr = matchResult[0].replace(/\(/,'');
            console.log(JSON.parse(jsonStr).data.playCount);
        })
    });
}


fetchQQ();
fetchUK();
fetchQY();


return;





var codeList = [];

var now = new Date();

var month = dateFormat(now,'m');
var year = dateFormat(now,'yyyy');
var season = Math.ceil(month/3);
var yearRange = 0;
var dateRange = [];

for(let j=season;j>=1;j--){
    dateRange.push([year,j]);
}

year--;

for(let i=1;i<=yearRange;i++){
    for(let j=4;j>=1;j--){
        dateRange.push([year-i,j]);
    }
}

console.log(dateRange);


var count = 0;


var connection = mysql.createConnection({
    host: '127.0.0.1',       //主机
    user: 'root',               //MySQL认证用户名
    password: '',        //MySQL认证用户密码
    port: '3306',                   //端口号
    database: 'stock'
});



var MysqlConnect = new Promise(function (resolve,reject) {
    // Connect using MongoClient

    connection.connect(function(err) {
        if (err) throw err;
        resolve();
    });
});

MysqlConnect.then(function(db){
    var getCodesFile = new Promise(function (resolve,reject) {
        fs.readFile(__dirname + '/code.json','UTF-8' ,function (err, data) {
            if (err) throw err;
            resolve(data)
        });
    });

    getCodesFile.then(function(data){

        async.mapSeries(stockList,function(node,cb){
            try{
                fetchData(node);
                cb(null,node);
            }catch(e){
                console.log('catch error..'+e);
            }

        }, function(err,results) {
            // console.log(results);
        });





    });

    //process.exit();
});










