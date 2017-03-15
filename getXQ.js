var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var dateFormat = require('dateformat');
var mysql = require('mysql');
var async = require('async');
var promise = require('promise');
var _ = require('lodash');

var log4js = require("log4js");
var log4js_config = require("./log4js.json");
log4js.configure(log4js_config);
var LogFile = log4js.getLogger('log_file');




function fetchData() {
    var url = 'https://xueqiu.com/S/sz000333';

    var requestStockData = new Promise(function (resolve,reject) {
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

        let arr=[];

        let endPrice = $('.currentInfo strong').text().trim().match(/\d+\.\d+/)[0];

        arr.push(endPrice);

        let percent = $('.quote-percentage').text().trim().match(/\d+\.\d+/)[0];

        arr.push(percent);

        //内容解析
        $('.topTable tr').each(function(index) {
            var tritem = $(this);
            var tds = tritem.find('td span');

            tds.each(function(){
                arr.push($(this).text().trim());
            })
        });

        console.log(arr);
    });
}

fetchData();

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










