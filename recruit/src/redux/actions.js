/*
包含n个action creator
异步action
同步action
 */
import io from 'socket.io-client'
import {
    AUTH_SUCCESS,
    ERROR_MSG,
    RECEIVE_USER,
    RESET_USER,
    RECEIVE_USER_LIST,
    RECEIVE_MSG_LIST,
    RECEIVE_MSG,
    MSG_READ
} from './action-types'
import {
    reqRegister,
    reqLogin,
    reqUpdateUser,
    reqUser,
    reqUserList,
    reqChatMsgList,
    reqReadMsg
} from '../api'

function initIO(dispatch, userid) {
    if (!io.socket) {
        // 连接服务器, 得到与服务器的连接对象
        io.socket = io('ws://localhost:4000')
        // 绑定监听, 接收服务器发送的消息
        io.socket.on('receiveMsg', function (chatMsg) {
            console.log('客户端接收服务器发送的消息', chatMsg)

            if (userid === chatMsg.from || userid === chatMsg.to) {
                dispatch(receiveMsg(chatMsg, userid))
            }
        })

    }
}

// 异步获取消息列表数据
async function getMsgList(dispatch, userid) {
    initIO(dispatch, userid)
    const response = await reqChatMsgList()
    const result = response.data
    if (result.code === 0) {
        const {users, chatMsgs} = result.data
        dispatch(receiveMsgList({users, chatMsgs, userid}))
    }
}

// 发送消息的异步action
export const sendMsg = ({from, to, content}) => {
    return dispatch => {
        console.log('客户端向服务器发送消息', {from, to, content})
        io.socket.emit('sendMsg', {from, to, content})
    }
}

// 读取消息的异步action
export const readMsg = (from, to) => {
    return async dispatch => {
        const response = await reqReadMsg(from)
        const result = response.data
        if (result.code === 0) {
            const count = result.data
            dispatch(msgRead({count, from, to}))
        }
    }
}


// 授权成功的同步action
const authSuccess = (user) => ({type: AUTH_SUCCESS, data: user})
// 错误提示信息的同步action
const errorMsg = (msg) => ({type: ERROR_MSG, data: msg})
// 接收用户的同步action
const receiveUser = (user) => ({type: RECEIVE_USER, data: user})
// 重置用户的同步action
export const resetUser = (msg) => ({type: RESET_USER, data: msg})
// 接收用户列表的同步action
const receiveUserList = (userList) => ({type: RECEIVE_USER_LIST, data: userList})
// 接收消息列表的同步action
const receiveMsgList = ({users, chatMsgs, userid}) => ({type: RECEIVE_MSG_LIST, data: {users, chatMsgs, userid}})
// 接收一个消息的同步action
const receiveMsg = (chatMsg, userid) => ({type: RECEIVE_MSG, data: {chatMsg, userid}})
// 读取了某个聊天消息的同步action
const msgRead = ({count, from, to}) => ({type: MSG_READ, data: {count, from, to}})

// 注册异步action
export const register = (user) => {
    const {username, password, password2, type} = user
    if (!username) {
        return errorMsg('用户名必须指定!')
    } else if (password !== password2) {
        return errorMsg('2次密码要一致!')
    }
    return async dispatch => {

        const response = await reqRegister({username, password, type})
        const result = response.data //  {code: 0/1, data: user, msg: ''}
        if (result.code === 0) {// 成功
            getMsgList(dispatch, result.data._id)
            dispatch(authSuccess(result.data))
        } else {
            dispatch(errorMsg(result.msg))
        }
    }
}

// 登陆异步action
export const login = (user) => {

    const {username, password} = user
    if (!username) {
        return errorMsg('用户名必须指定!')
    } else if (!password) {
        return errorMsg('密码必须指定!')
    }

    return async dispatch => {

        const response = await reqLogin(user)
        const result = response.data
        if (result.code === 0) {// 成功
            getMsgList(dispatch, result.data._id)
            dispatch(authSuccess(result.data))
        } else {
            dispatch(errorMsg(result.msg))
        }
    }
}

// 更新用户异步action
export const updateUser = (user) => {
    return async dispatch => {
        const response = await reqUpdateUser(user)
        const result = response.data
        if (result.code === 0) {
            dispatch(receiveUser(result.data))
        } else {
            dispatch(resetUser(result.msg))
        }
    }
}

// 获取用户异步action
export const getUser = () => {
    return async dispatch => {
        // 执行异步ajax请求
        const response = await reqUser()
        const result = response.data
        if (result.code === 0) {
            getMsgList(dispatch, result.data._id)
            dispatch(receiveUser(result.data))
        } else {
            dispatch(resetUser(result.msg))
        }
    }
}

// 获取用户列表的异步action
export const getUserList = (type) => {
    return async dispatch => {

        const response = await reqUserList(type)
        const result = response.data

        if (result.code === 0) {
            dispatch(receiveUserList(result.data))
        }
    }
}

