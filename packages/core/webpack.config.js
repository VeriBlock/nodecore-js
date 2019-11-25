const path = require('path');

module.exports = {
  entry: './src/index.ts',
  mode: 'production',
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
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    library: 'VeriBlock',
    libraryTarget: 'umd',
    filename: 'browser.veriblock.js',
    path: path.resolve(__dirname, 'build/'),
  },
  node: {
    Buffer: true,
  },
  target: 'web',
};
