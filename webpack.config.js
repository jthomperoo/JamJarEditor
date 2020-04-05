const path = require("path");
const webpack = require("webpack");

module.exports = {
    entry: {
        // startup: path.join(__dirname, "./src/frontend/startup/index.ts"),
        editor: path.join(__dirname, "./src/frontend/editor/index.ts"),
        startup: path.join(__dirname, "./src/frontend/startup/index.ts"),
    },
    plugins: [
        new webpack.ExternalsPlugin('commonjs', [
            'electron'
        ])
    ],
    output: {
        path: path.resolve(__dirname, "lib/")
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: [
                    path.resolve(__dirname, "node_modules/"),
                    path.resolve(__dirname, "src/backend/")
                ],
                options: {
                    compilerOptions: {
                        outDir: './lib'
                    }
                }
            },
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
};