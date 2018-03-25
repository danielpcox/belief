const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};

module.loaders = {
  test: require.resolve('jsPlumb'),
  loaders: [
    'imports?this=>window',
    'script'
  ]
};
