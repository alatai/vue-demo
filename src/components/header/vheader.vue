<template>
  <div class="header">
    <!-- 搜索栏begin -->
    <div class="scroll">
      <select name="treeVer" class="header-select" v-model="selected" @change="selectTreeVer(selected)">
        <option value="" style="height: 20px;" selected>请选择任务年度</option>
        <option :value=treeVer.treeVerId
                style="height: 20px"
                v-for="treeVer in treeVerList">
          {{treeVer.treeVerName}}
        </option>
      </select>
      <div class="search-wrapper">
        <div class="header-search" @touchstart="openSearch()">
          我要搜索
        </div>
      </div>
    </div>
    <!-- 搜索栏end -->

    <!-- 搜索详情begin -->
    <transition>
      <div v-show="showSearch" class="search">
        <div class="search-content">
          <i @click="closeSearch()" class="search-close el-icon-arrow-left" style="color: black;"></i>
          <input class="search-input"
                 type="search"
                 placeholder="请输入落实行动名称"
                 v-model="queryInfo.keyword"
                 @input="clearSearch()">
          <span class="search-font" @click="searchByKeyword()">搜索</span>
        </div>
        <div v-show="showHistory">
          <div class="history-wrapper" ref="history">
            <div>
              <span style="display: inline-block;position: relative;top: 10px;color: #666;font-weight: 700;">搜索历史</span>
              <ul class="history-ul">
                <li class="history-li" v-for="history in searchHistory" @click="searchByExistKeyword(history)">
                <span class="history-keyword">
                  {{history.substring(0,4)}}
                </span>
                </li>
              </ul>
              <span style="color: #666;font-weight: 700;display: inline-block;margin-bottom: 0.8rem;"
                    @click="clearHistory()">清空搜索历史</span>
            </div>
          </div>
        </div>
        <div class="search-result">
          <div v-if="hasResult">
            <div class="result-wrapper" ref="wrapper">
              <ul class="result-ul">
                <li class="result-li" v-for="item in resultList">
                  <router-link class="detail-item" v-if="item.seen"
                               :to="{name:'action', params: {action: item, orgId: queryInfo.orgId}}">
                    <div class="detail-name">{{item.TASK_NAME}}</div>
                    <div class="detail-manager">负责人: {{item.ACT_USER_NAME}}
                      {{item.AID_USER_NAME}}
                    </div>
                  </router-link>
                  <router-link class="detail-item" v-else
                               :to="{name:'action', params: {action: item, orgId: queryInfo.orgId}}">
                    <div class="detail-name">{{item.TASK_NAME.substring(0,20)}}...</div>
                    <div class="detail-manager">负责人: {{item.ACT_USER_NAME}}
                      {{item.AID_USER_NAME}}
                    </div>
                  </router-link>
                </li>
              </ul>
            </div>
          </div>
          <div style="padding-top: 1rem;" v-if="hasNoResult">
            对不起！无搜索结果
          </div>
        </div>
      </div>
    </transition>
    <!-- 搜素详情end -->

    <!-- 首次登陆提示 -->
    <div class="test">思路清、措施实、有抓手、出成效</div>
  </div>
</template>

<script>
  import {baseUrl} from '../../assets/js/api'
  import {bus} from '../../assets/js/eventBus'
  import {setStore, getStore, removeStore, getPostData, scroll} from '../../assets/js/commonUtil'

  export default {
    name: 'vHeader',
    data () {
      return {
        showSearch: false, // 是否打开搜索页面
        showKeyword: true, // 是否显示关键字
        queryInfo: { // 查询对象
          keyword: '',
          currentPage: 1,
          pageSize: 10
        },
        showHistory: false, // 是否显示搜索历史
        searchHistory: [], // 搜索历史
        hasResult: false, // 存在搜索结果
        hasNoResult: false, // 无搜索结果
        resultList: [], // 搜索匹配结果
        treeVerList: [], // 任务年度
        selected: '' // 当前选中任务年度
      }
    },
    created () {
      this.init()
    },
    methods: {
      // 初始化
      init () {
        this.loadTreeVerData()
      },
      // 打开搜索页面
      openSearch () {
        this.showSearch = true
        this.hasResult = false
        this.hasNoResult = false
        this.loadHistoryKeyword()
      },
      // 关闭搜索页面
      closeSearch () {
        this.showSearch = false
        this.showKeyword = true
        this.queryInfo.keyword = ''
        this.resultList = []
      },
      // 根据关键字搜索匹配行动
      searchByKeyword () {
        // 当前搜索关键字
        let keyword = this.queryInfo.keyword
        this.resultList = []
        this.storeSearchKeyword(keyword)
      },
      // 存储搜索关键字
      storeSearchKeyword (keyword) {
        // 当前搜索不为空
        if (keyword !== '') {
          this.showHistory = false
          this.loadData(this.queryInfo)
          // 获取搜索记录
          let searchHistory = JSON.parse(getStore('searchHistory'))
          // 若搜索记录中没有当前搜索关键字,则新增一条
          if (searchHistory != null) {
            let hasSearched = false
            searchHistory.forEach((value) => {
              if (keyword === value) {
                hasSearched = true
              }
            })
            if (!hasSearched) {
              this.searchHistory.push(keyword)
            }
          } else {
            this.searchHistory.push(keyword)
          }
          setStore('searchHistory', this.searchHistory)
        }
      },
      // 加载搜索关键字
      loadHistoryKeyword () {
        if (getStore('searchHistory')) {
          this.searchHistory = JSON.parse(getStore('searchHistory'))
          this.showHistory = true
          this.initSearchScroll()
        }
      },
      // 当搜索框内容为空时显示搜索历史
      clearSearch () {
        if (!this.queryInfo.keyword && this.searchHistory.length > 0) {
          this.resultList = []
          this.showHistory = true
          this.hasResult = false
          this.hasNoResult = false
        }
      },
      // 清空搜索历史
      clearHistory () {
        this.searchHistory = []
        removeStore('searchHistory')
        this.$nextTick(() => {
          this.showHistory = false
        })
      },
      // 加载匹配数据
      loadData (queryInfo) {
        const url = baseUrl + 'spvAction/list'
        getPostData(url, queryInfo).then(data => {
          this.hasResult = data.listData.length > 0
          data.listData.forEach(value => {
            value.seen = value.TASK_NAME.length < 20
            this.resultList.push(value)
          })
        })
        this.showKeyword = false
        setTimeout(() => {
          this.initScroll()
        }, 500)
      },
      // 点击已存在的关键字搜索匹配内容
      searchByExistKeyword (keyword) {
        this.resultList = []
        this.queryInfo.keyword = keyword
        this.storeSearchKeyword(keyword)
        this.showHistory = false
      },
      // 加载任务
      loadTreeVerData () {
        const url = baseUrl + 'spvTreeVer/list'
        getPostData(url, {}).then(data => {
          data.forEach(value => {
            this.treeVerList.push(value)
          })
        })
      },
      // 当搜索结果超出屏幕时增加滚动效果
      initScroll () {
        if (this.$refs.wrapper) {
          const options = {
            click: true
          }
          scroll(this, this.$refs.wrapper, options)
        } else {
          this.hasNoResult = true
        }
      },
      // 当搜索历史超出屏幕高度时增加滚动效果
      initSearchScroll () {
        const options = {
          click: true
        }
        scroll(this, this.$refs.history, options)
      },
      // 监听下拉框数据变化,在组件间传递参数
      selectTreeVer (selected) {
        bus.$emit('userDefinedEvent', selected)
      }
    }
  }
</script>

<style scoped>
  @import "../../assets/css/base.css";

  .header {
    position: relative;
    top: 0;
    height: 45px;
    background-color: #FFF;
  }

  .header-select {
    height: 50%;
    width: 60%;
    position: absolute;
    top: 25%;
    left: 6%
  }

  .search-wrapper {
    position: absolute;
    right: 0;
    height: 100%;
    width: 25%;
    border-left: 5px solid #F2F2F2;
  }

  .header-search {
    position: relative;
    height: 87%;
    margin-top: 12px;
    width: 100%;
    background: white;
    text-align: center;
  }

  .search {
    position: fixed;
    z-index: 1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #FFF;
  }

  .history-wrapper {
    position: fixed;
    top: 3.6rem;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: hidden;
  }

  .history-ul {
    z-index: 1;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 0;
  }

  .history-li {
    width: 49.4%;
    height: 40px;
    border: 1px solid #F2F2F2;
  }

  .history-keyword {
    margin-top: 10px;
    display: inline-block;
    width: 100%;
  }

  .search-close {
    position: absolute;
    left: 0.2rem;
    top: 0.8rem;
    font-size: 30px;
  }

  .search-content {
    padding-bottom: 2%;
    border-bottom: 5px solid #F3F5F7;
  }

  .search-input {
    margin-left: 1rem;
    width: 70%;
    margin-top: 0.6rem;
    margin-bottom: 0.1rem;
    height: 35px;
    border: 1px solid #409EFF;
    outline: none;
  }

  .search-font {
    position: relative;
    top: 2px;
    left: 16px;
    font-size: 18px;
    color: #409EFF;
  }

  .result-wrapper {
    position: fixed;
    top: 3.6rem;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: hidden;
  }

  .result-ul {
    flex-direction: column;
    flex-wrap: nowrap;
    text-align: left;
    padding: 0;
    margin: 0;
  }

  .result-li {
    height: 4rem;
    border-bottom: 1px solid #F3F5F7;
    border-top: 1px solid #F3F5F7;
  }

  .detail-item {
    display: inline-block;
    width: 20rem;
    padding: 0 0 0 2rem;
    font-size: 14px;
    color: #000000;
  }

  .detail-name {
    padding-top: 3px;
  }

  .detail-manager {
    padding-top: 1.2rem;
    color: #999999;
    font-size: 0.8rem
  }

  .test {
    display: none;
    z-index: 1;
    position: fixed;
    height: 100px;
    width: 100%;
    background-color: #01478C;
    font-family: 华文行楷;
    font-weight: lighter;
    font-size: 24px;
    color: #FFF;
  }
</style>
