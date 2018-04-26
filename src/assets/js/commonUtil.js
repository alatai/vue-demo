import qs from 'qs'
import axios from 'axios'
import BScroll from 'better-scroll'

/**
 * 向localstorage中存储数据
 * @param name key
 * @param content value
 */
export const setStore = (name, content) => {
  if (!name) {
    return
  }
  if (typeof content !== 'string') {
    content = JSON.stringify(content)
  }
  window.localStorage.setItem(name, content)
}

/**
 * 获取localstorage中数据
 * @param name key
 * @returns {string | null} value
 */
export const getStore = (name) => {
  if (!name) {
    return null
  }
  return window.localStorage.getItem(name)
}

/**
 * 删除localstorage中数据
 * @param name key
 */
export const removeStore = (name) => {
  if (!name) {
    return
  }
  window.localStorage.removeItem(name)
}

/**
 * 以POST方式获取后台数据
 * @param url 访问后台的url
 * @param queryInfo 查询对象
 */
export const getPostData = (url, queryInfo) => {
  queryInfo = qs.stringify(queryInfo)
  // 每一个异步操作返回一个Promise对象,该对象拥有一个then方法,允许指定回调函数
  return new Promise(resolve => {
    // 获取后台数据任务代码
    axios.post(url, queryInfo, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(response => {
      // 回调操作
      resolve(response.data)
    })
  })
}

/**
 * 数据超出屏幕尺寸时添加滚动效果
 * @param component 组件对象
 * @param wrapper 滚动部分父容器
 * @param options better-scroll选项
 */
export const scroll = (component, wrapper, options) => {
  component.$nextTick(() => {
    this.scroll = new BScroll(wrapper, options)
  })
}
