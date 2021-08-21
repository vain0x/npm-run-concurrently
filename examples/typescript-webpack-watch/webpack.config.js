const path = require("path")

const DIST_DIR = path.resolve(__dirname, "dist")

module.exports = {
  entry: "./src/index.ts",

  output: {
    filename: "bundle.js",
    path: DIST_DIR,
  },

  resolve: {
    extensions: [
      ".ts",
      ".tsx",
    ],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
      },
    ],
  },
}
