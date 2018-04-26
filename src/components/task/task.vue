<template>
  <div class="task">
    <!-- 滚动部分begin -->
    <div class="scroll-wrapper" ref="wrapper">
      <div>
        <!-- 顶部提示 -->
        <div class="top-tip">
          <span class="refresh">下拉刷新</span>
        </div>
        <!-- 主体内容列表 -->
        <ul class="task-ul">
          <li class="task-li" v-for="task in taskList">
            <div class="task-content">
              <div class="task-name">
                <span class="task-font">
                  {{task.TASK_NAME.substring(0, 16)}}
                </span>
              </div>
              <div class="task-summary" v-if="task.seen">
                <span class="content-font">{{task.TASK_SUMMARY.substring(0, 60)}}</span>
              </div>
              <div class="task-summary" v-else>
                <span class="content-font"></span>
              </div>
              <div class="task-details">
                <span style="color: #999999;">{{task.ORG_NAME}}</span>
                <span style="color: #999999;" @click="openDetail(task)">
                  举措({{task.ACTION_COUNT}})
                </span>
              </div>
            </div>
          </li>
        </ul>
        <!-- 底部提示 -->
        <div class="bottom-tip">
          <span class="loading">查看更多</span>
        </div>
      </div>
    </div>
    <!-- 滚动部分begin -->

    <!-- 展开行动部分begin -->
    <transition name="fade">
      <div class="detail-background" v-show="showAction" @click="hideDetail()">
        <div class="detail-content">
          <ul class="detail-ul">
            <li class="detail-li" v-for="action in actionList">
              <router-link class="detail-router" v-if="action.seen"
                           :to="{name:'action', params: {action: action, orgId: queryInfo.orgId}}">
                {{action.TASK_NAME}}
              </router-link>
              <router-link class="detail-router" v-else
                           :to="{name:'action', params: {action: action, orgId: queryInfo.orgId}}">
                {{action.TASK_NAME.substring(0, 14)}}...
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </transition>
    <!-- 展开行动部分end -->

    <!-- 提示信息 -->
    <div class="alert alert-hook">刷新成功</div>
  </div>
</template>

<script>
  import BScroll from 'better-scroll'
  import {baseUrl} from '../../assets/js/api'
  import {bus} from '../../assets/js/eventBus'
  import {getPostData} from '../../assets/js/commonUtil'

  export default {
    name: 'task',
    data () {
      return {
        taskList: [], // 任务列表
        queryInfo: { // 查询对象
          keyword: '',
          currentPage: 1,
          pageSize: 10
        },
        actionList: [], // 落实行动列表
        showAction: false // 是否显示落实行动
      }
    },
    // 监听路由: 对路由变化做出响应
    watch: {
      '$route': 'reloadTaskData'
    },
    // 生命周期: 被实例化后立即调用
    created () {
      this.init()
    },
    // dom元素被挂载之后执行
    mounted () {
      // 根据任务年度加载任务数据
      bus.$on('userDefinedEvent', (treeVerId) => {
        this.queryInfo.treeVerId = treeVerId
        this.queryInfo.currentPage = 1
        this.taskList = []
        this.loadTaskData(this.queryInfo)
        document.querySelector('.loading').innerHTML = '查看更多'
      })
    },
    // 销毁之前执行: 使用$on需要被销毁(解决eventBus重复调用问题)
    beforeDestroy () {
      bus.$off('userDefinedEvent')
    },
    methods: {
      // 初始化
      init () {
        this.loadTaskData(this.queryInfo)
        this.initTaskScroll()
      },
      // 加载任务数据
      loadTaskData (queryInfo) {
        const url = baseUrl + 'spvTreePlan/list'
        if (this.$route.params.orgId) {
          this.queryInfo.orgId = this.$route.params.orgId
        }
        getPostData(url, queryInfo).then(data => {
          data.listData.forEach(value => {
            value.seen = value.TASK_SUMMARY !== null
            this.taskList.push(value)
          })
        })
      },
      // 路由变化时重新加载数据
      reloadTaskData () {
        this.queryInfo.orgId = this.$route.params.orgId
        this.queryInfo.currentPage = 1
        this.taskList = []
        this.loadTaskData(this.queryInfo)
        document.querySelector('.loading').innerHTML = '查看更多'
      },
      // 任务部分数据添加滚动效果
      initTaskScroll () {
        this.$nextTick(() => {
          const options = {
            click: true,
            probeType: 1
          }
          this.scroll = new BScroll(this.$refs.wrapper, options)
          // 添加滑动提示
          this.scroll.on('scroll', (position) => {
            if (position.y > 30) {
              document.querySelector('.refresh').innerHTML = '释放立即刷新'
            }
          })
          // 下拉刷新数据
          this.scroll.on('touchEnd', (position) => {
            let self = this
            if (position.y > 30) {
              setTimeout(() => {
                self.taskList = []
                self.queryInfo.currentPage = 1
                self.loadTaskData(self.queryInfo)
                self.scroll.refresh()
                document.querySelector('.refresh').innerHTML = '下拉刷新'
                self.refreshAlert('刷新成功')
              }, 500)
              // 上拉加载更多数据
            } else if (position.y < (self.scroll.maxScrollY - 30)) {
              document.querySelector('.loading').innerHTML = '加载中...'
              setTimeout(function () {
                // 向列表添加数据
                self.queryInfo.currentPage += 1
                let lengthBeforeLoad = self.taskList.length
                let lengthAfterLoad
                setTimeout(() => {
                  lengthAfterLoad = self.taskList.length
                  if (lengthAfterLoad === lengthBeforeLoad) {
                    document.querySelector('.loading').innerHTML = '暂无更多数据'
                  } else {
                    document.querySelector('.loading').innerHTML = '查看更多'
                  }
                }, 200)
                self.loadTaskData(self.queryInfo)
                self.scroll.refresh()
              }, 500)
            }
          })
        })
      },
      // 刷新成功提示
      refreshAlert (text) {
        text = text || '操作成功'
        document.querySelector('.alert-hook').innerHTML = text
        document.querySelector('.alert-hook').style.display = 'block'
        setTimeout(() => {
          document.querySelector('.alert-hook').style.display = 'none'
        }, 1000)
      },
      // 点击举措进入填报详情
      openDetail (task) {
        const url = baseUrl + 'spvAction/list'
        const tkTaskId = task.TK_TASK_ID
        let queryInfo = {
          tkTaskId: tkTaskId,
          currentPage: 1,
          pageSize: 20
        }
        if (this.$route.params.orgId) {
          queryInfo.orgId = this.$route.params.orgId
        }
        this.actionList = []
        getPostData(url, queryInfo).then(data => {
          data.listData.forEach(value => {
            value.seen = value.TASK_NAME.length < 14
            this.actionList.push(value)
          })
        })
        this.showAction = true
      },
      // 关闭详情页面
      hideDetail () {
        this.showAction = false
      }
    }
  }
</script>

<style scoped>
  @import "../../assets/css/base.css";

  .task {
    position: relative;
    height: 87%;
    overflow: hidden;
  }

  .scroll-wrapper {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #CCC;
  }

  .top-tip {
    position: absolute;
    top: -40px;
    left: 0;
    width: 100%;
    height: 40px;
    line-height: 40px;
    text-align: center;
    color: #777;
  }

  .bottom-tip {
    width: 100%;
    height: 35px;
    line-height: 35px;
    text-align: center;
    color: #777;
    background: #F2F2F2;
  }

  .alert {
    display: none;
    position: fixed;
    left: 0;
    width: 100%;
    height: 35px;
    line-height: 35px;
    text-align: center;
    font-size: 12px;
    background: rgba(7, 17, 27, 0.7);
    color: #FFF;
  }

  .task-ul {
    flex-direction: column;
    padding: 0;
    margin: 0;
    background-color: #FFF;
  }

  .task-li {
    padding-bottom: 5px;
    border-bottom: 6px solid #F3F5F7;
  }

  .task-content {
    height: 130px;
  }

  .task-name {
    text-align: left;
    padding: 5px 10px 0 10px;
  }

  .task-font {
    font-weight: 700;
    font-size: 18px;
    color: #222222;
  }

  .task-summary {
    height: 48%;
    text-align: left;
    padding: 5px 10px 10px 10px;
    border-bottom: 1px solid #F3F5F7;
  }

  .task-details {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    padding: 4px 15px 0 10px;
  }

  .detail-background {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    backdrop-filter: blur(8px);
    background: rgba(119, 119, 119, 0.7);
  }

  .detail-content {
    position: absolute;
    z-index: 9999;
    top: 30%;
    left: 15%;
    width: 70%;
    background: #FFF;
    -webkit-border-radius: 20px;
    -moz-border-radius: 20px;
    border-radius: 20px;
  }

  .detail-ul {
    flex-direction: column;
    padding: 0;
  }

  .detail-li {
    padding: 10px 0 10px 5px;
    text-align: left;
    border-bottom: 1px solid #F2F2F2;
  }

  .detail-router {
    color: #000;
    width: 100%;
    height: 100%;
    display: inline-table;
  }
</style>
