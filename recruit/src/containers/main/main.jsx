/*
主界面的路由组件
 */

import React, {Component} from 'react'
import {Switch, Route, Redirect} from 'react-router-dom'
import {connect} from 'react-redux'
import Cookies from 'js-cookie'  // 可以操作前端cookie的对象 set()/get()/remove()
import {NavBar} from 'antd-mobile'

import ClubInfo from '../club-info/club-info'
import StudentInfo from '../student-info/student-info'
import Student from '../student/student'
import Club from '../club/club'
import Message from '../message/message'
import Personal from '../personal/personal'
import NotFound from '../../components/not-found/not-found'
import NavFooter from '../../components/nav-footer/nav-footer'
import Chat from '../chat/chat'


import {getRedirectTo} from '../../utils'
import {getUser} from '../../redux/actions'

class Main extends Component {

    // 给组件对象添加属性
    navList = [
        {
            path: '/club',
            component: Club,
            title: '学生列表',
            icon: 'student',
            text: '学生',
        },
        {
            path: '/student',
            component: Student,
            title: '社团列表',
            icon: 'club',
            text: '社团',
        },
        {
            path: '/message',
            component: Message,
            title: '消息列表',
            icon: 'message',
            text: '消息',
        },
        {
            path: '/personal',
            component: Personal,
            title: '用户中心',
            icon: 'personal',
            text: '个人',
        }
    ]

    componentDidMount() {

        const userid = Cookies.get('userid')
        const {_id} = this.props.user
        if (userid && !_id) {
            // 发送异步请求, 获取user
            this.props.getUser()
        }
    }

    render() {

        const userid = Cookies.get('userid')
        if (!userid) {
            return <Redirect to='/login'/>
        }

        const {user, unReadCount} = this.props
        // 如果user有没有_id, 返回null
        if (!user._id) {
            return null
        } else {

            let path = this.props.location.pathname
            if (path === '/') {

                path = getRedirectTo(user.type, user.header)
                return <Redirect to={path}/>
            }
        }

        const {navList} = this
        const path = this.props.location.pathname
        const currentNav = navList.find(nav => nav.path === path)

        if (currentNav) {

            if (user.type === 'club') {
                navList[1].hide = true
            } else {
                navList[0].hide = true
            }
        }

        return (
            <div>
                {currentNav ? <NavBar className='sticky-header'>{currentNav.title}</NavBar> : null}
                <Switch>
                    {
                        navList.map(nav => <Route key={nav.path} path={nav.path} component={nav.component}/>)
                    }
                    <Route path='/clubinfo' component={ClubInfo}/>
                    <Route path='/studentinfo' component={StudentInfo}/>
                    <Route path='/chat/:userid' component={Chat}/>

                    <Route component={NotFound}/>
                </Switch>
                {currentNav ? <NavFooter navList={navList} unReadCount={unReadCount}/> : null}
            </div>
        )
    }
}

export default connect(
    state => ({user: state.user, unReadCount: state.chat.unReadCount}),
    {getUser}
)(Main)
