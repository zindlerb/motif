module.exports = {
  entry: './app/app.js',
  eslint: {
    configFile: './.eslintrc.js'
  },
  output: {
    filename: 'bundle.js',
    path: './public/js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader!eslint-loader'
      },
      {
        test: /\.sass$/,
        loader: "style-loader!css-loader!sass-loader"
      },
    ]
  }
};
