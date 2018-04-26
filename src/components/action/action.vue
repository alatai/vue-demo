<template>
  <div class="action">
    <!-- 头部 -->
    <div class="action-header">
      <router-link class="el-icon-arrow-left icon-position"
                   :to="{name: 'task', params: {orgId: orgId}}"></router-link>
      <span class="menu-title">落实行动</span>
    </div>

    <!-- 具体内容 -->
    <div class="action-content" ref="content">
      <!-- 行动信息 -->
      <div class="action-info" ref="actionInfo">
        <div class="action-name">
          {{action.TASK_NAME}}
        </div>
        <div class="action-manager">
          负责人: {{action.ACT_USER_NAME}} {{action.AID_USER_NAME}}
        </div>
      </div>

      <!-- 进度及进展-begin -->
      <div class="action-period" ref="actionPeriod">
        <div class="wrapper-content" ref="wrapper">
          <div>
            <div class="action-footer" ref="actionFooter">
              <div class="action-detail">
                <span class="title">目标及思路：</span>
                <div class="action-taskSummary">
                  {{action.TASK_SUMMARY}}
                </div>
              </div>
              <div class="action-detail">
                <span class="title">进度安排：</span>
                <div class="action-taskSummary">
                  {{action.TASK_PLAN}}
                </div>
              </div>
            </div>
            <div class="period" ref="period">
              <span class="title">进展情况：</span>
              <div class="period-taskSummary">
                <ul class="period-ul">
                  <li class="period-li" v-if="periodList.seen" v-for="period in periodList">
                    <div>
                      <div class="period-date">{{period.CUR_MONTH}}</div>
                      <div v-html="period.taskSummary">
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 进度及进展-end -->
    </div>
  </div>
</template>

<script>
  import BScroll from 'better-scroll'
  import {baseUrl} from '../../assets/js/api'
  import {getPostData} from '../../assets/js/commonUtil'

  export default {
    name: 'action',
    data () {
      return {
        action: {}, // 落实行动
        periodList: [], // 进展情况详情列表
        orgId: '/' // 对应公司ID
      }
    },
    created () {
      this.init()
    },
    methods: {
      // 初始化
      init () {
        this.loadActionData()
        this.loadPeriodData(this.action)
        this.initScroll()
        this.calculateHeigthAndWidth()
      },
      // 加载落实行动数据
      loadActionData () {
        this.action = this.$route.params.action
        this.orgId = this.$route.params.orgId
      },
      // 加载落实行动填报数据
      loadPeriodData (action) {
        const url = baseUrl + 'spvActionPeriod/list'
        const taskId = action.TASK_ID
        let queryInfo = {
          keyword: taskId,
          currentPage: 1,
          pageSize: 10
        }
        this.periodList = []
        getPostData(url, queryInfo).then(data => {
          data.listData.forEach(value => {
            if (value.taskSummary) {
              this.periodList.seen = true
              value.taskSummary = value.taskSummary.replace(new RegExp('\\n', 'gm'), '<br/>')
            }
            this.periodList.push(value)
          })
        })
      },
      // 进展情况详情添加滚动效果
      initScroll () {
        this.$nextTick(() => {
          const options = {
            // 显示滚动条
            scrollbar: {
              fade: false
            }
          }
          this.scroll = new BScroll(this.$refs.wrapper, options)
        })
      },
      // 调整滚动部分高度与div宽度
      calculateHeigthAndWidth () {
        this.$nextTick(() => {
          // 计算wrapper高度
          let contentHeight = this.$refs.content.offsetHeight
          let actionInfoHeight = this.$refs.actionInfo.offsetHeight
          let actionPeriodHeight = contentHeight - actionInfoHeight
          this.$refs.actionPeriod.style.height = actionPeriodHeight + 'px'
          // 计算div宽度
          let contentWidth = this.$refs.content.offsetWidth
          this.$refs.actionFooter.style.width = contentWidth + 'px'
          this.$refs.period.style.width = contentWidth - 28 + 'px'
        })
      }
    }
  }
</script>

<style scoped>
  @import "../../assets/css/base.css";

  div {
    text-align: left;
  }

  .action {
    padding: 0;
  }

  .icon-position {
    position: relative;
    top: 5px;
    font-size: 30px;
    color: black;
  }

  .action-header {
    position: fixed;
    top: 0;
    width: 100%;
    height: 43px;
    border-bottom: 1px solid #F2F2F2;
  }

  .menu-title {
    position: relative;
    left: 32%;
    vertical-align: middle;
    font-size: 20px;
  }

  .action-content {
    position: absolute;
    width: 100%;
    top: 43px;
    bottom: 0;
    padding-left: 0;
  }

  .action-info {
    border-bottom: 1px solid #F2F2F2;
  }

  .action-name {
    text-indent: 35px;
    padding: 5px 14px 5px 14px;
  }

  .action-manager {
    padding: 0 14px 5px 14px;
  }

  .action-period {
    position: relative;
    width: 100%;
  }

  .wrapper-content {
    position: absolute;
    top: 0;
    bottom: 0;
    overflow: hidden;
    font-weight: normal;
  }

  .title {
    font-weight: 700;
  }

  .action-footer {
    border-bottom: 8px solid #F2F2F2;
  }

  .action-detail {
    padding: 0 14px 10px 14px;
    /*width: 338px;*/
  }

  .action-taskSummary {
    padding-top: 10px;
    text-indent: 35px;
  }

  .period {
    padding: 5px 14px 0 14px;
  }

  .period-taskSummary {
    padding-top: 10px;
  }

  .period-ul {
    flex-direction: column;
    padding: 0;
    margin: 0;
  }

  .period-li {
    padding: 10px 0 10px 0;
  }

  .period-date {
    padding: 5px 0 5px 0;
    font-weight: 600;
  }
</style>
