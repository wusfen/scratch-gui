const path = require('path');
const webpack = require('webpack');

// Plugins
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// PostCss
const autoprefixer = require('autoprefixer');
const postcssVars = require('postcss-simple-vars');
const postcssImport = require('postcss-import');

// version
const packageJson = require('./package.json');
const version = packageJson.version;
const buildTime = [
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    new Date().getDate(),
    new Date().getHours(),
    new Date().getMinutes()
].map(e => ''.padStart.call(e, 2, 0)).join('');
const commit = require('child_process').execSync('git log --oneline -n 1')
    .toString()
    .split(' ')[0];

const isProduction = process.env.NODE_ENV === 'production';

const config = {
    devServer: {
        host: '0.0.0.0',
        port: process.env.PORT || 8601
    },
    entry: {
        gui: './src/playground/index.jsx',
        player: './src/playground/player.jsx',
    },
    output: isProduction ?
        {
            publicPath: process.env.PUBLIC_PATH || './',
            path: path.resolve(__dirname, 'dist'),
            filename: `[name].js____v${version}.${buildTime}.${commit}.js`,
            chunkFilename: 'chunks/[name].js____[contenthash:5].js'
        } :
        {},
    devtool: process.env.devtool,
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: [
                    path.resolve(__dirname, 'src'),
                    /node_modules[\\/]scratch-[^\\/]+[\\/]src/,
                    /node_modules[\\/]pify/,
                    /node_modules[\\/]@vernier[\\/]godirect/,
                    /node_modules[\\/]scratch-l10n[\\/]locales/,
                    /node_modules[\\/]scratch-blocks.msg/,
                    /node_modules[\\/]scratch-paint/,
                    /node_modules[\\/]scratch-render[\\/]src/,
                ],
                use: [
                    {

                        loader: 'babel-loader',
                        options: {
                            babelrc: false,
                            plugins: [
                                '@babel/plugin-syntax-dynamic-import',
                                '@babel/plugin-transform-async-to-generator',
                                '@babel/plugin-proposal-object-rest-spread',
                                ['react-intl', {messagesDir: './translations/messages/'}]
                            ],
                            presets: [
                                ['@babel/preset-env', {useBuiltIns: 'usage', modules: 'amd', corejs: 2}],
                                '@babel/preset-react'
                            ]
                        }
                    },
                    {
                        loader: 'eslint-loader',
                        options: {
                            fix: true,
                            quiet: true,
                            formatter: require('eslint-formatter-autolinkable-stylish'),
                        }
                    },
                    ...require('./path-replace-loader-files')
                ]
            },
            {
                test: /\.css$/,
                use: [
                    {loader: 'style-loader'},
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            importLoaders: 1,
                            localIdentName: '[name]_[local]_[hash:base64:5]',
                            camelCase: true
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: function () {
                                return [
                                    postcssImport,
                                    postcssVars,
                                    autoprefixer
                                ];
                            }
                        }
                    }
                ]
            },
            {
                test: /\.(svg|png|wav|gif|jpg|mp3|mp4)$/,
                oneOf: [
                    process.env.zip && {
                        test: /steps|thumbnails/,
                        use: [
                            {
                                loader: 'file-loader',
                                options: {
                                    name: '[name].[ext]____[hash:5].[ext]',
                                    publicPath: 'https://prod-xnpt-oss-2.vipthink.net/vipthinkcode-base/scratch/prod/static/assets/',
                                    emitFile: false,
                                }
                            }
                        ]
                    },
                    {
                        use: [
                            {
                                loader: 'file-loader',
                                options: {
                                    name: '[name].[ext]____[hash:5].[ext]',
                                    outputPath: 'static/assets/',
                                }
                            }
                        ]
                    }
                ].filter(e => e),
            },
        ]
    },
    resolve: {
        alias: {
            '@': path.resolve('./src/')
        }
    },
    resolveLoader: {
        alias: {
            'path-replace-loader': path.join(__dirname, './path-replace-loader-files/path-replace-loader.js')
        }
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'lib',
                    chunks: 'initial'
                }
            }
        }
    },
    stats: 'errors-only',
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
            'process.env.DEBUG': Boolean(process.env.DEBUG),
            'process.env.GA_ID':
                    `"${process.env.GA_ID || 'UA-000000-01'}"`
        }),
        new HtmlWebpackPlugin({
            chunks: ['lib', 'gui'],
            template: 'src/playground/index.ejs',
            sentryConfig: process.env.SENTRY_CONFIG ?
                `"${process.env.SENTRY_CONFIG}"` :
                null,
            title: '',
            PUBLIC_PATH: process.env.PUBLIC_PATH || '',
            version: `${version}`,
        }),
        new HtmlWebpackPlugin({
            chunks: ['lib', 'gui'],
            template: 'src/playground/index.ejs',
            sentryConfig: process.env.SENTRY_CONFIG ?
                `"${process.env.SENTRY_CONFIG}"` :
                null,
            title: '',
            PUBLIC_PATH: process.env.PUBLIC_PATH || '',
            version: `${version}`,
            filename: `index.${version}.html`,
        }),
        new HtmlWebpackPlugin({
            chunks: ['lib', 'player'],
            template: 'src/playground/index.ejs',
            filename: 'player.html',
            title: '',
            PUBLIC_PATH: process.env.PUBLIC_PATH || '',
            version: `${version}`,
        }),
        new HtmlWebpackPlugin({
            chunks: ['lib', 'player'],
            template: 'src/playground/index.ejs',
            filename: `player.${version}.html`,
            title: '',
            PUBLIC_PATH: process.env.PUBLIC_PATH || '',
            version: `${version}`,
        }),
        new CopyWebpackPlugin([
            {
                from: 'static',
                to: 'static'
            }
        ]),
        new CopyWebpackPlugin([
            {
                from: 'node_modules/scratch-blocks/media',
                to: 'static/blocks-media'
            }
        ]),
        new CopyWebpackPlugin([
            {
                from: 'extensions/**',
                to: 'static',
                context: 'src/examples'
            }
        ]),
        new CopyWebpackPlugin([
            {
                from: 'extension-worker.{js,js.map}',
                context: 'node_modules/scratch-vm/dist/web'
            }
        ]),
        new CopyWebpackPlugin([
            {
                from: 'path-replace-loader-files/node_modules/scratch-blocks/media', // 替换scratch-blocks/media中的图标
                to: 'static/blocks-media',
                force: true // 强制覆盖
            }
        ])
    ]
};


try {
    require('./webpack.config.local.js')(config);
} catch (_) {
    //
}

module.exports = config;
