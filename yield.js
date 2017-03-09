/**
 * Created by chenlei12 on 2017-2-13.
 */
function* helloWorldGenerator() {
    yield 'hello';
    yield 'world';
    return 'ending';
}

var hw = helloWorldGenerator();
console.log(hw.next());
console.log(hw.next('hehe'));
console.log(hw.next());




function* gen() {
    yield  123 + 456;
}

var g = gen();
console.log(g.next());
console.log(g.next());



function* f() {
    for(var i = 0; true; i++) {
        var reset = yield i;
        if(reset) { i = -1; }
    }
}

var g = f();

console.log(g.next()) // { value: 0, done: false }
console.log(g.next())// { value: 1, done: false }
console.log(g.next())// { value: 2, done: false }
console.log(g.next(true)) // { value: 0, done: false }



function* foo(x) {
    var y = 2 * (yield (x + 1));
    var z = yield (y / 3);
    return (x + y + z);
}

var a = foo(5);
console.log(a.next()) // Object{value:6, done:false}
console.log(a.next())// Object{value:NaN, done:false}
console.log(a.next())// Object{value:NaN, done:true}

return;

var b = foo(5);
console.log(b.next()) // { value:6, done:false }
console.log(b.next(12)) // { value:8, done:false }
console.log(b.next(13)) // { value:42, done:true }


function* test(p){
    console.log(p); // 1
    var a = yield p + 1;
    console.log(a); // 3
}

var g = test(1);
var ret;
ret = g.next();
console.log(ret); // { value: 2, done: false }
ret = g.next(ret.value + 1);
console.log(ret); // { value: undefined, done: true }


co(function *( input ) {
    var now = Date.now();
    yield sleep200;
    console.log(Date.now() - now);
});

function co(fn){
    var gen = fn();
    next();
    function next(res){
        var ret;
        ret = gen.next(res);
        // 全部结束
        if(ret.done){
            return;
        }
        // 执行回调
        if (typeof ret.value == 'function') {
            ret.value(function(){
                next.apply(this, arguments);
            });
            return;
        }
        throw 'yield target no supported!';
    }
}

function sleep200(cb){
    setTimeout(cb, 200)
}