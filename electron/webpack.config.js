/*

   Add back in eslint once the tab spacing issue is fixed with html.


*/

module.exports = {
  target: 'electron',
  entry: './app/entry.js',
  eslint: {
    configFile: './.eslintrc.js',
    quiet: true
  },
  output: {
    filename: 'bundle.js',
    path: './public/js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader!eslint-loader',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        loader: "style-loader!css-loader!sass-loader"
      },
    ]
  }
};
