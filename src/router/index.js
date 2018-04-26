import Vue from 'vue'
import Router from 'vue-router'
import Header from '@/components/header/vheader'
import Menu from '@/components/menu/menu'
import Task from '@/components/task/task'
import Action from '@/components/action/action'

Vue.use(Router)

export default new Router({
  // mode: 'history', // history模式跳转
  routes: [
    {
      path: '/',
      name: '/',
      components: {
        header: Header,
        menu: Menu,
        default: Task
      }
    },
    {
      path: '/task/:orgId?',
      name: 'task',
      components: {
        header: Header,
        menu: Menu,
        default: Task
      }
    },
    {
      path: '/action',
      name: 'action',
      component: Action
    }
  ],
  scrollBehavior (to, from, savedPosition) {
    // return 期望滚动到哪个的位置
    if (savedPosition) {
      return savedPosition
    } else {
      return {x: 0, y: 0}
    }
  }
})
