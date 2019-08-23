import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Redirect} from 'react-router-dom'
import {NavBar, InputItem, TextareaItem, Button} from 'antd-mobile'
import HeaderSelector from '../../components/header-selector/header-selector'

import {updateUser} from '../../redux/actions'

class ClubInfo extends Component {

    state = {
        header: '',
        post: '',
        info: '',
        club: '',
        salary: '',
    }

    // 更新header状态
    setHeader = (header) => {
        this.setState({
            header
        })
    }

    handleChange = (name, value) => {
        this.setState({
            [name]: value
        })
    }

    save = () => {
        this.props.updateUser(this.state)
    }

    render() {
        // 如果信息已经完善, 自动重定向到对应主界面
        const {header, type} = this.props.user
        if (header) {
            const path = type === 'student' ? '/student' : '/club'
            return <Redirect to={path}/>
        }

        return (
            <div>
                <NavBar>社团信息完善</NavBar>
                <HeaderSelector setHeader={this.setHeader}/>
                <InputItem placeholder='请输入招新岗位' onChange={val => {
                    this.handleChange('post', val)
                }}>招新岗位:</InputItem>
                <InputItem placeholder='请输入社团名称' onChange={val => {
                    this.handleChange('club', val)
                }}>社团名称:</InputItem>
                <InputItem placeholder='请输入招新年级' onChange={val => {
                    this.handleChange('salary', val)
                }}>招新年级:</InputItem>
                <TextareaItem title="招新要求:"
                              placeholder='请输入个人介绍'
                              rows={3} onChange={val => {
                    this.handleChange('info', val)
                }}/>
                <Button type='primary' onClick={this.save}>保&nbsp;&nbsp;&nbsp;存</Button>
            </div>
        )
    }
}

export default connect(
    state => ({user: state.user}),
    {updateUser}
)(ClubInfo)