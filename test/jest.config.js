const baseConfig = require('./base')

Object.assign(baseConfig, {
    testMatch: ['<rootDir>/src/test/unit/**/*.test.js'],
    // testEnvironmentOptions: {
    //     url: 'https://docs.qq.com?showLog=1',
    // },
})

module.exports = baseConfig
