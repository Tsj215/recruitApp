/*
包含n个工具函数的模块
 */
export function getRedirectTo(type, header) {
  let path
  // type
  if(type==='club') {
    path = '/club'
  } else {
    path = '/student'
  }
  // header
  if(!header) { // 没有值, 返回信息完善界面的path
    path += 'info'
  }

  return path
}