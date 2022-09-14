const path = require('path')

module.exports = {
  webpack: {
    configure: (config, { env, paths }) => {
      config.resolve.alias = {
        ...config.resolve.alias,
        'simpleMicroApp': './src/micro/index.js'
      }
      // config.resolve.alias
      // .set("simple-micro-app", path.join(__dirname, '../src/index.js'))
      return config;
    }
  },
}