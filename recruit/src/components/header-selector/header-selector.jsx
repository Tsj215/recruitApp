/*
选择用户头像的UI组件
 */

import React, {Component} from 'react'
import {List, Grid} from 'antd-mobile'
import PropTypes from 'prop-types'

export default class HeaderSelector extends Component {

  static propTypes = {
    setHeader: PropTypes.func.isRequired
  }

  state = {
    icon: null
  }

  constructor(props) {
    super(props)

    this.headerList = []
    for (let i = 0; i < 20; i++) {
      this.headerList.push({
        text: '头像'+(i+1),
        icon: require(`../../assets/images/头像${i+1}.png`) // 不能使用import
      })
    }
  }

  handleClick = ({text, icon}) => {
    this.setState({icon})
    this.props.setHeader(text)
  }

  render () {
    // 头部界面
    const {icon} = this.state
    const listHeader = !icon ? '请选择头像' : (
      <div>
        已选择头像:<img src={icon} alt='头像'/>
      </div>
    )

    return (
      <List renderHeader={() => listHeader}>
        <Grid data={this.headerList}
              columnNum={5}
              onClick={this.handleClick}/>
      </List>
    )
  }
}