<template>
  <div id="app">
    <keep-alive>
      <router-view name="header"/>
    </keep-alive>
    <keep-alive>
      <router-view name="menu"/>
    </keep-alive>
    <router-view/>
  </div>
</template>

<script>
  export default {
    name: 'app'
  }
</script>

<style>
  #app {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    background: #fff;
    text-align: center;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
</style>
