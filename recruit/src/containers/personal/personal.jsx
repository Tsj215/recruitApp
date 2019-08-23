/*
用户个人中心路由组件
 */

import React from 'react'
import {Result, List, WhiteSpace, Button, Modal} from 'antd-mobile'
import {connect} from 'react-redux'
import Cookies from 'js-cookie'
import {resetUser} from '../../redux/actions'

const Item = List.Item
const Brief = Item.Brief

class Personal extends React.Component {

    logout = () => {
        Modal.alert('退出', '确定退出登陆吗?', [
            {text: '取消'},
            {
                text: '确定',
                onPress: () => {

                    // 干掉cookie中userid
                    Cookies.remove('userid')
                    // 干掉redux管理user
                    this.props.resetUser()
                }
            }
        ])
    }

    render() {
        const {username, info, header, club, post, salary} = this.props.user
        return (
            <div style={{marginBottom: 50, marginTop: 50}}>
                <Result
                    img={<img src={require(`../../assets/images/${header}.png`)} style={{width: 50}} alt="header"/>}
                    title={username}
                    message={club}
                />

                <List renderHeader={() => '相关信息'}>
                    <Item multipleLine>
                        <Brief>招新岗位: {post}</Brief>
                        {salary ? <Brief>招新年级: {salary}</Brief> : null}
                        <Brief>简介: {info}</Brief>
                    </Item>
                </List>
                <WhiteSpace/>
                <List>
                    <Button type='warning' onClick={this.logout}>退出登录</Button>
                </List>
            </div>
        )
    }
}

export default connect(
    state => ({user: state.user}),
    {resetUser}
)(Personal)