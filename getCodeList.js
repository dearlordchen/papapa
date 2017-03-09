var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var dateFormat = require('dateformat');
var codeList = [];

function fetchData(page) {
    var url = 'http://money.finance.sina.com.cn/d/api/openapi_proxy.php/?__s=[[%22hq%22,%22hs_a%22,%22%22,0,'+page+',80]]&callback=FDC_DC.theTableData';
    request(url, function(err, res) {
        if (err) return console.log(err);
        var json = JSON.parse(res.body.match(/\[.*\]/)[0]);

        var items = json[0].items;

        var month = dateFormat(now,'m');
        var year = dateFormat(now,'yyyy');
        var season = Math.ceil(month/3);


        var yearRange = 5;
        var dateRange = [];
        for(var i=0;i<=yearRange;i++){
            for(var j=4;j>=1;j--){
                dateRange.push([year-i,j]);
            }
        }


        items.forEach(function(i){
            codeList.push({
                symbol:i[0],
                code:i[1],
                name:i[2]
            })
        });


        if(page<40){
            fetchData(++page);
        }else{
            console.log(codeList);
            /**
             * fd, 使用fs.open打开成功后返回的文件描述符
             * buffer, 一个Buffer对象，v8引擎分配的一段内存
             * offset, 整数，从缓存区中读取时的初始位置，以字节为单位
             * length, 整数，从缓存区中读取数据的字节数
             * position, 整数，写入文件初始位置；
             * callback(err, written, buffer), 写入操作执行完成后回调函数，written实际写入字节数，buffer被读取的缓存区对象
             */

            fs.writeFile(__dirname + '/code1.json', JSON.stringify(codeList), 'utf8', function(){
                console.log(arguments);
                console.log('文件已写入');
            });
        }


    });
}
fetchData(1);