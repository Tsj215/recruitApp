/*
消息界面路由容器组件
 */
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {List, Badge} from 'antd-mobile'

const Item = List.Item
const Brief = Item.Brief

function getLastMsgs(chatMsgs, userid) {
    const lastMsgObjs = {}
    chatMsgs.forEach(msg => {

        if (msg.to === userid && !msg.read) {
            msg.unReadCount = 1
        } else {
            msg.unReadCount = 0
        }

        const chatId = msg.chat_id
        // 获取已保存的当前组件的lastMsg
        let lastMsg = lastMsgObjs[chatId]
        if (!lastMsg) {
            lastMsgObjs[chatId] = msg
        } else {

            const unReadCount = lastMsg.unReadCount + msg.unReadCount
            if (msg.create_time > lastMsg.create_time) {
                lastMsgObjs[chatId] = msg
            }
            lastMsgObjs[chatId].unReadCount = unReadCount
        }
    })

    const lastMsgs = Object.values(lastMsgObjs)

    lastMsgs.sort(function (m1, m2) {
        return m2.create_time - m1.create_time
    })
    console.log(lastMsgs)
    return lastMsgs
}

class Message extends Component {

    render() {
        const {user} = this.props
        const {users, chatMsgs} = this.props.chat

        // 对chatMsgs按chat_id进行分组
        const lastMsgs = getLastMsgs(chatMsgs, user._id)


        return (
            <List style={{marginTop: 50, marginBottom: 50}}>

                {
                    lastMsgs.map(msg => {
                        // 得到目标用户的id
                        const targetUserId = msg.to === user._id ? msg.from : msg.to
                        // 得到目标用户的信息
                        const targetUser = users[targetUserId]
                        return (
                            <Item
                                key={msg._id}
                                extra={<Badge text={msg.unReadCount}/>}
                                thumb={targetUser.header ? require(`../../assets/images/${targetUser.header}.png`) : null}
                                arrow='horizontal'
                                onClick={() => this.props.history.push(`/chat/${targetUserId}`)}
                            >
                                {msg.content}
                                <Brief>{targetUser.username}</Brief>
                            </Item>
                        )
                    })
                }
            </List>
        )
    }
}

export default connect(
    state => ({user: state.user, chat: state.chat}),
    {}
)(Message)