const path = require('path');
const webpack = require('webpack');

const DEBUG = !(process.env.NODE_ENV === 'production');
const VERBOSE = process.argv.includes('--verbose');

module.exports = {
  cache: DEBUG,

  stats: {
    colors: true,
    reasons: DEBUG,
    hash: VERBOSE,
    version: VERBOSE,
    timings: true,
    chunks: VERBOSE,
    chunkModules: VERBOSE,
    cached: VERBOSE,
    cachedAssets: VERBOSE,
  },

  entry: {
    app: './src/app.js',
    worker: './src/worker.js'
  },

  output: {
    publicPath: '/',
    sourcePrefix: '  ',
    path: path.join(__dirname, 'lib'),
    filename: '[name].js',
  },

  target: 'web',

  devtool: DEBUG ? 'cheap-module-eval-source-map' : false,

  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': `"${process.env.NODE_ENV || (DEBUG ? 'development' : 'production')}"` }),
    ...(DEBUG ? [] : [
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({ compress: { screw_ie8: true, warnings: VERBOSE } }),
      new webpack.optimize.AggressiveMergingPlugin(),
    ]),
  ],

  resolve: {
    extensions: ['.js'],
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, 'src')],
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      },
    ],
  },
};