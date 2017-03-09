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
        codeList = JSON.parse(data);
        console.log(codeList.length);
        // codeList = codeList.slice(0,99);
        console.log(codeList.length);
        //process.exit();

        let codeChunks = _.chunk(codeList, 90);


        async.mapSeries(codeChunks, function(chunk,cb){
            try{
                handleChunk(chunk);
                cb(null,chunk);
            }catch(e){
                console.log('catch error..'+e);
            }

        }, function(err,results) {
            console.log(results);
        });

        function handleChunk(codeList){

            var stockList = [];
            for(var code of codeList){
                for (var dd  of dateRange){
                    let a = {};
                    a.year = dd[0];
                    a.season = dd[1];
                    _.merge(a,code);
                    stockList.push(a)
                }
            }


            async.mapLimit(stockList,3,function(node,cb){
                try{
                    fetchData(node);
                    cb(null,node);
                }catch(e){
                    console.log('catch error..'+e);
                }

            }, function(err,results) {
                // console.log(results);
            });

            function fetchData(item) {
                    var url = 'http://money.finance.sina.com.cn/corp/go.php/vMS_MarketHistory/stockid/'+item.code+'.phtml?year='+item.year+'&jidu='+item.season;

                    var requestStockData = new Promise(function (resolve,reject) {
                        request(url, function(err, res) {
                            if (err) {
                                // console.log(codeList[count].code);
                                console.log('count is '+count);
                                LogFile.info('code is '+item.code);
                                LogFile.info('count is '+count);
                                LogFile.info('err is '+err);
                                console.log(err);
                                return;
                            }
                            resolve(res);
                        }).end();
                    });

                    requestStockData.then(function(res){
                        //请求计数加1
                        count++;
                        console.log(count);
                        var $ = cheerio.load(res.body.toString());
                        //内容解析
                        $('#FundHoldSharesTable tr').each(function(index) {
                            if(index>1){
                                var tritem = $(this);

                                var tds = tritem.find('td');
                                var o={};
                                var arr=[];
                                o.symbol = item.symbol;
                                o.code = item.code;
                                o.name = item.name;

                                tds.each(function(){
                                    arr.push($(this).text().trim());
                                })

                                let now = new Date();

                                o.date = arr[0];
                                o.start_price = arr[1];
                                o.high_price = arr[2];
                                o.end_price = arr[3];
                                o.low_price = arr[4];
                                o.trade_num = arr[5];
                                o.trade_money = arr[6];
                                o.add_time = dateFormat(now, "isoDateTime");
                                o.update_time = dateFormat(now, "isoDateTime");



                                //数据存储mysql


                                var AddSql = 'INSERT INTO t_origin_data_v1 SET ?';

                                //存数据库
                                connection.query(AddSql, o, function (err, result) {
                                    if (err) {
                                        console.log('[INSERT ERROR] - ', err.message);
                                        return;
                                    }
                                    // console.log('--------------------------INSERT----------------------------');
                                    // console.log('INSERT ID:', result);
                                    // console.log('-----------------------------------------------------------------\n\n');
                                });
                            }
                        });
                    });

            }
        }
        // handleChunk(codeList);
        // fetchData(0);
    });

    //process.exit();
});










