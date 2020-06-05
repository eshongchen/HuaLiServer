//加载Express模块
const express = require('express');
//加载body-parser模块
const bodyParser = require('body-parser');
const pool = require('./pool.js');
// 加载CORS模块
const cors = require('cors');
//创建服务器
const server = express();
server.use(cors({
    origin: ['http://127.0.0.1:8080', 'http://localhost:8080']
}));
//使用body-parser模块

server.use(bodyParser.urlencoded({
    extended: false
}));

//监听端口
//articles的get路由
server.post('/login', (req, res) => {
    let uname = req.body.uname;
    let upwd = req.body.upwd;
    // console.log(req.body)
    // console.log(req);
    // console.log(upwd);
    pool.query('select * from user where uname=? and upwd=?', [uname, upwd], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            res.send({ code: 1, message: '登录成功', result: result });
        } else {
            res.send({ code: 0, message: '登录失败' });
        }

    });
});
// 注册接口
server.post('/register', (req, res) => {
    let uname = req.body.uname;
    let upwd = req.body.upwd;
    // console.log(uname)
    var sql = 'SELECT COUNT(uid) AS count FROM user WHERE uname=?';
    pool.query(sql, [uname], (err, result) => {
        if (err) throw err;
        //获取指定用户名的数量，值只为0(代表用户不存在)或1(代表用户已存在)
        var count = result[0].count;
        if (count == 1) {
            //错误信息
            // console.log('用户注册失败');
            res.send({ message: '用户注册失败', code: 0 });
        } else {
            //3.将获取到的用户名和密码等信息写入数据表
            var sql = 'INSERT user(uname,upwd) VALUES(?,?)';
            //通过MySQL连接池执行SQL语句
            pool.query(sql, [uname, upwd], (err, result) => {
                if (err) throw err;
                // console('用户注册成功');
                res.send({ message: '用户注册成功', code: 1 });
            });
        }
    });
});
// 首页接口
server.get('/index', (req, res) => {
    var kd = req.query.kind;
    // console.log(req.query);
    var sql = 'select * from flower where Category=?';
    pool.query(sql, [kd], (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});
// 花花详情接口
server.get('/details/:id', (req, res) => {
    var id = req.params.id;
    var sql = 'select * from flower where Fid=?';
    pool.query(sql, [id], (err, result) => {
        if (err) throw err;
        res.send({ code: 1, result: result });
    });

});
// 搜索接口
server.get('/search/:keyword', (req, res) => {
    var keyword = "%" + req.params.keyword + "%";
    // console.log(keyword);
    var sql = "select * from flower where Category like ? or Cpmc like ? or Instro like ?";
    pool.query(sql, [keyword, keyword, keyword], (err, result) => {
        if (err) throw err;
        // console.log(result.length);
        res.send(result);
    });

});
// 添加商品到用户购物车列表
server.get('/add', (req, res) => {
    let uid = req.query.uid;
    let Fid = req.query.fid;

    pool.query('select * from cart where userid=? and fid=?', [uid, Fid], (err, result) => {
        if (err) throw err;
        if (result.length == 0) {
            let sql1 = 'insert cart(fid,userid,count) values(?,?,?)';
            pool.query(sql1, [Fid, uid, 1], (err, result) => {
                if (err) throw err;
                res.send({ code: 1 });
            });
        } else {
            var count = result[0].count + 1;
            pool.query("Update cart set count=? where userid=? and fid=?", [count, uid, Fid], (err, result) => {
                if (err) throw err;
                res.send({ code: 1 });
                //  console.log(result);
            });
        }

    });
});


// 获取某个用户的购物车列表
server.get('/cartlist', (req, res) => {
    var uid = req.query.uid;
    var sql = "select cart.fid,cart.userid,cart.count ,flower.Cpmc,flower.Imag,flower.Price from cart,flower where userid=? and cart.fid=flower.Fid"
    pool.query(sql, [uid], (err, result) => {
        if (err) throw err;
        res.send({ result: result });

    });
});
// 删除用户购物车的某个商品
server.post('/cartDel', (req, res) => {
    var userid = req.body.uid;
    var fid = req.body.fid;
    // console.log(userid,fid);
    var sql = 'delete  from cart where userid=? and fid=?';
    pool.query(sql, [userid, fid], (err, result) => {
        if (err) throw err;
        res.send(result);
    })
})
// 购物车商品数量加减，改变接口
server.post('/cartUpdate', (req, res) => {
    var userid = req.body.uid;
    var count = req.body.count;
    var fid = req.body.fid;
    console.log(count);
    var sql = 'UPDATE cart SET count=? WHERE userid=? and fid=?';
    pool.query(sql, [count, userid, fid], (err, result) => {
        if (err) throw err;
    });

});


server.listen(4000);