const path = require("path");
const webpack = require("webpack");
const dotenv = require("dotenv");
const proxy = require("./config/proxy");

const parseAllEnv = () => {
  return Object.keys(envObject).reduce((result, key) => {
    result[`process.env.${key}`] = JSON.stringify(envObject[key]);
    return result;
  }, {});
};

const envObject =
  process.env.NODE_ENV !== "development"
    ? dotenv.config().parsed
    : dotenv.config({ path: path.resolve("./.env.dev") }).parsed;
const globalVars = parseAllEnv();
const publicPath = process.env.PUBLIC_PATH || "/";
module.exports = {
  publicPath,
  configureWebpack: {
    plugins: [new webpack.DefinePlugin(globalVars)]
  },

  devServer: {
    proxy
    // 开启cors
  },

  pluginOptions: {
    "style-resources-loader": {
      preProcessor: "less",
      patterns: [path.resolve(__dirname, "./src/assets/less/variables.less")]
    }
  }
};
