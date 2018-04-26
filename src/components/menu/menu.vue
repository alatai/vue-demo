<template>
  <div class="menu" ref="wrapper">
    <div class="scroll-content" ref="scroll">
      <ul class="menu-ul">
        <li class="menu-li" v-for="org in orgList">
          <div class="menu-content">
            <router-link class="menu-font"
                         :to="{name: 'task', params: {orgId: org.ORG_ID}}">
              <div :class="{'active': org.isActive}"
                   @click="selectOrg(org)">{{org.ORG_SNAME}}
              </div>
            </router-link>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import BScroll from 'better-scroll'
  import {baseUrl} from '../../assets/js/api'
  import {getPostData} from '../../assets/js/commonUtil'

  export default {
    name: 'vMenu',
    data () {
      return {
        orgList: [{ORG_SNAME: '全部', isActive: true}] // 默认选中全部
      }
    },
    created () {
      this.init()
    },
    // keep-alive被激活时调用
    activated () {
      // 重新设定菜单位置与跳转前保持一致
      this.$nextTick(() => {
        this.$refs.scroll.style.transform = 'translate(' + Vue.menuX + 'px, 0px) translateZ(0px)'
        this.initScroll()
      })
    },
    methods: {
      // 初始化
      init () {
        this.loadData()
        this.initScroll()
      },
      // 加载数据
      loadData () {
        const url = baseUrl + 'spvHost/list'
        getPostData(url, {}).then(data => {
          data.forEach(value => {
            this.orgList.push(value)
          })
        })
      },
      // 添加滚动效果
      initScroll () {
        this.$nextTick(() => {
          const options = {
            startX: Vue.menuX || 0,
            scrollX: true,
            scrollY: false,
            click: true, // 默认false,会阻止点击事件
            bounce: false // 取消回弹效果
          }
          this.scroll = new BScroll(this.$refs.wrapper, options)
          this.scroll.on('touchEnd', (position) => {
            Vue.menuX = position.x
          })
        })
      },
      // 改变选中项样式
      selectOrg (org) {
        this.orgList.forEach((value) => {
          Vue.set(value, 'isActive', false)
        })
        Vue.set(org, 'isActive', true)
      }
    }
  }
</script>

<style scoped>
  @import "../../assets/css/base.css";

  .menu {
    position: relative;
    height: 40px;
    background-color: #F2F2F2;
  }

  .scroll-content {
    position: absolute;
    top: 0;
    left: 0;
    height: 40px;
    /*padding-top: 4px;*/
    /*padding-bottom: 6px;*/
    background-color: #F2F2F2;
  }

  .menu-ul {
    flex-direction: row; /*主轴为水平方向,自左起*/
    flex-wrap: nowrap; /*不换行排列*/
    margin-top: 8px;
    margin-bottom: 0;
    padding: 0;
  }

  .menu-li {
    list-style-type: none;
    white-space: nowrap;
  }

  .menu-content {
    margin: 0px 10px 0 10px;
  }

  .menu-font {
    color: #222;
    font-size: 17px;
  }

  .active { /*是否选中*/
    color: red;
  }
</style>
