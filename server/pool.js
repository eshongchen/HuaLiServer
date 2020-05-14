//引入mysql模块
//既可以使用普通的连接，也可以是连接池
const mysql=require('mysql');
const pool=mysql.createPool({
	host:'127.0.0.1',
	port:'3306',
	user:'root',//
	password:'',
    database:'hl',
    charset:'utf8',
	connectionLimit:20 //设置连接池的大小。默认15个
});
module.exports=pool;//导出连接池pool