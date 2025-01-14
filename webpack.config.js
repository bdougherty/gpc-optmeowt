/*
OptMeowt is licensed under the MIT License
Copyright (c) 2021 Kuba Alicki, Stanley Markman, Oliver Wang, Sebastian Zimmeck
Previous contributors: Kiryl Beliauski, Daniel Knopf, Abdallah Salia
privacy-tech-lab, https://privacytechlab.org/
*/


const CopyPlugin = require("copy-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const path = require("path")

// ! Implement a "frontend" export in order to use a dev serve
// ! Implement terser for production
// ! Implement file loader for assets

module.exports = (env, argv) => {
	const browser = env.chrome ? "chrome" : "firefox"	// default to firefox build
	const isProduction = argv.mode == "production"	// sets bool depending on build

	console.log("browser = ", browser);
	console.log("isProduction = ", isProduction);

	return {
		name: "background",
		// This is useful, plus we need it b/c otherwise we get an "unsafe eval" problem
		entry: {
			background: "./src/background/background.js",
			popup: "./src/popup/popup.js",
			options: "./src/options/options.js",
			contentScript: "./src/background/contentScript.js"
		},
		output: {
			filename: "[name].bundle.js",
			path: path.resolve(__dirname, `${isProduction ? "dist" : "dev"}/${browser}` ),
			// publicPath: "/",
		},
		devtool: isProduction ? "source-map" : "eval-source-map",
		devServer: {
			open: true,
			host: "localhost",
		},
		optimization: {
			minimize: true,
			minimizer: [new TerserPlugin()],
		},
		module: {
			rules: [
				{
					// compile for the correct browser
					test: /\.js$/,
					exclude: /node_modules/,
					loader: 'string-replace-loader',
					options: {
						search: /\$BROWSER/g,
						replace: browser,
					}
				},
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader'
					}
				},
				{
					test: /\.css$/,
					use: ["style-loader", "css-loader"]
				},
				{
					test: /\.(png|svg|jpe?g|gif)$/,
					loader: "file-loader",
					options: {
					  outputPath: "assets/",
					  publicPath: "assets/",
					  name: "[name].[ext]",
					}
				}
			]
		},
		
		// All of our "extra" stuff is currently being copies over
		// When time permits, lets have everything compile correclty
		plugins: [
			new CleanWebpackPlugin(),
			new CopyPlugin({
				patterns: [{ context: path.resolve(__dirname, "src"), from: "assets", to: "assets" }],
			}),
			new CopyPlugin({
				patterns: [{ context: path.resolve(__dirname, "src"), from: "manifest.json" }],
			}),
			new CopyPlugin({
				patterns: [{ context: path.resolve(__dirname, "src/background"), from: "dom.js" }],
			}),
			new CopyPlugin({
				patterns: [{ context: path.resolve(__dirname, "src/options"), from: "views", to: "views" }],
			}),
			new CopyPlugin({
				patterns: [{ context: path.resolve(__dirname, "src/options"), from: "components", to: "components" }],
			}),
			new HtmlWebpackPlugin({
				filename: "options.html",
				template: "src/options/options.html",
				chunks: ["options"],
			}),
			new HtmlWebpackPlugin({
				filename: "popup.html",
				template: "src/popup/popup.html",
				chunks: ["popup"],
			}),
		]
	}
}