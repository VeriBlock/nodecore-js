const path = require('path');

module.exports = {
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  mode : 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    library: 'VeriBlock',
    libraryTarget: 'umd',
    filename: 'bundle.dev.js',
    path: path.resolve(__dirname, 'html/dist'),
  },
  node: {
    Buffer: true,
  },
  target: 'web',
};
