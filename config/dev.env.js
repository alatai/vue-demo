'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  // API_ROOT: '"//192.168.137.1:8088/"'
  API_ROOT: '"//172.30.254.57:8080/hj_mobile/"'
})
