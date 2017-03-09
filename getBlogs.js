var request = require('request');
var cheerio = require('cheerio');

var mysql = require('mysql');
var db = mysql.createConnection({
    host:     '127.0.0.1',
    user:     'root',
    password: '',
    database: 'test'
});
db.connect();

function fetchData(key, page) {
    var url = 'http://zzk.cnblogs.com/s?t=b&w=' + key + '&p=' + page;
    request(url, function(err, res) {
        if (err) return console.log(err);
        var $ = cheerio.load(res.body.toString());
        var arr = [];
        //内容解析
        $('.searchItem').each(function() {
            var title = $(this).find('.searchItemTitle');
            var author = $(this).find('.searchItemInfo-userName a');
            var time = $(this).find('.searchItemInfo-publishDate');
            var view = $(this).find('.searchItemInfo-views');
            var info = {
                title: $(title).find('a').text(),
                href: $(title).find('a').attr('href'),
                author: $(author).text(),
                time: $(time).text(),
                visit: $(view).text().replace(/[^0-9]/ig, '')
            };
            arr.push(info);
            //打印
            console.log('============================= 输出开始 =============================');
            console.log(info);
            console.log('============================= 输出结束 =============================');
            //保存数据
            db.query('insert into blog set ?', info, function(err, result) {
                if (err) throw err;
                if (!!result) {
                    console.log('插入成功');
                    console.log(result.insertId);
                } else {
                    console.log('插入失败');
                }
            });
        });

        //下一页
        var nextA = $('.pager a').last(),
            nextUrl = '';
        if ($(nextA).text().indexOf('Next') > -1) {
            nextUrl = nextA.attr('href');
            page = nextUrl.slice(nextUrl.indexOf('p=') + 2);
            setTimeout(function() {
                fetchData(key, page);
            }, 2000);
        } else {
            db.end();
            console.log('没有数据了...');
        }

    });
}
fetchData('go', 1);