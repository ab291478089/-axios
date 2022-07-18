<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { getListApi } from '@/api/goods'
const getList = () => {
getListApi().then(res => {console.log(res)})
  setTimeout(() => {
    getListApi().then(res => {console.log(res)})
  }, 200);
  setTimeout(() => {
    getListApi().then(res => {console.log(res)})
  }, 400);

}
</script>

<template>
  <button @click="getList" >点击</button>
</template>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
