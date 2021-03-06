const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'game.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    modules: [
      path.resolve('./src'),
      path.resolve('./node_modules')
    ]
  },
};