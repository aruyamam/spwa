const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
   entry: ['@babel/polyfill', './src/js/index.js', './src/styles/style.scss'],
   output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'js/bundle.js',
   },
   devServer: {
      contentBase: './dist',
   },
   plugins: [
      new HtmlWebpackPlugin({
         filename: 'index.html',
         template: './src/index.html',
      }),
      new MiniCSSExtractPlugin({
         filename: 'css/style.css',
      }),
   ],
   devtool: 'source-map',
   module: {
      rules: [
         {
            test: /\.s?css$/,
            use: [
               MiniCSSExtractPlugin.loader,
               {
                  loader: 'css-loader',
                  options: {
                     sourceMap: true,
                  },
               },
               {
                  loader: 'postcss-loader',
                  options: {
                     sourceMap: true,
                     plugins: [require('autoprefixer')({ grid: true })],
                  },
               },
               {
                  loader: 'sass-loader',
                  options: {
                     sourceMap: true,
                  },
               },
            ],
         },
         {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
               loader: 'babel-loader',
            },
         },
      ],
   },
};
