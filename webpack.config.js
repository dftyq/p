const fs = require('fs');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const StylelintWebpackPlugin = require('stylelint-webpack-plugin');

// Our function that generates our html plugins
function generateHtmlPlugins(templateDir) {
  // Read files in template directory
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
  return templateFiles
    .map(item => item.split('.'))
    .filter(([, extension]) => Boolean(extension))
    .map(([name, extension]) => {
      // Create new HTMLWebpackPlugin with options
      return new HtmlWebpackPlugin({
        filename: `${name}.html`,
        minify: false,
        template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`),
        templateParameters: require('./src/templates/data.json')
      });
    });
}

const config = {
  entry: './src/scripts/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js'
  },
  devServer: {
    port: 8080,
    hot: true,
    watchFiles: ['src/**/*']
  },
  module: {
    rules: [
      {
        test: /\.ts(x)?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'resolve-url-loader',
            options: {
              root: path.resolve(__dirname, 'src')
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.svg$/,
        use: 'file-loader'
      },
      {
        test: /\.hbs$/,
        use: [
          {
            loader: 'handlebars-loader',
            options: {
              helperDirs: [path.join(__dirname, 'src', 'templates', 'helpers')],
              partialDirs: [path.join(__dirname, 'src', 'templates', 'partials')]
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'src/assets', to: 'assets' }]
    }),
    ...generateHtmlPlugins('./src/templates/views'),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false
    }),
    new MiniCssExtractPlugin(),
    new ESLintWebpackPlugin({
      extensions: ['ts']
    }),
    new StylelintWebpackPlugin(),
    new CleanWebpackPlugin()
  ],
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
};

module.exports = config;
