const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SriPlugin = require('webpack-subresource-integrity');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const HappyPack = require('happypack');
const pkgJson = require('./package.json');
const outPath = path.resolve(__dirname, 'out');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  console.log(`Production build: ${isProd}`);

  if (!isProd) {
    pkgJson.version += '-SNAPSHOT';
  }

  const appEntry = [];
  if (!isProd) {
    appEntry.push('react-hot-loader/patch');
  }
  appEntry.push('./src/js/app');

  const happyThreadPool = HappyPack.ThreadPool({ size: 5 });
  const happyPackJSXLoader = new HappyPack({
    id: 'jsx',
    loaders: ['babel-loader'],
    threadPool: happyThreadPool
  });

  let cssAndSassChain = [
    {
      loader: 'css-loader',
      options: {
        sourceMap: true,
        modules: false
      }
    },
    {
      loader: 'sass-loader',
      options: {
        sourceMap: true
      }
    }
  ];

  const styleLoader = {
    loader: 'style-loader',
    options: {}
  };

  if (isProd) {
    cssAndSassChain = [MiniCssExtractPlugin.loader].concat(cssAndSassChain);
  } else {
    cssAndSassChain = [styleLoader].concat(cssAndSassChain);
  }

  const excludeModules = ['babel-runtime'];

  const vendorDeps = Object.keys(pkgJson.dependencies).filter(
    (key) => !excludeModules.includes(key)
  );

  const config = {
    devtool: isProd ? 'source-map' : 'cheap-module-source-map',
    entry: {
      vendor: vendorDeps,
      app: appEntry,
      fonts: [
        './src/fonts/SourceCodePro.scss',
        './src/fonts/SourceSansPro.scss',
        './src/fonts/FontAwesome.scss'
      ],
      style: ['./src/scss/style.scss']
    },
    output: {
      filename: 'js/[name]-[contenthash].js',
      path: outPath,
      publicPath: '/',
      crossOriginLoading: 'anonymous',
      pathinfo: !isProd
    },
    externals: {},
    resolve: {
      alias: {
        conf: path.resolve(__dirname, 'src/conf'),
        fonts: path.resolve(__dirname, 'src/fonts'),
        img: path.resolve(__dirname, 'src/img'),
        scss: path.resolve(__dirname, 'src/scss'),
        templates: path.resolve(__dirname, 'src/templates'),
        'react-dom': isProd ? 'react-dom' : '@hot-loader/react-dom'
      },
      fallback: { stream: false }
    },
    devServer: {
      inline: true,
      hot: true,
      stats: {
        colors: true
      },
      contentBase: path.join(__dirname, 'out'),
      port: 9080
    },
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.(js|jsx)$/,
          use: 'source-map-loader'
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /(node_modules)/,
          use: 'happypack/loader?id=jsx'
        },
        {
          test: /\.scss$/,
          use: cssAndSassChain
        },
        {
          test: /\.(png|jpe?g|gif)$/i,
          use: {
            loader: 'url-loader',
            options: {
              limit: 65535,
              name: 'img/[name].[ext]'
            }
          }
        },
        {
          test: /fonts\/.*\.svg$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: 'font',
                publicPath: '../font'
              }
            }
          ]
        },
        {
          test: /\.(woff2?|eot|[ot]tf)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: 'font',
                publicPath: '../font'
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          IS_BROWSER: JSON.stringify('true')
        }
      }),
      happyPackJSXLoader,
      new FaviconsWebpackPlugin({
        logo: './src/img/Honeylight-Icon-lg.png',
        cache: true,
        prefix: 'img',
        publicPath: '',
        favicons: {
          backgroundColor: '#000',
          theme_color: '#ffc800',
          orientation: 'portrait',
          icons: {
            android: true,
            appleIcon: true,
            appleStartup: false,
            coast: true,
            favicons: true,
            firefox: true,
            windows: true,
            yandex: true
          }
        }
      }),
      new MiniCssExtractPlugin({
        filename: 'css/[name]-[contenthash].css'
      }),
      new SriPlugin({
        hashFuncNames: ['sha256'],
        enabled: isProd
      }),
      new HtmlWebpackPlugin({
        title: 'Honeylight Editor',
        inject: false,
        template: path.resolve(__dirname, 'src/templates/index.ejs'),
        xhtml: true,
        chunks: ['vendor', 'fonts', 'style', 'app'],
        cssOnlyChunks: isProd ? ['fonts', 'style'] : [],
        cache: true,
        publicPath: '',
        meta: {
          'Content-Type': {
            'http-equiv': 'Content-Type',
            content: 'text/html; charset=utf-8'
          },
          'X-UA-Compatible': {
            'http-equiv': 'X-UA-Compatible',
            content: 'IE=edge,chrome=1'
          },
          viewport: 'width=device-width, initial-scale=1.0',
          description: pkgJson.description,
          version: pkgJson.version
        }
      })
    ]
  };

  if (!isProd) {
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
  }

  return config;
};
