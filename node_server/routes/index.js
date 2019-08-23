var express = require('express');
var router = express.Router();

const md5 = require('blueimp-md5')
const {UserModel, ChatModel} = require('../db/models')
const filter = {password: 0, __v: 0}

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

// 注册的路由
router.post('/register', function (req, res) {
    // 读取请求参数数据
    const {username, password, type} = req.body
    //判断用户是否已经存在, 如果存在, 返回提示错误的信息, 如果不存在, 保存
    UserModel.findOne({username}, function (err, user) {
        if (user) {
            res.send({code: 1, msg: '此用户已存在'})
        } else {
            new UserModel({username, type, password: md5(password)}).save(function (error, user) {

                res.cookie('userid', user._id, {maxAge: 1000 * 60 * 60 * 24})
                const data = {username, type, _id: user._id}
                res.send({code: 0, data})
            })
        }
    })

})

// 登陆路由
router.post('/login', function (req, res) {
    const {username, password} = req.body

    UserModel.findOne({username, password: md5(password)}, filter, function (err, user) {
        if (user) {
            res.cookie('userid', user._id, {maxAge: 1000 * 60 * 60 * 24})
            res.send({code: 0, data: user})
        } else {
            res.send({code: 1, msg: '用户名或密码不正确!'})
        }
    })
})

// 更新用户信息的路由
router.post('/update', function (req, res) {
    // 从请求的cookie得到userid
    const userid = req.cookies.userid

    if (!userid) {
        return res.send({code: 1, msg: '请先登陆'})
    }

    const user = req.body // 没有_id
    UserModel.findByIdAndUpdate({_id: userid}, user, function (error, oldUser) {

        if (!oldUser) {
            // 通知浏览器删除userid cookie
            res.clearCookie('userid')
            res.send({code: 1, msg: '请先登陆'})
        } else {
            const {_id, username, type} = oldUser
            const data = Object.assign({_id, username, type}, user)
            res.send({code: 0, data})
        }
    })
})

// 获取用户信息的路由
router.get('/user', function (req, res) {
    // 从请求的cookie得到userid
    const userid = req.cookies.userid

    if (!userid) {
        return res.send({code: 1, msg: '请先登陆'})
    }
    // 根据userid查询对应的user
    UserModel.findOne({_id: userid}, filter, function (error, user) {
        if (user) {
            res.send({code: 0, data: user})
        } else {
            // 通知浏览器删除userid cookie
            res.clearCookie('userid')
            res.send({code: 1, msg: '请先登陆'})
        }

    })
})

// 获取用户列表(根据类型)
router.get('/userlist', function (req, res) {
    const {type} = req.query
    UserModel.find({type}, filter, function (error, users) {
        res.send({code: 0, data: users})
    })
})

/*
获取当前用户所有相关聊天信息列表
 */
router.get('/msglist', function (req, res) {
    // 获取cookie中的userid
    const userid = req.cookies.userid
    // 查询得到所有user文档数组
    UserModel.find(function (err, userDocs) {

        const users = userDocs.reduce((users, user) => {
            users[user._id] = {username: user.username, header: user.header}
            return users
        }, {})

        ChatModel.find({'$or': [{from: userid}, {to: userid}]}, filter, function (err, chatMsgs) {
            // 返回包含所有用户和当前用户相关的所有聊天消息的数据
            res.send({code: 0, data: {users, chatMsgs}})
        })
    })
})

/*
修改指定消息为已读
 */
router.post('/readmsg', function (req, res) {
    // 得到请求中的from和to
    const from = req.body.from
    const to = req.cookies.userid

    ChatModel.update({from, to, read: false}, {read: true}, {multi: true}, function (err, doc) {
        console.log('/readmsg', doc)
        res.send({code: 0, data: doc.nModified}) // 更新的数量
    })
})

module.exports = router;
