const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const webpack = require('webpack');

const supportedLocales = ['en'];

module.exports = {
    module: {
        rules: [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: "babel-loader"
            }
        },
        {
            test: /\.html$/,
            use: [
            {
                loader: "html-loader",
                options: { minimize: true }
            }
            ]
        },
        {
            test: /\.(png|svg|jpg|gif)$/,
            use: [
                'file-loader'
            ]
        },
        {
            test: /\.css$/,
            use: [MiniCssExtractPlugin.loader, "css-loader"]
        }
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./src/index.html",
            filename: "./index.html"
        }),
        new MiniCssExtractPlugin({
            filename: "[name]-[contenthash].css",
            chunkFilename: "[id]-[contenthash].css"
        }),
		new webpack.ContextReplacementPlugin(
				/date\-fns[\/\\]/,
				new RegExp(`[/\\\\\](${supportedLocales.join('|')})[/\\\\\]`)
    	)
    ],
    output: {
        filename: '[name]-[contenthash].js'
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        },
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
            }),
            new OptimizeCSSAssetsPlugin({})
        ]
    },
    devServer: {
        proxy: { '/api': { target: 'http://localhost:8000', pathRewrite: { '^/api': '' } } },
        contentBase: require('path').resolve('static'),
        historyApiFallback: true,
    },
};
